from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.team import Team
from app.models.admin import AdminUser
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.services.audit_service import AuditService
from app.services.score_service import ScoreService
from app.websockets.connection_manager import manager


class AuthService:
    @staticmethod
    async def register_or_login_player(
        db: AsyncSession,
        team_name: str,
        p1_handle: str,
        p2_handle: str,
        avatar_id: str,
        password: str
    ) -> Dict[str, Any]:
        """Registers a new squad or authenticates an existing squad with plain password."""
        team_name_clean = team_name.strip().upper()

        result = await db.execute(select(Team).where(Team.team_name == team_name_clean))
        team = result.scalar_one_or_none()

        if team:
            # Existing team -> Validate password directly
            if not verify_password(password, team.password):
                raise ValueError("Invalid squad access key for this team.")
            
            # Update handles and avatar only if non-empty values were provided
            if p1_handle and p1_handle.strip():
                team.p1_handle = p1_handle.strip()
            if p2_handle and p2_handle.strip():
                team.p2_handle = p2_handle.strip()
            if avatar_id and avatar_id.strip():
                team.avatar_id = avatar_id.strip()
            team.status = "CONNECTED"
            await db.flush()
        else:
            # New team registration requires member handles
            if not p1_handle or not p1_handle.strip() or not p2_handle or not p2_handle.strip():
                raise ValueError("New squad detected! Please enter Member 01 and Member 02 names to complete registration.")

            # Register new team with initial score 0
            team = Team(
                team_name=team_name_clean,
                p1_handle=p1_handle.strip(),
                p2_handle=p2_handle.strip(),
                avatar_id=avatar_id or "avatar-1",
                password=password,  # Stored directly as plain text per user instruction
                lane=f"Lane #0{((await db.scalar(select(func.count(Team.id)))) or 0) + 1}",
                status="CONNECTED",
                score=100,
                r1_score=0,
                r2_score=0,
                r3_live_score=0,
                win_rate="0%",
                streak=0
            )
            db.add(team)
            await db.flush()

            await AuditService.log_event(
                db=db,
                category="SYS",
                actor_type="PLAYER_TEAM",
                actor_id=team.id,
                target_team_id=team.id,
                action_type="TEAM_REGISTERED",
                message=f"Squad {team.team_name} ({p1_handle} & {p2_handle}) registered into tournament roster.",
                color_class="text-acid-chartreuse font-bold",
                broadcast=True
            )

        # Broadcast refreshed leaderboard & team roster immediately to all players and admins
        try:
            await ScoreService.broadcast_leaderboard(db)
        except Exception as e:
            pass

        token = create_access_token({
            "sub": str(team.id),
            "team_id": team.id,
            "team_name": team.team_name,
            "role": "player"
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "player",
            "entity_id": team.id,
            "display_name": team.team_name,
            "team": {
                "id": team.id,
                "teamName": team.team_name,
                "p1": team.p1_handle,
                "p2": team.p2_handle,
                "avatarId": team.avatar_id,
                "lane": team.lane,
                "score": team.score,
                "status": team.status,
            }
        }

    @staticmethod
    async def login_admin(
        db: AsyncSession,
        gm_id: str,
        password: str
    ) -> Dict[str, Any]:
        """Authenticates a Game Master using plain text credentials."""
        gm_id_clean = gm_id.strip()

        result = await db.execute(select(AdminUser).where(AdminUser.gm_id == gm_id_clean))
        admin = result.scalar_one_or_none()

        # Valid admin IDs supported by the platform
        allowed_default_gm_ids = {settings.DEFAULT_ADMIN_GM_ID.lower(), "cwc_thala"}

        if not admin:
            # Auto-provision default admin if credentials match platform defaults
            if gm_id_clean.lower() in allowed_default_gm_ids and password == settings.DEFAULT_ADMIN_PASSWORD:
                admin = AdminUser(
                    gm_id=gm_id_clean,
                    username="Game Master" if gm_id_clean == "cwc_thala" else "Host Arbiter",
                    password=settings.DEFAULT_ADMIN_PASSWORD,
                    role="GAME_MASTER",
                    is_active=True
                )
                db.add(admin)
                await db.commit()
                await db.refresh(admin)
            else:
                raise ValueError("Invalid Game Master identifier or security password.")
        else:
            if not verify_password(password, admin.password):
                # Fallback check for platform master key
                if password != settings.DEFAULT_ADMIN_PASSWORD:
                    raise ValueError("Invalid Game Master identifier or security password.")

        token = create_access_token({
            "sub": str(admin.id),
            "admin_id": admin.id,
            "gm_id": admin.gm_id,
            "role": "admin"
        })

        await AuditService.log_event(
            db=db,
            category="SYS",
            actor_type="ADMIN",
            actor_id=admin.id,
            action_type="ADMIN_LOGIN",
            message=f"Game Master console unlocked by {admin.gm_id}.",
            color_class="text-primary font-bold",
            broadcast=True
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "entity_id": admin.id,
            "display_name": admin.username,
        }
