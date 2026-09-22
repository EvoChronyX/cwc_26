import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_score_adjustments(client: AsyncClient):
    # 1. Register team
    team_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "TEAM SCORE TEST",
        "p1_handle": "PLAYER_A",
        "p2_handle": "PLAYER_B",
        "avatar_id": "avatar-1",
        "password": "score_pass_123"
    })
    team_data = team_res.json()
    team_id = team_data["entity_id"]

    # 2. Login admin
    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Adjust score (+100)
    adjust_res = await client.post(
        "/api/scores/adjust",
        json={"team_id": team_id, "delta": 100, "reason": "Rapid Adjust (+100)"},
        headers=admin_headers
    )
    assert adjust_res.status_code == 200
    assert adjust_res.json()["score"] == 100

    # 4. Grant floor (+50)
    floor_res = await client.post(
        "/api/scores/floor-grant",
        json={"team_id": team_id},
        headers=admin_headers
    )
    assert floor_res.status_code == 200
    assert floor_res.json()["score"] == 150

    # 5. Check audit log (Kanaku Valaku) has recorded this
    audit_res = await client.get("/api/audit/logs?category=SCORE")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any("Adjusted score for TEAM SCORE TEST (+100 pts)" in l["message"] for l in logs)


@pytest.mark.asyncio
async def test_award_correct_answer(client: AsyncClient):
    # 1. Register team
    team_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "TEAM MANI ADI",
        "p1_handle": "PLAYER_C",
        "p2_handle": "PLAYER_D",
        "avatar_id": "avatar-2",
        "password": "pass_mani_adi"
    })
    team_id = team_res.json()["entity_id"]

    from app.core.config import settings
    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Award correct answer (+1 pt in R0)
    ans_res = await client.post(
        "/api/scores/correct-answer",
        json={"team_id": team_id, "round_number": 0},
        headers=admin_headers
    )
    assert ans_res.status_code == 200
    data = ans_res.json()
    assert data["r0_score"] == 1
    assert data["score"] == 1

    # 3. Second correct answer (+1 pt again)
    ans_res2 = await client.post(
        "/api/scores/correct-answer",
        json={"team_id": team_id, "round_number": 0},
        headers=admin_headers
    )
    assert ans_res2.status_code == 200
    data2 = ans_res2.json()
    assert data2["r0_score"] == 2
    assert data2["score"] == 2

