import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger("cwc.websockets")


class ConnectionManager:
    def __init__(self):
        # All active connections
        self.active_connections: Set[WebSocket] = set()
        # Role partitioned
        self.admin_connections: Set[WebSocket] = set()
        self.team_connections: Dict[int, Set[WebSocket]] = {}
        # Socket metadata
        self.socket_info: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, client_info: Dict[str, Any]):
        await websocket.accept()
        self.active_connections.add(websocket)
        self.socket_info[websocket] = client_info

        role = client_info.get("role")
        if role == "admin":
            self.admin_connections.add(websocket)
        elif role == "player":
            team_id = client_info.get("team_id")
            if team_id:
                if team_id not in self.team_connections:
                    self.team_connections[team_id] = set()
                self.team_connections[team_id].add(websocket)

        logger.info(f"WebSocket client connected: role={role}, total={len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        info = self.socket_info.pop(websocket, {})
        self.active_connections.discard(websocket)
        self.admin_connections.discard(websocket)

        role = info.get("role")
        if role == "player":
            team_id = info.get("team_id")
            if team_id and team_id in self.team_connections:
                self.team_connections[team_id].discard(websocket)
                if not self.team_connections[team_id]:
                    del self.team_connections[team_id]

        logger.info(f"WebSocket client disconnected: total={len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts a JSON message to all connected clients."""
        if not self.active_connections:
            return
        payload = json.dumps(message)
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def send_to_admins(self, message: Dict[str, Any]):
        """Broadcasts a message exclusively to Game Master admin consoles."""
        payload = json.dumps(message)
        for connection in list(self.admin_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)

    async def send_to_team(self, team_id: int, message: Dict[str, Any]):
        """Sends a message to all terminals connected for a specific team."""
        connections = self.team_connections.get(team_id, set())
        payload = json.dumps(message)
        for connection in list(connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)

    async def send_personal(self, websocket: WebSocket, message: Dict[str, Any]):
        """Sends a direct message to a specific connection."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            self.disconnect(websocket)


manager = ConnectionManager()
