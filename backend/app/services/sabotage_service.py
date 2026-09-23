from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.team import Team
from app.models.game import GameSession
from app.models.sabotage import Sabotage, SabotageInstance
from app.models.score import ScoreTransaction
from app.services.audit_service import AuditService
from app.services.score_service import ScoreService
from app.websockets.connection_manager import manager


class SabotageService:
    @staticmethod
    async def get_catalog(db: AsyncSession) -> List[Dict[str, Any]]:
        result = await db.execute(select(Sabotage).order_by(Sabotage.round_number.asc(), Sabotage.item_type.asc(), Sabotage.cost.asc(), Sabotage.id.asc()))
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
                "item_type": s.item_type,
                "itemType": s.item_type,
                "round_number": s.round_number,
                "roundNumber": s.round_number,
                "cost": s.cost,
                "level": s.level,
                "duration_effect": s.duration_effect,
                "durationEffect": s.duration_effect,
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
        """Deploys a tactical sabotage payload against a target team with balance deduction and lock checking."""
        now = datetime.now(timezone.utc)

        # 1. Fetch sabotage definition (check both slug and name)
        sab_res = await db.execute(
            select(Sabotage).where(
                (Sabotage.slug == sabotage_slug) | (Sabotage.name == sabotage_slug)
            )
        )
        sab = sab_res.scalar_one_or_none()
        if not sab:
            raise ValueError(f"Unknown sabotage payload: {sabotage_slug}")

        # Check round lock status
        session_res = await db.execute(select(GameSession).where(GameSession.is_active == True).limit(1))
        session = session_res.scalar_one_or_none()
        if session:
            if sab.round_number == 1 and not session.round1_unlocked:
                raise ValueError("Round 1 tactical armory is currently LOCKED by Host Arbiter.")
            elif sab.round_number == 2 and not session.round2_unlocked:
                raise ValueError("Round 2 tactical armory is currently LOCKED by Host Arbiter.")
        session_id = session.id if session else 1

        # 2. Fetch target & attacker teams
        target_res = await db.execute(select(Team).where(Team.id == target_team_id))
        target_team = target_res.scalar_one_or_none()
        if not target_team:
            raise ValueError(f"Target team with ID {target_team_id} does not exist")

        attacker_res = await db.execute(select(Team).where(Team.id == attacker_team_id))
        attacker_team = attacker_res.scalar_one_or_none()
        if not attacker_team:
            raise ValueError(f"Attacker team with ID {attacker_team_id} does not exist")
        attacker_name = attacker_team.team_name

        cost = sab.cost or 0
        if attacker_team.score < cost:
            raise ValueError(f"Insufficient event wallet points: Requires {cost} PTS, but squad only holds {attacker_team.score} PTS.")

        # Deduct wallet points from attacker
        attacker_team.score -= cost
        tx = ScoreTransaction(
            session_id=session_id,
            team_id=attacker_team_id,
            delta=-cost,
            resulting_score=attacker_team.score,
            reason=f"Sabotage Payload Deployed: {sab.name} (-{cost} PTS)"
        )
        db.add(tx)
        await db.flush()

        duration = sab.default_duration or 15
        expires_at = now + timedelta(seconds=duration)

        # 3. Check for Defensive Buffs (Shield / Reflective Shield) on target squad
        shield_stmt = (
            select(SabotageInstance, Sabotage)
            .join(Sabotage, SabotageInstance.sabotage_id == Sabotage.id)
            .where(
                SabotageInstance.target_team_id == target_team_id,
                SabotageInstance.attacker_team_id == target_team_id,
                SabotageInstance.status == "ACTIVE",
                SabotageInstance.expires_at > now,
                Sabotage.item_type == "POWERUP"
            )
            .order_by(SabotageInstance.started_at.desc())
        )
        shield_res = await db.execute(shield_stmt)
        active_buff_row = shield_res.first()

        # CASE A: TARGET HAS REFLECTIVE SHIELD ACTIVE
        if active_buff_row and ("reflect" in active_buff_row[1].slug.lower() or "reflect" in active_buff_row[1].name.lower()):
            reflect_buff = active_buff_row[1]

            # Sabotage is reflected back to the attacker team!
            instance = SabotageInstance(
                session_id=session_id,
                sabotage_id=sab.id,
                attacker_team_id=attacker_team_id,
                target_team_id=attacker_team_id, # Struck by their own attack!
                duration_seconds=duration,
                started_at=now,
                expires_at=expires_at,
                status="ACTIVE"
            )
            db.add(instance)
            await db.flush()

            await AuditService.log_event(
                db=db,
                category="SABOTAGE",
                actor_type="PLAYER_TEAM",
                actor_id=attacker_team_id,
                target_team_id=attacker_team_id,
                action_type="SABOTAGE_REFLECTED",
                message=f"REFLECTIVE SHIELD TRIGGERED! {sab.name} from {attacker_name} was REFLECTED back onto {attacker_name} by {target_team.team_name}!",
                color_class="text-acid-chartreuse font-bold",
                broadcast=True
            )

            threat_data = {
                "name": f"{sab.name.upper()} [ACTIVE - REFLECTED]",
                "isActive": True,
                "timeLeft": duration,
                "target": attacker_name,
                "sub": f"Sabotage was reflected back by {target_team.team_name}'s shield! Your squad is affected!"
            }

            # Broadcast sabotage reflected event to all clients
            await manager.broadcast({
                "type": "SABOTAGE_REFLECTED",
                "originalTargetTeamId": target_team_id,
                "originalTargetName": target_team.team_name,
                "attackerTeamId": attacker_team_id,
                "attackerId": attacker_team_id,
                "attackerTeamName": attacker_name,
                "victimTeamId": attacker_team_id,
                "targetTeamId": attacker_team_id,
                "targetId": attacker_team_id,
                "sabotageName": sab.name,
                "sabotageSlug": sab.slug,
                "duration": duration,
                "shieldName": reflect_buff.name,
                "threat": threat_data
            })

            await manager.broadcast({
                "type": "SCORE_UPDATED",
                "team_id": attacker_team_id,
                "score": attacker_team.score
            })

            await db.commit()
            await ScoreService.broadcast_leaderboard(db)
            return threat_data

        # CASE B: TARGET HAS STANDARD SHIELD ACTIVE (BLOCKS SABOTAGE)
        elif active_buff_row and ("shield" in active_buff_row[1].slug.lower() or "shield" in active_buff_row[1].name.lower()):
            shield_buff = active_buff_row[1]

            await AuditService.log_event(
                db=db,
                category="SABOTAGE",
                actor_type="PLAYER_TEAM",
                actor_id=attacker_team_id,
                target_team_id=target_team_id,
                action_type="SABOTAGE_BLOCKED",
                message=f"SHIELD DEFENSE ACTIVATED! {sab.name} deployed by {attacker_name} was BLOCKED by {target_team.team_name}'s tactical shield!",
                color_class="text-signal-emerald font-bold",
                broadcast=True
            )

            # Broadcast sabotage blocked event to all clients
            await manager.broadcast({
                "type": "SABOTAGE_BLOCKED",
                "targetTeamId": target_team_id,
                "targetId": target_team_id,
                "targetTeamName": target_team.team_name,
                "attackerTeamId": attacker_team_id,
                "attackerId": attacker_team_id,
                "attackerTeamName": attacker_name,
                "sabotageName": sab.name,
                "sabotageSlug": sab.slug,
                "shieldName": shield_buff.name,
            })

            await manager.broadcast({
                "type": "SCORE_UPDATED",
                "team_id": attacker_team_id,
                "score": attacker_team.score
            })

            await db.commit()
            await ScoreService.broadcast_leaderboard(db)

            return {
                "name": "SABOTAGE BLOCKED",
                "isActive": False,
                "timeLeft": 0,
                "target": target_team.team_name,
                "sub": f"Sabotage payload was absorbed by {target_team.team_name}'s shield."
            }

        # CASE C: NORMAL SABOTAGE (NO SHIELD ACTIVE)
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

        # Log in Kanaku Valaku
        await AuditService.log_event(
            db=db,
            category="SABOTAGE",
            actor_type="PLAYER_TEAM",
            actor_id=attacker_team_id,
            target_team_id=target_team_id,
            action_type="SABOTAGE_DEPLOYED",
            message=f"{sab.name} ({cost} PTS) deployed by {attacker_name} against {target_team.team_name}.",
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
            "targetId": target_team_id,
            "targetTeamName": target_team.team_name,
            "attackerTeamId": attacker_team_id,
            "attackerId": attacker_team_id,
            "attackerTeamName": attacker_name,
            "sabotageName": sab.name,
            "sabotageSlug": sab.slug,
            "duration": duration,
            "threat": threat_data
        })

        await manager.broadcast({
            "type": "SCORE_UPDATED",
            "team_id": attacker_team_id,
            "score": attacker_team.score
        })

        await db.commit()

        # Update leaderboard to reflect active disruption pill & new score
        await ScoreService.broadcast_leaderboard(db)

        return threat_data

    @staticmethod
    async def activate_powerup(
        db: AsyncSession,
        team_id: int,
        powerup_slug: str
    ) -> Dict[str, Any]:
        """Purchases and activates an advantage powerup for a squad."""
        now = datetime.now(timezone.utc)

        # 1. Fetch item definition (support both slug and name)
        sab_res = await db.execute(
            select(Sabotage).where(
                (Sabotage.slug == powerup_slug) | (Sabotage.name == powerup_slug)
            )
        )
        sab = sab_res.scalar_one_or_none()
        if not sab:
            raise ValueError(f"Unknown power-up advantage: {powerup_slug}")

        # Check round lock status
        session_res = await db.execute(select(GameSession).where(GameSession.is_active == True).limit(1))
        session = session_res.scalar_one_or_none()
        if session:
            if sab.round_number == 1 and not session.round1_unlocked:
                raise ValueError("Round 1 advantage armory is currently LOCKED by Host Arbiter.")
            elif sab.round_number == 2 and not session.round2_unlocked:
                raise ValueError("Round 2 advantage armory is currently LOCKED by Host Arbiter.")
        session_id = session.id if session else 1

        team_res = await db.execute(select(Team).where(Team.id == team_id))
        team = team_res.scalar_one_or_none()
        if not team:
            raise ValueError(f"Team with ID {team_id} does not exist")

        cost = sab.cost or 0
        if team.score < cost:
            raise ValueError(f"Insufficient event wallet points: Requires {cost} PTS, but squad only holds {team.score} PTS.")

        # Deduct cost
        team.score -= cost
        tx = ScoreTransaction(
            session_id=session_id,
            team_id=team_id,
            delta=-cost,
            resulting_score=team.score,
            reason=f"Advantage Activated: {sab.name} (-{cost} PTS)"
        )
        db.add(tx)
        await db.flush()

        # If this is a Defensive Shield or Reflective Shield, persist an active buff
        slug_lower = sab.slug.lower()
        name_lower = sab.name.lower()
        is_shield = "shield" in slug_lower or "shield" in name_lower
        is_reflect = "reflect" in slug_lower or "reflect" in name_lower
        duration = sab.default_duration or 0

        if is_shield or is_reflect:
            duration = duration or 300
            expires_at = now + timedelta(seconds=duration)

            # Expire any previous active shields for this squad
            await db.execute(
                update(SabotageInstance)
                .where(
                    SabotageInstance.target_team_id == team_id,
                    SabotageInstance.attacker_team_id == team_id,
                    SabotageInstance.status == "ACTIVE"
                )
                .values(status="EXPIRED")
            )

            # Insert active shield instance
            shield_inst = SabotageInstance(
                session_id=session_id,
                sabotage_id=sab.id,
                attacker_team_id=team_id,
                target_team_id=team_id,
                duration_seconds=duration,
                started_at=now,
                expires_at=expires_at,
                status="ACTIVE"
            )
            db.add(shield_inst)
            await db.flush()

        # Log in Kanaku Valaku
        await AuditService.log_event(
            db=db,
            category="SCORE",
            actor_type="PLAYER_TEAM",
            actor_id=team_id,
            target_team_id=team_id,
            action_type="POWERUP_ACTIVATED",
            message=f"{team.team_name} activated advantage: {sab.name} ({sab.duration_effect or ''}) for {cost} PTS.",
            color_class="text-acid-chartreuse font-bold",
            broadcast=True
        )

        await db.commit()

        # Broadcast score update & powerup activated event
        await manager.broadcast({
            "type": "SCORE_UPDATED",
            "team_id": team.id,
            "score": team.score,
        })

        await manager.broadcast({
            "type": "POWERUP_ACTIVATED",
            "teamId": team.id,
            "team_id": team.id,
            "teamName": team.team_name,
            "powerupName": sab.name,
            "powerupSlug": sab.slug,
            "duration": duration,
            "cost": cost,
            "newScore": team.score,
            "isShield": is_shield,
            "isReflect": is_reflect,
            "durationEffect": sab.duration_effect
        })

        await ScoreService.broadcast_leaderboard(db)

        return {
            "success": True,
            "teamId": team.id,
            "powerupName": sab.name,
            "powerupSlug": sab.slug,
            "cost": cost,
            "newScore": team.score,
            "duration": duration,
            "isShield": is_shield,
            "isReflect": is_reflect,
            "durationEffect": sab.duration_effect
        }

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
                SabotageInstance.status == "ACTIVE",
                Sabotage.item_type == "SABOTAGE"
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
