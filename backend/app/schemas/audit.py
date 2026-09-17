from typing import Optional, Any, Dict
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    time: str
    category: str
    message: str
    colorClass: str
    metadata: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


class AuditLogCreate(BaseModel):
    category: str
    actor_type: str
    actor_id: Optional[int] = None
    target_team_id: Optional[int] = None
    action_type: str
    message: str
    color_class: Optional[str] = "text-primary"
    metadata: Optional[Dict[str, Any]] = None
