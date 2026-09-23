from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.audit import AuditLog
from app.websockets.connection_manager import manager


class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        category: str,
        actor_type: str,
        action_type: str,
        message: str,
        actor_id: Optional[int] = None,
        target_team_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        color_class: str = "text-primary",
        broadcast: bool = True,
    ) -> AuditLog:
        """Appends an event to the authoritative audit log and broadcasts it live."""
        log = AuditLog(
            category=category,
            actor_type=actor_type,
            actor_id=actor_id,
            target_team_id=target_team_id,
            action_type=action_type,
            message=message,
            extra_metadata=metadata or {},
            color_class=color_class,
        )
        db.add(log)
        await db.flush()

        time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

        if broadcast:
            await manager.broadcast({
                "type": "AUDIT_LOG_APPENDED",
                "log": {
                    "id": log.id,
                    "time": time_str,
                    "category": log.category,
                    "message": log.message,
                    "colorClass": log.color_class,
                }
            })

        return log

    @staticmethod
    async def get_logs(
        db: AsyncSession,
        category: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
        if category and category.upper() != "ALL":
            query = query.where(AuditLog.category.ilike(f"%{category}%"))

        result = await db.execute(query)
        logs = result.scalars().all()

        formatted = []
        for l in logs:
            time_str = l.created_at.strftime("%H:%M:%S") if l.created_at else "--:--:--"
            formatted.append({
                "id": l.id,
                "time": time_str,
                "category": l.category,
                "message": l.message,
                "colorClass": l.color_class,
                "metadata": l.extra_metadata
            })
        return formatted

    @staticmethod
    async def clear_logs(db: AsyncSession, admin_id: int):
        """Purges history buffer and writes a mandatory audit record of the purge."""
        await db.execute(delete(AuditLog))
        await db.flush()

        # Add mandatory record of the purge action itself
        purge_log = AuditLog(
            category="SYS",
            actor_type="ADMIN",
            actor_id=admin_id,
            action_type="AUDIT_PURGED",
            message="Audit buffer cleared by Admin.",
            extra_metadata={},
            color_class="text-on-surface-variant",
        )
        db.add(purge_log)
        await db.flush()

        time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")
        await manager.broadcast({
            "type": "AUDIT_LOGS_CLEARED",
            "log": {
                "id": purge_log.id,
                "time": time_str,
                "category": "SYS",
                "message": "Audit buffer cleared by Admin.",
                "colorClass": "text-on-surface-variant"
            }
        })

    @staticmethod
    async def clear_all_records(db: AsyncSession, admin_id: int):
        """Purges all audit logs, score transactions, buzzer events, and sabotage instances."""
        from app.models.score import ScoreTransaction
        from app.models.buzzer import BuzzerEvent
        from app.models.sabotage import SabotageInstance

        await db.execute(delete(AuditLog))
        await db.execute(delete(ScoreTransaction))
        await db.execute(delete(BuzzerEvent))
        await db.execute(delete(SabotageInstance))
        await db.flush()

        purge_log = AuditLog(
            category="SYS",
            actor_type="ADMIN",
            actor_id=admin_id,
            action_type="ALL_RECORDS_PURGED",
            message="All Kanaku Valaku records, buzzer queues, and scoring history purged by Admin.",
            extra_metadata={},
            color_class="text-sabotage-crimson font-bold",
        )
        db.add(purge_log)
        await db.commit()

        time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")
        await manager.broadcast({
            "type": "AUDIT_LOGS_CLEARED",
            "log": {
                "id": purge_log.id,
                "time": time_str,
                "category": "SYS",
                "message": "All Kanaku Valaku records purged by Admin.",
                "colorClass": "text-sabotage-crimson font-bold"
            }
        })
        await manager.broadcast({
            "type": "BUZZERS_RESET",
            "queueState": {"queue": [], "queueIndex": 0, "buzzersArmed": True}
        })

