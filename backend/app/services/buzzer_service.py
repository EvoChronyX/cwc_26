import asyncio
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete

from app.models.team import Team
from app.models.game import GameSession
from app.models.buzzer import BuzzerEvent
from app.services.audit_service import AuditService
from app.websockets.connection_manager import manager


class BuzzerService:
    # State tracking active queue index
    _queue_index: int = 0
    _buzzer_lock = asyncio.Lock()

    @classmethod
    def get_queue_index(cls) -> int:
        return cls._queue_index

    @classmethod
    def set_queue_index(cls, index: int):
        cls._queue_index = index

    @staticmethod
    async def get_active_session(db: AsyncSession, for_update: bool = False) -> GameSession:
        query = select(GameSession).where(GameSession.is_active == True).limit(1)
        if for_update:
            try:
                query = query.with_for_update()
            except Exception:
                pass
        result = await db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            # Fallback create default session
            session = GameSession(
                session_code="STG-TOURNAMENT-2025-Q1",
                tournament_name="Code with Comali 2026",
                current_round=1,
                round_name="Round 01 - Technical Architecture",
                buzzers_armed=True,
                is_active=True
            )
            db.add(session)
            await db.flush()
        return session

    @staticmethod
    async def press_buzzer(
        db: AsyncSession,
        team_id: int,
        client_timestamp: Optional[float] = None,
        client_time_str: Optional[str] = None
    ) -> Dict[str, Any]:
        """Registers a buzzer press atomically under lock protection with precise timing telemetry."""
        async with BuzzerService._buzzer_lock:
            server_now = datetime.now(timezone.utc)
            session = await BuzzerService.get_active_session(db, for_update=True)

            if not session.buzzers_armed:
                return {
                    "success": False,
                    "reason": "CIRCUIT_LOCKED",
                    "message": "Buzzer circuit is locked by Game Master."
                }

            # 1. Check duplicate buzz in this round
            existing_res = await db.execute(
                select(BuzzerEvent).where(
                    BuzzerEvent.session_id == session.id,
                    BuzzerEvent.round_number == session.current_round,
                    BuzzerEvent.team_id == team_id
                )
            )
            if existing_res.scalar_one_or_none():
                return {
                    "success": False,
                    "reason": "ALREADY_BUZZED",
                    "message": "You have already registered a buzz for this challenge."
                }

            # 2. Determine current queue rank
            count_res = await db.execute(
                select(func.count(BuzzerEvent.id)).where(
                    BuzzerEvent.session_id == session.id,
                    BuzzerEvent.round_number == session.current_round
                )
            )
            current_count = count_res.scalar() or 0
            new_rank = current_count + 1

            # 3. Calculate accurate latency from armed moment or delta
            if session.buzzers_armed_at:
                armed_at = session.buzzers_armed_at
                if armed_at.tzinfo is None:
                    armed_at = armed_at.replace(tzinfo=timezone.utc)
                now_utc = server_now if server_now.tzinfo else server_now.replace(tzinfo=timezone.utc)
                elapsed = (now_utc - armed_at).total_seconds()
                latency_val = max(0.001, round(elapsed, 3))
            elif client_timestamp:
                now_ts = server_now.timestamp() if server_now.tzinfo else server_now.replace(tzinfo=timezone.utc).timestamp()
                delta = abs(now_ts - client_timestamp)
                latency_val = max(0.001, round(delta, 3))
            else:
                latency_val = 0.120

            server_time_str = server_now.strftime("%H:%M:%S.%f")[:-3]
            display_time = client_time_str if client_time_str else server_time_str

            # 4. Insert BuzzerEvent into database
            buzzer_event = BuzzerEvent(
                session_id=session.id,
                round_number=session.current_round,
                team_id=team_id,
                server_timestamp=server_now,
                client_timestamp=client_timestamp,
                client_time_str=display_time,
                latency_seconds=latency_val,
                queue_rank=new_rank,
                status="ACCEPTED",
                is_resolved=False
            )
            db.add(buzzer_event)
            await db.commit()

            # 5. Fetch Team details
            team_res = await db.execute(select(Team).where(Team.id == team_id))
            team = team_res.scalar_one_or_none()
            team_name = team.team_name if team else f"Team {team_id}"
            handles = f"{team.p1_handle} & {team.p2_handle}" if team else ""

            # 6. Log in Kanaku Valaku audit trail
            await AuditService.log_event(
                db=db,
                category="LOCK EVENT",
                actor_type="PLAYER_TEAM",
                actor_id=team_id,
                target_team_id=team_id,
                action_type="BUZZER_LOCK",
                message=f"Buzzer resolved to {team_name} ({handles}) in {latency_val:.3f}s. Client Time: {display_time}. Position: #{new_rank}.",
                color_class="text-signal-emerald font-bold",
                broadcast=True
            )

            # 7. Get full updated queue state
            queue_state = await BuzzerService.get_queue_state(db)

            # 8. Broadcast to ALL connected systems immediately
            broadcast_payload = {
                "type": "QUEUE_UPDATED",
                "queueState": queue_state,
                "strike": {
                    "teamId": team_id,
                    "teamName": team_name,
                    "rank": new_rank,
                    "timestamp": display_time,
                    "clientTime": display_time,
                    "serverTime": server_time_str,
                    "latency": f"{latency_val:.3f}s"
                }
            }
            await manager.broadcast(broadcast_payload)
            # Also emit BUZZER_STRIKE event type for listeners expecting that explicit name
            await manager.broadcast({
                **broadcast_payload,
                "type": "BUZZER_STRIKE"
            })

            return {
                "success": True,
                "pressed": True,
                "rank": new_rank,
                "time": display_time,
                "clientTime": display_time,
                "serverTime": server_time_str,
                "latency": f"{latency_val:.3f}s",
                "title": f"CONGRATS! YOU PRESSED {new_rank}{'ST' if new_rank == 1 else 'ND' if new_rank == 2 else 'RD' if new_rank == 3 else 'TH'}!",
                "subtitle": f"{'GOLD' if new_rank == 1 else 'SILVER' if new_rank == 2 else 'BRONZE'} RESPONSE PRIORITY SECURED // QUEUE #0{new_rank}",
                "queueState": queue_state
            }

    @staticmethod
    async def get_queue_state(db: AsyncSession) -> Dict[str, Any]:
        """Returns the current queue items and winner for the active round."""
        session = await BuzzerService.get_active_session(db)

        result = await db.execute(
            select(BuzzerEvent, Team)
            .join(Team, BuzzerEvent.team_id == Team.id)
            .where(
                BuzzerEvent.session_id == session.id,
                BuzzerEvent.round_number == session.current_round
            )
            .order_by(BuzzerEvent.queue_rank.asc())
        )
        rows = result.all()

        queue = []
        for event, team in rows:
            srv_str = event.server_timestamp.strftime("%H:%M:%S.%f")[:-3] if event.server_timestamp else "--:--:--"
            client_str = event.client_time_str if event.client_time_str else srv_str
            queue.append({
                "id": event.id,
                "teamId": team.id,
                "teamName": team.team_name,
                "name": f"{team.p1_handle} & {team.p2_handle}",
                "handle": team.p1_handle,
                "latency": f"{event.latency_seconds:.3f}s",
                "timestamp": client_str,
                "clientTime": client_str,
                "serverTime": srv_str,
                "rank": event.queue_rank,
            })

        idx = BuzzerService.get_queue_index()
        current_winner = queue[idx] if 0 <= idx < len(queue) else {
            "id": 0,
            "teamId": 0,
            "teamName": "NO FURTHER BUZZERS",
            "name": "QUEUE EXHAUSTED",
            "handle": "EMPTY",
            "latency": "0.000s",
            "timestamp": "--:--:--",
            "clientTime": "--:--:--",
            "serverTime": "--:--:--",
            "rank": 0
        }

        return {
            "buzzersArmed": session.buzzers_armed,
            "queueIndex": idx,
            "queue": queue,
            "currentWinner": current_winner
        }

    @staticmethod
    async def arm_buzzers(db: AsyncSession, admin_id: Optional[int] = None) -> Dict[str, Any]:
        session = await BuzzerService.get_active_session(db)
        session.buzzers_armed = True
        session.buzzers_armed_at = datetime.now(timezone.utc)
        await db.commit()

        await AuditService.log_event(
            db=db,
            category="BUZZERS",
            actor_type="ADMIN" if admin_id else "SYSTEM",
            actor_id=admin_id,
            action_type="BUZZERS_ARMED",
            message="Master circuit ARMED by Game Master.",
            color_class="text-signal-emerald font-bold",
            broadcast=True
        )

        state = await BuzzerService.get_queue_state(db)
        await manager.broadcast({
            "type": "BUZZERS_STATE_CHANGED",
            "buzzersArmed": True,
            "queueState": state
        })
        await manager.broadcast({
            "type": "BUZZERS_ARMED",
            "buzzersArmed": True,
            "queueState": state
        })
        return state

    @staticmethod
    async def lock_buzzers(db: AsyncSession, admin_id: Optional[int] = None) -> Dict[str, Any]:
        session = await BuzzerService.get_active_session(db)
        session.buzzers_armed = False
        await db.commit()

        await AuditService.log_event(
            db=db,
            category="BUZZERS",
            actor_type="ADMIN" if admin_id else "SYSTEM",
            actor_id=admin_id,
            action_type="BUZZERS_LOCKED",
            message="Master circuit LOCKED by Game Master.",
            color_class="text-sabotage-crimson font-bold",
            broadcast=True
        )

        state = await BuzzerService.get_queue_state(db)
        await manager.broadcast({
            "type": "BUZZERS_STATE_CHANGED",
            "buzzersArmed": False,
            "queueState": state
        })
        await manager.broadcast({
            "type": "BUZZERS_LOCKED",
            "buzzersArmed": False,
            "queueState": state
        })
        return state

    @staticmethod
    async def reset_buzzers(db: AsyncSession, admin_id: Optional[int] = None) -> Dict[str, Any]:
        session = await BuzzerService.get_active_session(db)
        # Delete buzzer events for this round
        await db.execute(
            delete(BuzzerEvent).where(
                BuzzerEvent.session_id == session.id,
                BuzzerEvent.round_number == session.current_round
            )
        )
        BuzzerService.set_queue_index(0)
        if session.buzzers_armed:
            session.buzzers_armed_at = datetime.now(timezone.utc)
        await db.commit()

        await AuditService.log_event(
            db=db,
            category="BUZZERS",
            actor_type="ADMIN" if admin_id else "SYSTEM",
            actor_id=admin_id,
            action_type="BUZZERS_RESET",
            message="Hardware buffers flushed & queue reset.",
            color_class="text-on-surface-variant",
            broadcast=True
        )

        state = await BuzzerService.get_queue_state(db)
        await manager.broadcast({
            "type": "BUZZERS_RESET",
            "queueState": state
        })
        await manager.broadcast({
            "type": "BUZZER_RESET",
            "queueState": state
        })
        return state

    @staticmethod
    async def advance_queue(db: AsyncSession, admin_id: Optional[int] = None) -> Dict[str, Any]:
        state = await BuzzerService.get_queue_state(db)
        queue = state["queue"]
        cur_idx = BuzzerService.get_queue_index()

        if cur_idx < len(queue) - 1:
            next_idx = cur_idx + 1
            BuzzerService.set_queue_index(next_idx)
            next_team = queue[next_idx]

            await AuditService.log_event(
                db=db,
                category="QUEUE ADVANCE",
                actor_type="ADMIN" if admin_id else "SYSTEM",
                actor_id=admin_id,
                action_type="QUEUE_ADVANCE",
                message=f"Admin advanced to next pressed team: #{next_team['rank']} {next_team['teamName']} ({next_team['latency']} latency).",
                color_class="text-acid-chartreuse font-bold",
                broadcast=True
            )
        else:
            await AuditService.log_event(
                db=db,
                category="QUEUE",
                actor_type="ADMIN" if admin_id else "SYSTEM",
                actor_id=admin_id,
                action_type="QUEUE_EXHAUSTED",
                message="Buzzer queue reached the end. No more pressed contenders.",
                color_class="text-on-surface-variant",
                broadcast=True
            )

        updated_state = await BuzzerService.get_queue_state(db)
        await manager.broadcast({
            "type": "QUEUE_ADVANCED",
            "queueIndex": BuzzerService.get_queue_index(),
            "queueState": updated_state
        })
        return updated_state
