"""Budget management endpoints"""

from typing import Dict
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime

from app.core.database import get_session
from app.services.billing_service import billing_service

router = APIRouter()


@router.get("/status")
async def get_budget_status(session: Session = Depends(get_session)):
    """Get current budget status and usage"""
    return await billing_service.get_budget_status()


@router.get("/usage")
async def get_budget_usage(
    period: str = "daily", session: Session = Depends(get_session)
):
    """Get budget usage for specified period"""
    return await billing_service.get_usage(period)


@router.post("/limits")
async def set_budget_limits(
    limits: Dict[str, float], session: Session = Depends(get_session)
):
    """Set budget limits"""
    return await billing_service.set_limits(limits)
