from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # LOCK EVENT, SCORE, SABOTAGE, NEUTRALIZE, QUEUE, SYS, etc.
    actor_type = Column(String(30), nullable=False)  # ADMIN, PLAYER_TEAM, SYSTEM
    actor_id = Column(Integer, nullable=True)
    target_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    # Use JSONB with JSON fallback
    extra_metadata = Column("metadata", JSON().with_variant(JSONB, "postgresql"), nullable=False, default=dict)
    color_class = Column(String(100), nullable=False, default="text-primary")

    # Relationships
    target_team = relationship("Team", foreign_keys=[target_team_id])

    __table_args__ = (
        Index("ix_audit_logs_created_desc", created_at.desc()),
    )
