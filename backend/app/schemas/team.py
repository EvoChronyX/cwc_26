from typing import List, Optional
from pydantic import BaseModel, Field


class TeamResponse(BaseModel):
    id: int
    teamName: str
    p1: str
    p2: str
    handle: str
    avatarId: str
    lane: str
    score: int
    r1: int
    r2: int
    r3Live: int
    winRate: str
    streak: int
    status: str
    activeSabotages: List[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class TeamRegisterResponse(BaseModel):
    team: TeamResponse
    token: str
