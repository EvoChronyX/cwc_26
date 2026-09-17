from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.team import Team
from app.models.game import GameSession
from app.models.sabotage import Sabotage, SabotageInstance
from app.services.audit_service import AuditService
from app.services.score_service import ScoreService
from app.websockets.connection_manager import manager


class SabotageService:
    @staticmethod
    async def get_catalog(db: AsyncSession) -> List[Dict[str, Any]]:
        result = await db.execute(select(Sabotage).order_by(Sabotage.id.asc()))
        catalog = result.scalars().all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "slug": s.slug,
                "description": s.description,
                "default_duration": s.default_duration,
                "defaultDuration": s.default_duration,
                "category": s.category,
                "badge_label": s.badge_label,
                "badgeLabel": s.badge_label,
            }
            for s in catalog
        ]

    @staticmethod
    async def deploy_sabotage(
        db: AsyncSession,
        attacker_team_id: int,
        target_team_id: int,
        sabotage_slug: str
    ) -> Dict[str, Any]:
        """Deploys a tactical sabotage payload against a target team."""
        now = datetime.now(timezone.utc)

        # 1. Fetch sabotage definition
        sab_res = await db.execute(select(Sabotage).where(Sabotage.slug == sabotage_slug))
        sab = sab_res.scalar_one_or_none()
        if not sab:
            raise ValueError(f"Unknown sabotage payload: {sabotage_slug}")

        # 2. Fetch target & attacker teams
        target_res = await db.execute(select(Team).where(Team.id == target_team_id))
        target_team = target_res.scalar_one_or_none()
        if not target_team:
            raise ValueError(f"Target team with ID {target_team_id} does not exist")

        attacker_res = await db.execute(select(Team).where(Team.id == attacker_team_id))
        attacker_team = attacker_res.scalar_one_or_none()
        attacker_name = attacker_team.team_name if attacker_team else f"Team {attacker_team_id}"

        # 3. Get active session
        session_res = await db.execute(select(GameSession).where(GameSession.is_active == True).limit(1))
        session = session_res.scalar_one_or_none()
        session_id = session.id if session else 1

        duration = sab.default_duration
        expires_at = now + timedelta(seconds=duration)

        # 4. Insert SabotageInstance
        instance = SabotageInstance(
            session_id=session_id,
            sabotage_id=sab.id,
            attacker_team_id=attacker_team_id,
            target_team_id=target_team_id,
            duration_seconds=duration,
            started_at=now,
            expires_at=expires_at,
            status="ACTIVE"
        )
        db.add(instance)
        await db.flush()

        # 5. Log in Kanaku Valaku
        await AuditService.log_event(
            db=db,
            category="SABOTAGE",
            actor_type="PLAYER_TEAM",
            actor_id=attacker_team_id,
            target_team_id=target_team_id,
            action_type="SABOTAGE_DEPLOYED",
            message=f"{sab.name} deployed by {attacker_name} against {target_team.team_name}.",
            color_class="text-sabotage-crimson font-bold",
            broadcast=True
        )

        threat_data = {
            "name": f"{sab.name.upper()} [ACTIVE]",
            "isActive": True,
            "timeLeft": duration,
            "target": target_team.team_name,
            "sub": f"Tactical disruption payload deployed against {target_team.team_name}."
        }

        # Broadcast sabotage deployment to all clients
        await manager.broadcast({
            "type": "SABOTAGE_DEPLOYED",
            "targetTeamId": target_team_id,
            "attackerTeamId": attacker_team_id,
            "sabotageName": sab.name,
            "duration": duration,
            "threat": threat_data
        })

        # Update leaderboard to reflect active disruption pill
        await ScoreService.broadcast_leaderboard(db)

        return threat_data

    @staticmethod
    async def neutralize_sabotage(
        db: AsyncSession,
        target_team_id: int,
        sabotage_name: Optional[str] = None,
        admin_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Administrative override defusing active disruptions on a team."""
        now = datetime.now(timezone.utc)

        target_res = await db.execute(select(Team).where(Team.id == target_team_id))
        target_team = target_res.scalar_one_or_none()
        target_name = target_team.team_name if target_team else f"Team {target_team_id}"

        # Neutralize active instances
        stmt = (
            update(SabotageInstance)
            .where(
                SabotageInstance.target_team_id == target_team_id,
                SabotageInstance.status == "ACTIVE"
            )
            .values(
                status="NEUTRALIZED",
                neutralized_by_admin_id=admin_id,
                neutralized_at=now
            )
        )
        await db.execute(stmt)
        await db.flush()

        sab_label = sabotage_name or "ALL DISRUPTIONS"
        await AuditService.log_event(
            db=db,
            category="NEUTRALIZE",
            actor_type="ADMIN",
            actor_id=admin_id,
            target_team_id=target_team_id,
            action_type="SABOTAGE_NEUTRALIZED",
            message=f"Admin OVERRIDE: Removed sabotage [{sab_label}] from {target_name}.",
            color_class="text-signal-emerald font-bold",
            broadcast=True
        )

        # Broadcast defusal event
        await manager.broadcast({
            "type": "SABOTAGE_NEUTRALIZED",
            "targetTeamId": target_team_id,
            "sabotageName": sab_label,
            "threat": {
                "name": "NONE ACTIVE",
                "isActive": False,
                "timeLeft": 0,
                "target": "",
                "sub": "Shields nominal. Hostile modifier neutralized by Admin."
            }
        })

        await ScoreService.broadcast_leaderboard(db)

        return {
            "success": True,
            "targetTeamId": target_team_id,
            "neutralized": sab_label
        }

    @staticmethod
    async def get_active_threat_for_team(db: AsyncSession, team_id: int) -> Dict[str, Any]:
        """Returns the active threat for a given team, auto-expiring overdue threats."""
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(SabotageInstance, Sabotage, Team)
            .join(Sabotage, SabotageInstance.sabotage_id == Sabotage.id)
            .join(Team, SabotageInstance.target_team_id == Team.id)
            .where(
                SabotageInstance.target_team_id == team_id,
                SabotageInstance.status == "ACTIVE"
            )
            .order_by(SabotageInstance.started_at.desc())
        )
        row = result.first()
        if not row:
            return {
                "name": "NONE ACTIVE",
                "isActive": False,
                "timeLeft": 0,
                "target": "",
                "sub": "Shields nominal. No hostile modifiers."
            }

        instance, sabotage, team = row
        expires_at = instance.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        remaining = int((expires_at - now).total_seconds())
        if remaining <= 0:
            instance.status = "EXPIRED"
            await db.flush()
            return {
                "name": "NONE ACTIVE",
                "isActive": False,
                "timeLeft": 0,
                "target": "",
                "sub": "Shields nominal. No hostile modifiers."
            }

        return {
            "name": f"{sabotage.name.upper()} [ACTIVE]",
            "isActive": True,
            "timeLeft": remaining,
            "target": team.team_name,
            "sub": f"Tactical disruption payload deployed against {team.team_name}."
        }
