from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sabotage(Base):
    __tablename__ = "sabotages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    default_duration = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False, default="DISRUPTION")
    badge_label = Column(String(50), nullable=False, default="Available")
    item_type = Column(String(30), nullable=False, default="SABOTAGE")  # POWERUP or SABOTAGE
    round_number = Column(Integer, nullable=False, default=1)           # 1 or 2
    cost = Column(Integer, nullable=False, default=15)                  # Points cost
    level = Column(String(20), nullable=False, default="Medium")        # Easy, Medium, Hard
    duration_effect = Column(String(100), nullable=True)                # e.g. "5 min", "Skip 1 task"

    # Relationships
    instances = relationship("SabotageInstance", back_populates="sabotage")


class SabotageInstance(Base):
    __tablename__ = "sabotage_instances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    sabotage_id = Column(Integer, ForeignKey("sabotages.id", ondelete="RESTRICT"), nullable=False)
    attacker_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    target_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), nullable=False, default="ACTIVE")  # ACTIVE, EXPIRED, NEUTRALIZED
    neutralized_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    neutralized_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    session = relationship("GameSession", back_populates="sabotage_instances")
    sabotage = relationship("Sabotage", back_populates="instances")
    attacker_team = relationship("Team", foreign_keys=[attacker_team_id], back_populates="attack_sabotages")
    target_team = relationship("Team", foreign_keys=[target_team_id], back_populates="targeted_sabotages")
    neutralized_by_admin = relationship("AdminUser", back_populates="neutralized_sabotages")

    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE', 'EXPIRED', 'NEUTRALIZED')", name="chk_sabotage_inst_status"),
        Index("ix_sabotage_instances_target_status", "target_team_id", "status"),
        Index("ix_sabotage_instances_expires_at", "expires_at"),
    )
