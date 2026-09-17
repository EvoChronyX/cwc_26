from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.team import Team
from app.models.admin import AdminUser

security_bearer = HTTPBearer(auto_error=False)


async def get_current_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


async def get_current_team(
    payload: Dict[str, Any] = Depends(get_current_token_payload),
    db: AsyncSession = Depends(get_db)
) -> Team:
    role = payload.get("role")
    team_id = payload.get("team_id")
    if role != "player" or not team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires authenticated player squad credentials"
        )
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team profile not found"
        )
    return team


async def get_current_admin(
    payload: Dict[str, Any] = Depends(get_current_token_payload),
    db: AsyncSession = Depends(get_db)
) -> AdminUser:
    role = payload.get("role")
    admin_id = payload.get("admin_id")
    if role != "admin" or not admin_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Game Master administrative privileges"
        )
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Game Master account inactive or not found"
        )
    return admin
