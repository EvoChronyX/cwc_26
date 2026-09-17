from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ScoreAdjustRequest(BaseModel):
    team_id: int
    delta: int
    reason: Optional[str] = "Admin Score Adjustment"


class FloorGrantRequest(BaseModel):
    team_id: Optional[int] = None
    delta: int = 50


class ScoreTransactionResponse(BaseModel):
    id: int
    team_id: int
    delta: int
    resulting_score: int
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}
