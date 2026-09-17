from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gm_id = Column(String(50), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)  # Plain text per competition configuration
    role = Column(String(50), nullable=False, default="GAME_MASTER")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    score_transactions = relationship("ScoreTransaction", back_populates="admin_user")
    neutralized_sabotages = relationship("SabotageInstance", back_populates="neutralized_by_admin")
