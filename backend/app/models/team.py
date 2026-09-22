from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Index, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_name = Column(String(100), unique=True, nullable=False, index=True)
    p1_handle = Column(String(100), nullable=False)
    p2_handle = Column(String(100), nullable=False)
    avatar_id = Column(String(50), nullable=False, default="avatar-1")
    password = Column(String(255), nullable=False)  # Plain text per competition configuration
    lane = Column(String(50), nullable=False, default="Lane #01")
    status = Column(String(30), nullable=False, default="CONNECTED")
    score = Column(Integer, nullable=False, default=0)
    r0_score = Column(Integer, nullable=False, default=0)
    r1_score = Column(Integer, nullable=False, default=0)
    r2_score = Column(Integer, nullable=False, default=0)
    r3_live_score = Column(Integer, nullable=False, default=0)
    win_rate = Column(String(20), nullable=False, default="0%")
    streak = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    buzzer_events = relationship("BuzzerEvent", back_populates="team", cascade="all, delete-orphan")
    attack_sabotages = relationship("SabotageInstance", foreign_keys="SabotageInstance.attacker_team_id", back_populates="attacker_team")
    targeted_sabotages = relationship("SabotageInstance", foreign_keys="SabotageInstance.target_team_id", back_populates="target_team")
    score_transactions = relationship("ScoreTransaction", back_populates="team", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('CONNECTED', 'DISCONNECTED', 'STANDBY')", name="chk_teams_status"),
        Index("ix_teams_score_desc", score.desc()),
    )
