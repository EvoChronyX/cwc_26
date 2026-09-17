import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sabotage_deployment_and_neutralization(client: AsyncClient):
    # 1. Register attacker and target teams
    attacker_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "ATTACKER SQUAD",
        "p1_handle": "ATTACK_1",
        "p2_handle": "ATTACK_2",
        "avatar_id": "avatar-1",
        "password": "pass"
    })
    attacker_token = attacker_res.json()["access_token"]
    attacker_id = attacker_res.json()["entity_id"]

    target_res = await client.post("/api/auth/player/register-or-login", json={
        "team_name": "TARGET SQUAD",
        "p1_handle": "TARGET_1",
        "p2_handle": "TARGET_2",
        "avatar_id": "avatar-2",
        "password": "pass"
    })
    target_id = target_res.json()["entity_id"]

    from app.core.config import settings

    admin_res = await client.post("/api/auth/admin/login", json={
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Friendly fire check -> Must fail
    ff_res = await client.post(
        "/api/sabotages/deploy",
        json={"sabotage_slug": "sound-distortion", "target_team_id": attacker_id},
        headers={"Authorization": f"Bearer {attacker_token}"}
    )
    assert ff_res.status_code == 400
    assert "Friendly fire prohibited" in ff_res.json()["detail"]

    # 3. Valid deployment against target team
    deploy_res = await client.post(
        "/api/sabotages/deploy",
        json={"sabotage_slug": "sound-distortion", "target_team_id": target_id},
        headers={"Authorization": f"Bearer {attacker_token}"}
    )
    assert deploy_res.status_code == 200
    threat = deploy_res.json()
    assert threat["isActive"] is True
    assert threat["target"] == "TARGET SQUAD"

    # 4. Check target threat endpoint
    threat_check = await client.get(f"/api/sabotages/threat/{target_id}")
    assert threat_check.status_code == 200
    assert threat_check.json()["isActive"] is True

    # 5. Admin overrides & neutralizes sabotage
    neut_res = await client.post(
        "/api/sabotages/neutralize",
        json={"target_team_id": target_id, "sabotage_name": "Sound Distortion"},
        headers=admin_headers
    )
    assert neut_res.status_code == 200
    assert neut_res.json()["success"] is True

    # 6. Verify target threat is now cleared
    cleared_check = await client.get(f"/api/sabotages/threat/{target_id}")
    assert cleared_check.status_code == 200
    assert cleared_check.json()["isActive"] is False
    assert cleared_check.json()["name"] == "NONE ACTIVE"
