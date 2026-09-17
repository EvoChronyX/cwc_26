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
