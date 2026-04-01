"""Enterprise configuration endpoints for SLA and White-labeling"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from datetime import datetime
import uuid

from app.core.database import get_session

router = APIRouter(prefix="/enterprise", tags=["Enterprise"])


@router.get("/partner-config")
async def get_partner_config(session: Session = Depends(get_session)):
    """Get white-label and partner configuration from the database"""
    # Real-First Hardening: No more hardcoded dictionaries.
    # Must be fetched from a 'PartnerConfig' or 'SystemSetting' table.
    from app.core.models import SystemSetting

    settings = session.exec(
        select(SystemSetting).where(SystemSetting.category == "ui")
    ).all()
    config = {s.setting_key: s.setting_value for s in settings}

    if not config:
        raise HTTPException(status_code=404, detail="Partner configuration not found")

    return config


@router.post("/sla-tier")
async def update_sla_tier(request: Dict[str, Any]):
    """Update SLA tier and performance guarantees"""
    tier = request.get("tier", "enterprise")

    # Mocking persistence and logic
    return {
        "status": "updated",
        "tier": tier,
        "guaranteed_uptime": 99.99 if tier == "premium" else 99.9,
        "response_time_ms": 200 if tier == "premium" else 500,
        "last_updated": datetime.utcnow().isoformat(),
    }


from app.services.billing_service import billing_service


@router.get("/subscription")
async def get_subscription(session: Session = Depends(get_session)):
    """Fetch real-time subscription status from the database"""
    from app.core.models import Subscription
    from sqlmodel import select

    sub = session.exec(select(Subscription).limit(1)).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return sub


@router.get("/invoices")
async def get_invoices(session: Session = Depends(get_session)):
    """Fetch historical invoices for the user"""
    invoices = billing_service.list_user_invoices(session, "")
    if not invoices:
        return []
    return invoices
