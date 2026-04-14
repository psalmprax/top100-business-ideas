"""Workforce management endpoints"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlmodel import Session, select
from datetime import datetime

from app.core.models import (
    SovereignStatus,
    SovereignStage,
    SovereignRequest,
    WorkforceGoal,
    WorkforceVenture,
)
from app.core.database import get_session
from app.services.workforce_service import workforce_service
from app.services.sovereign_service import sovereign_service

router = APIRouter()


@router.get("/status")
async def get_workforce_status(session: Session = Depends(get_session)):
    """Get overall workforce status"""
    return await workforce_service.get_status()


@router.post("/sovereign/request")
async def create_sovereign_request(
    request: SovereignRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    """Create a new sovereign workforce request"""
    request.status = SovereignStatus.PENDING
    request.created_at = datetime.utcnow()

    session.add(request)
    session.commit()
    session.refresh(request)

    background_tasks.add_task(sovereign_service.process_request, request.id)

    return request


@router.post("/sovereign/callback")
async def sovereign_callback(
    request_id: str, status: str, session: Session = Depends(get_session)
):
    """Callback endpoint for sovereign request updates"""
    request = session.get(SovereignRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = status
    request.updated_at = datetime.utcnow()
    session.add(request)
    session.commit()

    return {"status": "success"}


@router.post("/autosearch/run")
async def run_autosearch(
    config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    """Run autosearch for workforce opportunities"""
    result = await workforce_service.run_autosearch(config)
    return result


@router.get("/outreach/drafts")
async def get_outreach_drafts(session: Session = Depends(get_session)):
    """Get outreach email drafts"""
    return await workforce_service.get_outreach_drafts()


@router.post("/outreach/{draft_id}/approve")
async def approve_outreach_draft(
    draft_id: str, session: Session = Depends(get_session)
):
    """Approve an outreach draft for sending"""
    return await workforce_service.approve_draft(draft_id)


@router.post("/referral/activate")
async def activate_referral(referral_id: str, session: Session = Depends(get_session)):
    """Activate a referral program"""
    return await workforce_service.activate_referral(referral_id)
