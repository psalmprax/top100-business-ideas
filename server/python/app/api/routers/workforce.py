from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime

from app.core.models import (
    SovereignStatus,
    SovereignStage,
    SovereignRequest,
    WorkforceGoal,
    WorkforceVenture,
)
from app.core.database import get_async_session
from app.services.workforce import workforce_service
from app.services.sovereign_service import sovereign_service

router = APIRouter()


@router.get("/status")
async def get_workforce_status(session: AsyncSession = Depends(get_async_session)):
    """Get overall workforce status"""
    return await workforce_service.get_status()


@router.post("/sovereign/request")
async def create_sovereign_request(
    request: SovereignRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session),
):
    """Create a new sovereign workforce request"""
    request.status = SovereignStatus.PENDING
    request.created_at = datetime.utcnow()

    session.add(request)
    await session.commit()
    await session.refresh(request)

    background_tasks.add_task(sovereign_service.process_request, request.id)

    return request


@router.post("/sovereign/callback")
async def sovereign_callback(
    request_id: str, status: str, session: AsyncSession = Depends(get_async_session)
):
    """Callback endpoint for sovereign request updates"""
    request = await session.get(SovereignRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = status
    request.updated_at = datetime.utcnow()
    session.add(request)
    await session.commit()

    return {"status": "success"}


@router.get("/fiscal-requests")
async def get_fiscal_requests(session: AsyncSession = Depends(get_async_session)):
    """Fetch all persistent spending approval requests"""
    return await workforce_service.get_fiscal_requests(session)


@router.post("/fiscal-requests")
async def create_fiscal_request(
    request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Create a new persistent spending approval request"""
    return await workforce_service.create_fiscal_request(
        request.get("purpose"),
        request.get("amount"),
        request.get("priority"),
        session
    )


@router.put("/fiscal-requests/{id}/approve")
async def approve_fiscal_request(
    id: str, request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Approve or deny a spending request"""
    return await workforce_service.approve_fiscal_request(id, request.get("status"), session)


@router.get("/goals")
async def get_goals(session: AsyncSession = Depends(get_async_session)):
    """Fetch board directives and KPIs"""
    return await workforce_service.get_goals(session)


@router.put("/goals/{id}/value")
async def update_goal_value(
    id: str, request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Update the current value of a KPI"""
    return await workforce_service.update_goal_value(id, request.get("current_value"), session)


@router.get("/ventures")
async def get_ventures(session: AsyncSession = Depends(get_async_session)):
    """Fetch performance tracking for business units"""
    return await workforce_service.get_ventures(session)


@router.get("/jobs")
async def get_jobs(session: AsyncSession = Depends(get_async_session)):
    """Fetch the live job feed"""
    return await workforce_service.get_jobs(session)


@router.get("/skills")
async def get_skills(session: AsyncSession = Depends(get_async_session)):
    """Fetch the workforce skills marketplace"""
    return await workforce_service.get_skills(session)


@router.get("/acquisitions")
async def get_acquisitions(session: AsyncSession = Depends(get_async_session)):
    """Fetch growth acquisition wins"""
    return await workforce_service.get_acquisitions(session)


@router.get("/content")
async def get_content(session: AsyncSession = Depends(get_async_session)):
    """Fetch content factory drafts"""
    return await workforce_service.get_content_drafts(session)


@router.post("/cashclaw/recover")
async def recover_revenue(
    request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Trigger a revenue recovery cycle"""
    return await workforce_service.recover_revenue(request.get("criteria"), session)


@router.post("/autosearch/run")
async def run_autosearch(
    config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session),
):
    """Run autosearch for workforce opportunities"""
    return await workforce_service.run_autosearch(config)


@router.get("/outreach/drafts")
async def get_outreach_drafts(session: AsyncSession = Depends(get_async_session)):
    """Get outreach email drafts"""
    return await workforce_service.get_outreach_drafts(session)


@router.post("/outreach/{id}/approve")
async def approve_outreach_draft(
    id: str, session: AsyncSession = Depends(get_async_session)
):
    """Approve an outreach draft for sending"""
    return await workforce_service.approve_draft(id, session)


@router.post("/referral/activate")
async def activate_referral(
    request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Activate a referral program"""
    return await workforce_service.activate_referral(request.get("user_id"), session)
