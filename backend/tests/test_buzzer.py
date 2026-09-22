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
        json={"client_timestamp": 1234567.89, "client_time_str": "09:15:32.450"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert buzz1_res.status_code == 200
    buzz1_data = buzz1_res.json()
    assert buzz1_data["pressed"] is True
    assert buzz1_data["rank"] == 1
    assert buzz1_data["clientTime"] == "09:15:32.450"

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
    assert q_data["queue"][0]["clientTime"] == "09:15:32.450"
    assert q_data["currentWinner"]["clientTime"] == "09:15:32.450"

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


@pytest.mark.asyncio
async def test_start_and_end_round_lifecycle(client: AsyncClient):
    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Start Round 0
    start_res = await client.post(
        "/api/buzzer/round/start",
        json={"round_number": 0, "round_name": "Round 0 - Mani Adi"},
        headers=admin_headers
    )
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["round"] == 0
    assert start_data["isActive"] is True
    assert start_data["isEnded"] is False
    assert start_data["buzzersArmed"] is True

    # 2. End Round 0
    end_res = await client.post(
        "/api/buzzer/round/end",
        json={"round_number": 0},
        headers=admin_headers
    )
    assert end_res.status_code == 200
    end_data = end_res.json()
    assert end_data["isActive"] is False
    assert end_data["isEnded"] is True
    assert end_data["buzzersArmed"] is False
    assert "highestScorer" in end_data


