import pytest
from httpx import AsyncClient
from app.services.sso_service import sso_service

@pytest.mark.asyncio
async def test_auth_protected_endpoint_no_token(client: AsyncClient):
    """Verify that protected endpoints return 401 without a token."""
    response = await client.get("/venture/insights")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_auth_protected_endpoint_invalid_token(client: AsyncClient):
    """Verify that protected endpoints return 401 with an invalid token."""
    response = await client.get(
        "/venture/insights",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401
    assert "Invalid authentication credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_auth_access_with_valid_token(client: AsyncClient):
    """Verify that a valid token allows access to protected endpoints."""
    # Generate a valid token using the SSO service
    access_token, _ = sso_service.generate_sso_token("default", "test_user", ["AuthenticatedUser"])
    
    response = await client.get(
        "/venture/insights",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    # It should pass auth
    assert response.status_code != 401

@pytest.mark.asyncio
async def test_admin_access_with_sovereign_role(client: AsyncClient):
    """Verify that a user with Sovereign role can access admin restricted endpoints."""
    access_token, _ = sso_service.generate_sso_token("default", "admin_user", ["Sovereign"])
    
    response = await client.get(
        "/venture/insights", 
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
