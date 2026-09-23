from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import AdminUser
from app.models.game import GameSession
from app.services.audit_service import AuditService
from app.websockets.connection_manager import manager

router = APIRouter(prefix="/rounds", tags=["Tournament Rounds & Armory Locks"])


class RoundLockUpdateRequest(BaseModel):
    round_number: int
    unlocked: bool


@router.get("/state")
async def get_round_locks_state(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GameSession).where(GameSession.is_active == True).limit(1)
    )
    session = result.scalar_one_or_none()
    return {
        "round1Unlocked": session.round1_unlocked if session else False,
        "round2Unlocked": session.round2_unlocked if session else False,
        "currentRound": session.current_round if session else 1,
        "buzzersArmed": session.buzzers_armed if session else True,
    }


@router.post("/lock-state")
async def set_round_lock_state(
    req: RoundLockUpdateRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if req.round_number not in (1, 2):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid round number: only Round 1 and Round 2 armory locks can be modified."
        )

    result = await db.execute(
        select(GameSession).where(GameSession.is_active == True).limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        session = GameSession(
            session_code="STG-TOURNAMENT-2026-Q1",
            tournament_name="Code with Comali 2026",
            current_round=req.round_number,
            round1_unlocked=False,
            round2_unlocked=False,
            is_active=True
        )
        db.add(session)
        await db.flush()

    if req.round_number == 1:
        session.round1_unlocked = req.unlocked
    elif req.round_number == 2:
        session.round2_unlocked = req.unlocked

    await db.commit()

    action_label = "UNLOCKED" if req.unlocked else "LOCKED"
    await AuditService.log_event(
        db=db,
        category="LOCK",
        actor_type="ADMIN",
        actor_id=admin.id,
        action_type="ROUND_LOCK_TOGGLED",
        message=f"Admin {action_label} Round {req.round_number} Tactical Arsenal.",
        color_class="text-signal-emerald font-bold" if req.unlocked else "text-sabotage-crimson font-bold",
        broadcast=True
    )

    # Broadcast live state change to all player arenas and admin screens
    await manager.broadcast({
        "type": "ROUND_LOCK_STATE_CHANGED",
        "roundNumber": req.round_number,
        "unlocked": req.unlocked,
        "round1Unlocked": session.round1_unlocked,
        "round2Unlocked": session.round2_unlocked
    })

    return {
        "success": True,
        "roundNumber": req.round_number,
        "unlocked": req.unlocked,
        "round1Unlocked": session.round1_unlocked,
        "round2Unlocked": session.round2_unlocked
    }
