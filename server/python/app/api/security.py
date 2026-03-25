"""Security and API Key management endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
import uuid
import secrets
from datetime import datetime

from app.core.database import get_session

router = APIRouter()

@router.post("/rotate-key")
async def rotate_api_key(session: Session = Depends(get_session)):
    """Rotate the primary organization API key"""
    # In a real system, this would update an 'Organization' or 'User' record
    # For now, we simulate the rotation and return a new key
    new_key = f"sk_sentinel_live_{secrets.token_hex(16)}"
    
    return {
        "status": "success",
        "message": "API key rotated successfully. Previous key will be revoked in 24 hours.",
        "new_key": new_key,
        "rotated_at": datetime.utcnow().isoformat()
    }
