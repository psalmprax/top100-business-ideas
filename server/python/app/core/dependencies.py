from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.services.sso_service import sso_service
from app.core.database import get_async_session

security = HTTPBearer()

async def get_current_user(
    auth: HTTPAuthorizationCredentials = Security(security)
) -> Dict[str, Any]:
    """
    Dependency to verify the JWT token and return the user payload.
    Expected to be called by the Go API Gateway with a valid Bearer token.
    """
    token = auth.credentials
    result = sso_service.verify_sso_token(token)
    
    if not result.get("valid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {result.get('error')}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return result.get("payload")

async def get_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Dependency to verify the user has admin/sovereign roles."""
    roles = current_user.get("roles", [])
    if "EnterpriseAdmin" not in roles and "Sovereign" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to administrative roles.",
        )
    return current_user
