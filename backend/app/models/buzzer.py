from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class BuzzerEvent(Base):
    __tablename__ = "buzzer_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    round_number = Column(Integer, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    server_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    latency_seconds = Column(Float, nullable=False)
    queue_rank = Column(Integer, nullable=False)
    status = Column(String(30), nullable=False, default="ACCEPTED")
    is_resolved = Column(Boolean, nullable=False, default=False)

    # Relationships
    session = relationship("GameSession", back_populates="buzzer_events")
    team = relationship("Team", back_populates="buzzer_events")

    __table_args__ = (
        UniqueConstraint("session_id", "round_number", "team_id", name="uq_buzzer_session_round_team"),
        Index("ix_buzzer_events_session_round_rank", "session_id", "round_number", "queue_rank"),
        Index("ix_buzzer_events_timestamp_asc", "server_timestamp"),
    )
