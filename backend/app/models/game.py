from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_code = Column(String(50), unique=True, nullable=False, index=True)
    tournament_name = Column(String(150), nullable=False, default="Code with Comali 2026")
    current_round = Column(Integer, nullable=False, default=1)
    round_name = Column(String(100), nullable=False, default="Round 01 - Technical Architecture")
    buzzers_armed = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    buzzer_events = relationship("BuzzerEvent", back_populates="session", cascade="all, delete-orphan")
    sabotage_instances = relationship("SabotageInstance", back_populates="session", cascade="all, delete-orphan")
    score_transactions = relationship("ScoreTransaction", back_populates="session", cascade="all, delete-orphan")
