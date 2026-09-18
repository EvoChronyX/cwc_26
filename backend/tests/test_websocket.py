import asyncio
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_concurrent_buzzer_strikes(client: AsyncClient):
    """Simulates 4 competing teams hitting the buzzer simultaneously to verify atomic ordering."""
    tokens = []
    for i in range(1, 5):
        res = await client.post("/api/auth/player/register-or-login", json={
            "team_name": f"CONCURRENT SQUAD {i}",
            "p1_handle": f"P1_{i}",
            "p2_handle": f"P2_{i}",
            "avatar_id": f"avatar-{i}",
            "password": "pass"
        })
        tokens.append(res.json()["access_token"])

    # Reset buzzers
    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}
    await client.post("/api/buzzer/reset", headers=admin_headers)

    # Fire all 4 buzzers concurrently via asyncio.gather
    async def buzz(token):
        return await client.post(
            "/api/buzzer/buzz",
            json={},
            headers={"Authorization": f"Bearer {token}"}
        )

    responses = await asyncio.gather(*(buzz(t) for t in tokens))
    
    # Verify all 4 succeeded
    for r in responses:
        assert r.status_code == 200

    ranks = [r.json()["rank"] for r in responses]
    # Ranks must be a unique permutation of [1, 2, 3, 4] with zero collision
    assert sorted(ranks) == [1, 2, 3, 4]

    # Verify queue state reflects all 4 in order
    q_res = await client.get("/api/buzzer/queue")
    queue = q_res.json()["queue"]
    assert len(queue) == 4
    assert [item["rank"] for item in queue] == [1, 2, 3, 4]


from unittest.mock import AsyncMock, patch
from app.websockets.connection_manager import manager


@pytest.mark.asyncio
async def test_buzzer_broadcast_lifecycle(client: AsyncClient):
    """Verifies that arm, lock, reset, and buzzer presses broadcast the exact WebSocket events needed by clients."""
    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}

    player_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "BROADCAST TEST TEAM",
        "p1_handle": "P1",
        "p2_handle": "P2",
        "avatar_id": "avatar-1",
        "password": "pass"
    })
    player_headers = {"Authorization": f"Bearer {player_res.json()['access_token']}"}

    with patch.object(manager, 'broadcast', new_callable=AsyncMock) as mock_broadcast:
        # 1. Arm Buzzers
        arm_res = await client.post("/api/buzzer/arm", headers=admin_headers)
        assert arm_res.status_code == 200
        # Verify broadcast was called with BUZZERS_STATE_CHANGED and BUZZERS_ARMED
        broadcast_types = [call.args[0]["type"] for call in mock_broadcast.call_args_list]
        assert "BUZZERS_STATE_CHANGED" in broadcast_types
        assert "BUZZERS_ARMED" in broadcast_types

        mock_broadcast.reset_mock()

        # 2. Press Buzzer with client timing
        buzz_res = await client.post(
            "/api/buzzer/buzz",
            json={"client_timestamp": 1234567.89, "client_time_str": "12:00:00.123"},
            headers=player_headers
        )
        assert buzz_res.status_code == 200
        broadcast_types = [call.args[0]["type"] for call in mock_broadcast.call_args_list]
        assert "QUEUE_UPDATED" in broadcast_types
        assert "BUZZER_STRIKE" in broadcast_types
        # Find the strike payload
        strike_payload = next(call.args[0] for call in mock_broadcast.call_args_list if call.args[0]["type"] == "QUEUE_UPDATED")
        assert strike_payload["strike"]["clientTime"] == "12:00:00.123"

        mock_broadcast.reset_mock()

        # 3. Lock Buzzers
        lock_res = await client.post("/api/buzzer/lock", headers=admin_headers)
        assert lock_res.status_code == 200
        broadcast_types = [call.args[0]["type"] for call in mock_broadcast.call_args_list]
        assert "BUZZERS_STATE_CHANGED" in broadcast_types
        assert "BUZZERS_LOCKED" in broadcast_types

        mock_broadcast.reset_mock()

        # 4. Reset Buzzers
        reset_res = await client.post("/api/buzzer/reset", headers=admin_headers)
        assert reset_res.status_code == 200
        broadcast_types = [call.args[0]["type"] for call in mock_broadcast.call_args_list]
        assert "BUZZERS_RESET" in broadcast_types
        assert "BUZZER_RESET" in broadcast_types
