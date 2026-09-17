from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_token_payload
from app.schemas.auth import PlayerLoginOrRegisterRequest, AdminLoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/player/register-or-login", response_model=TokenResponse)
async def player_register_or_login(
    req: PlayerLoginOrRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        data = await AuthService.register_or_login_player(
            db=db,
            team_name=req.team_name,
            p1_handle=req.p1_handle,
            p2_handle=req.p2_handle,
            avatar_id=req.avatar_id,
            password=req.password
        )
        return TokenResponse(
            access_token=data["access_token"],
            token_type="bearer",
            role="player",
            entity_id=data["entity_id"],
            display_name=data["display_name"],
            team_data=data["team"]
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(
    req: AdminLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        data = await AuthService.login_admin(
            db=db,
            gm_id=req.gm_id,
            password=req.password
        )
        return TokenResponse(
            access_token=data["access_token"],
            token_type="bearer",
            role="admin",
            entity_id=data["entity_id"],
            display_name=data["display_name"]
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me")
async def get_current_profile(
    payload: dict = Depends(get_current_token_payload)
):
    return {
        "role": payload.get("role"),
        "sub": payload.get("sub"),
        "team_id": payload.get("team_id"),
        "admin_id": payload.get("admin_id"),
        "team_name": payload.get("team_name"),
        "gm_id": payload.get("gm_id"),
    }
