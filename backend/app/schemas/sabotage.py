from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class SabotageDefinition(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    default_duration: int = 15
    defaultDuration: Optional[int] = None
    category: str = "DISRUPTION"
    badge_label: str = "Available"
    badgeLabel: Optional[str] = None

    model_config = {"from_attributes": True}


class SabotageDeployRequest(BaseModel):
    sabotage_slug: str
    target_team_id: int


class ActiveThreatResponse(BaseModel):
    name: str
    isActive: bool
    timeLeft: int
    target: str
    sub: str


class SabotageNeutralizeRequest(BaseModel):
    target_team_id: int
    sabotage_name: Optional[str] = None
