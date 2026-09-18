import json
import logging
from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.websockets.connection_manager import manager
from app.services.score_service import ScoreService
from app.services.buzzer_service import BuzzerService
from app.services.audit_service import AuditService

logger = logging.getLogger("cwc.ws_handler")


async def handle_websocket(websocket: WebSocket, token: Optional[str] = None):
    # Authenticate token if present
    client_info = {"role": "spectator"}
    if token:
        payload = decode_access_token(token)
        if payload:
            role = payload.get("role")
            if role == "player":
                client_info = {
                    "role": "player",
                    "team_id": payload.get("team_id"),
                    "team_name": payload.get("team_name"),
                }
            elif role == "admin":
                client_info = {
                    "role": "admin",
                    "admin_id": payload.get("admin_id"),
                    "gm_id": payload.get("gm_id"),
                }

    await manager.connect(websocket, client_info)

    # Send initial state snapshot
    try:
        async with AsyncSessionLocal() as db:
            teams = await ScoreService.get_all_teams(db)
            queue_state = await BuzzerService.get_queue_state(db)
            recent_logs = await AuditService.get_logs(db, category="ALL", limit=25)

            init_payload = {
                "type": "INIT_STATE",
                "teams": teams,
                "queueState": queue_state,
                "recentLogs": recent_logs,
                "clientInfo": client_info
            }
            await manager.send_personal(websocket, init_payload)
    except Exception as e:
        logger.error(f"Error compiling init state for websocket: {e}")

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except Exception:
                continue

            msg_type = data.get("type")

            if msg_type == "PING":
                await manager.send_personal(websocket, {"type": "PONG"})

            elif msg_type == "BUZZ_IN":
                if client_info.get("role") == "player" and client_info.get("team_id"):
                    team_id = client_info["team_id"]
                    client_time = data.get("client_time")
                    client_time_str = data.get("client_time_str")
                    async with AsyncSessionLocal() as db:
                        res = await BuzzerService.press_buzzer(
                            db=db,
                            team_id=team_id,
                            client_timestamp=client_time,
                            client_time_str=client_time_str
                        )
                        await manager.send_personal(websocket, {
                            "type": "BUZZ_ACK",
                            "result": res
                        })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")
        manager.disconnect(websocket)
