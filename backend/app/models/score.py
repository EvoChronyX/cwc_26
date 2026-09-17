from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScoreTransaction(Base):
    __tablename__ = "score_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    delta = Column(Integer, nullable=False)
    resulting_score = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    admin_user_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("GameSession", back_populates="score_transactions")
    team = relationship("Team", back_populates="score_transactions")
    admin_user = relationship("AdminUser", back_populates="score_transactions")

    __table_args__ = (
        Index("ix_score_transactions_team_created", "team_id", created_at.desc()),
    )
