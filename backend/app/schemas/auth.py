from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PlayerLoginOrRegisterRequest(BaseModel):
    team_name: str = Field(..., min_length=2, max_length=100)
    p1_handle: Optional[str] = Field(default="", max_length=100)
    p2_handle: Optional[str] = Field(default="", max_length=100)
    avatar_id: Optional[str] = Field(default="avatar-1", max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


class AdminLoginRequest(BaseModel):
    gm_id: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # "player" or "admin"
    entity_id: int
    display_name: str
    team_data: Optional[Dict[str, Any]] = None
