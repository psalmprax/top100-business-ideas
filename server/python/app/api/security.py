"""Security and API Key management endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
import uuid
import secrets
import hashlib
from datetime import datetime, timedelta

from app.core.database import get_session
from app.core.models import SecurityKey

router = APIRouter()


def hash_key(key: str) -> str:
    """Hash an API key for secure storage"""
    return hashlib.sha256(key.encode()).hexdigest()[:16]


@router.post("/rotate-key")
async def rotate_api_key(
    name: str = "Main API Key", session: Session = Depends(get_session)
):
    """Rotate the primary organization API key with proper key management"""
    active_keys = session.exec(
        select(SecurityKey).where(SecurityKey.status == "active")
    ).all()

    for key in active_keys:
        key.status = "revoked"
        key.expires_at = datetime.utcnow() + timedelta(hours=24)
        session.add(key)

    new_key = f"sk_sentinel_live_{secrets.token_hex(16)}"
    key_hash = hash_key(new_key)
    prefix = new_key[:16]

    new_security_key = SecurityKey(
        id=str(uuid.uuid4()),
        name=name,
        key_hash=key_hash,
        prefix=prefix,
        status="active",
        expires_at=datetime.utcnow() + timedelta(days=90),
    )
    session.add(new_security_key)
    session.commit()
    session.refresh(new_security_key)

    return {
        "status": "success",
        "message": "API key rotated. Previous keys marked for revocation in 24 hours.",
        "key_id": new_security_key.id,
        "new_key": new_key,
        "expires_at": new_security_key.expires_at.isoformat(),
        "rotated_at": datetime.utcnow().isoformat(),
    }


@router.get("/keys")
async def list_api_keys(session: Session = Depends(get_session)):
    """List all API keys"""
    keys = session.exec(select(SecurityKey)).all()
    return [
        {
            "id": k.id,
            "name": k.name,
            "prefix": k.prefix,
            "status": k.status,
            "created_at": k.created_at.isoformat(),
            "expires_at": k.expires_at.isoformat() if k.expires_at else None,
        }
        for k in keys
    ]


@router.delete("/keys/{key_id}")
async def revoke_api_key(key_id: str, session: Session = Depends(get_session)):
    """Revoke an API key immediately"""
    key = session.get(SecurityKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    key.status = "revoked"
    key.expires_at = datetime.utcnow()
    session.add(key)
    session.commit()

    return {"status": "success", "message": "API key revoked"}
