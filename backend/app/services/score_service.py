from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.team import Team
from app.models.game import GameSession
from app.models.score import ScoreTransaction
from app.models.sabotage import SabotageInstance
from app.services.audit_service import AuditService
from app.websockets.connection_manager import manager


class ScoreService:
    @staticmethod
    async def adjust_score(
        db: AsyncSession,
        team_id: int,
        delta: int,
        reason: str = "Admin Score Adjustment",
        admin_id: Optional[int] = None,
        broadcast: bool = True
    ) -> Dict[str, Any]:
        """Atomically increments/decrements a team's score using an ACID transaction."""
        # Get active session
        session_res = await db.execute(
            select(GameSession).where(GameSession.is_active == True).limit(1)
        )
        game_session = session_res.scalar_one_or_none()
        session_id = game_session.id if game_session else 1

        # Atomic SQL update to prevent lost updates / race conditions
        stmt = (
            update(Team)
            .where(Team.id == team_id)
            .values(score=Team.score + delta)
            .returning(Team.id, Team.team_name, Team.score)
        )
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            raise ValueError(f"Team with ID {team_id} does not exist")

        team_id, team_name, new_score = row

        # Record in immutable ledger
        tx = ScoreTransaction(
            session_id=session_id,
            team_id=team_id,
            delta=delta,
            resulting_score=new_score,
            reason=reason,
            admin_user_id=admin_id,
        )
        db.add(tx)
        await db.flush()

        # Log event in Kanaku Valaku
        delta_str = f"+{delta}" if delta > 0 else f"{delta}"
        await AuditService.log_event(
            db=db,
            category="SCORE",
            actor_type="ADMIN" if admin_id else "SYSTEM",
            actor_id=admin_id,
            target_team_id=team_id,
            action_type="SCORE_ADJUSTMENT",
            message=f"Adjusted score for {team_name} ({delta_str} pts). New total: {new_score}.",
            color_class="text-primary",
            broadcast=broadcast,
        )

        if broadcast:
            # Broadcast direct score mutation
            await manager.broadcast({
                "type": "SCORE_UPDATED",
                "team_id": team_id,
                "score": new_score,
                "delta": delta,
            })
            # Also broadcast full refreshed roster for podium/table sync
            await ScoreService.broadcast_leaderboard(db)

        return {
            "team_id": team_id,
            "team_name": team_name,
            "score": new_score,
            "delta": delta,
        }

    @staticmethod
    async def grant_floor(
        db: AsyncSession,
        team_id: int,
        delta: int = 50,
        admin_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Awards floor points (default +50) to the validated buzzer winner."""
        res = await ScoreService.adjust_score(
            db=db,
            team_id=team_id,
            delta=delta,
            reason="Floor Arbitrage Points (+50)",
            admin_id=admin_id,
            broadcast=False
        )

        await AuditService.log_event(
            db=db,
            category="ARBITRAGE",
            actor_type="ADMIN" if admin_id else "SYSTEM",
            actor_id=admin_id,
            target_team_id=team_id,
            action_type="FLOOR_AWARD",
            message=f"Floor points (+{delta}) awarded to {res['team_name']}.",
            color_class="text-signal-emerald font-bold",
            broadcast=True
        )

        # Broadcast score & leaderboard
        await manager.broadcast({
            "type": "SCORE_UPDATED",
            "team_id": team_id,
            "score": res["score"],
            "delta": delta,
        })
        await ScoreService.broadcast_leaderboard(db)

        return res

    @staticmethod
    async def get_all_teams(db: AsyncSession) -> List[Dict[str, Any]]:
        """Returns all connected teams formatted for the React frontend."""
        # Query teams joined with active sabotages using eager loading
        result = await db.execute(
            select(Team)
            .options(
                selectinload(Team.targeted_sabotages).selectinload(SabotageInstance.sabotage)
            )
            .order_by(Team.score.desc(), Team.id.asc())
        )
        teams = result.scalars().all()

        formatted = []
        for t in teams:
            # Check active sabotages
            active_sabs = [
                s.sabotage.name for s in t.targeted_sabotages if s.status == "ACTIVE"
            ]
            formatted.append({
                "id": t.id,
                "teamName": t.team_name,
                "p1": t.p1_handle,
                "p2": t.p2_handle,
                "handle": f"{t.p1_handle} // {t.p2_handle}",
                "avatarId": t.avatar_id,
                "lane": t.lane,
                "score": t.score,
                "r1": t.r1_score,
                "r2": t.r2_score,
                "r3Live": t.r3_live_score,
                "winRate": t.win_rate,
                "streak": t.streak,
                "status": t.status,
                "activeSabotages": active_sabs,
            })
        return formatted

    @staticmethod
    async def broadcast_leaderboard(db: AsyncSession):
        teams = await ScoreService.get_all_teams(db)
        await manager.broadcast({
            "type": "LEADERBOARD_UPDATED",
            "teams": teams
        })
