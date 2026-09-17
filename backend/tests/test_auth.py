import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_player_registration_and_login(client: AsyncClient):
    # 1. Register new squad
    register_payload = {
        "team_name": "TEAM TITAN",
        "p1_handle": "CYBORG_01",
        "p2_handle": "TITAN_CORE",
        "avatar_id": "avatar-3",
        "password": "plain_titan_pass_123"
    }
    res = await client.post("/api/auth/player/register-or-login", json=register_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "player"
    assert data["display_name"] == "TEAM TITAN"
    assert data["team_data"]["p1"] == "CYBORG_01"

    # 2. Login again with correct plain text password
    res_login = await client.post("/api/auth/player/register-or-login", json=register_payload)
    assert res_login.status_code == 200

    # 3. Attempt login with incorrect password
    bad_payload = register_payload.copy()
    bad_payload["password"] = "wrong_password"
    res_bad = await client.post("/api/auth/player/register-or-login", json=bad_payload)
    assert res_bad.status_code == 400
    assert "Invalid squad access key" in res_bad.json()["detail"]


from app.core.config import settings


@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient):
    # 1. Login with valid Game Master credentials
    admin_payload = {
        "gm_id": settings.DEFAULT_ADMIN_GM_ID,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    }
    res = await client.post("/api/auth/admin/login", json=admin_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"

    # 2. Attempt login with invalid password
    bad_payload = {
        "gm_id": "GM_ARBITER_07",
        "password": "incorrect_master_key"
    }
    res_bad = await client.post("/api/auth/admin/login", json=bad_payload)
    assert res_bad.status_code == 401
