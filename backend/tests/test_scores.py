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
