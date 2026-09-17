import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_buzzer_lifecycle_and_queue(client: AsyncClient):
    # 1. Register two competing squads
    team1_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "SQUAD ALPHA",
        "p1_handle": "ALPHA_1",
        "p2_handle": "ALPHA_2",
        "avatar_id": "avatar-1",
        "password": "pass1"
    })
    token1 = team1_res.json()["access_token"]

    team2_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "SQUAD BETA",
        "p1_handle": "BETA_1",
        "p2_handle": "BETA_2",
        "avatar_id": "avatar-2",
        "password": "pass2"
    })
    token2 = team2_res.json()["access_token"]

    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Reset buzzers first to ensure clean state
    await client.post("/api/buzzer/reset", headers=admin_headers)

    # 2. Team 1 buzzes in
    buzz1_res = await client.post(
        "/api/buzzer/buzz",
        json={"client_timestamp": 1234567.89},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert buzz1_res.status_code == 200
    buzz1_data = buzz1_res.json()
    assert buzz1_data["pressed"] is True
    assert buzz1_data["rank"] == 1

    # 3. Duplicate buzz by Team 1 -> Rejected
    dup_res = await client.post(
        "/api/buzzer/buzz",
        json={"client_timestamp": 1234570.00},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"]

    # 4. Team 2 buzzes in -> Rank 2
    buzz2_res = await client.post(
        "/api/buzzer/buzz",
        json={"client_timestamp": 1234575.10},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert buzz2_res.status_code == 200
    assert buzz2_res.json()["rank"] == 2

    # 5. Check queue state
    queue_res = await client.get("/api/buzzer/queue")
    assert queue_res.status_code == 200
    q_data = queue_res.json()
    assert len(q_data["queue"]) == 2
    assert q_data["currentWinner"]["teamName"] == "SQUAD ALPHA"

    # 6. Admin advances queue to next player
    advance_res = await client.post("/api/buzzer/advance", headers=admin_headers)
    assert advance_res.status_code == 200
    adv_data = advance_res.json()
    assert adv_data["currentWinner"]["teamName"] == "SQUAD BETA"

    # 7. Admin locks circuit -> New buzz fails
    await client.post("/api/buzzer/lock", headers=admin_headers)
    lock_test_res = await client.post(
        "/api/buzzer/buzz",
        json={},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert lock_test_res.status_code == 400
