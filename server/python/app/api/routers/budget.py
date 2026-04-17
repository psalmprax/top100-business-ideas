from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime

from app.core.database import get_async_session
from app.services.billing_service import billing_service

router = APIRouter()


@router.get("/status")
async def get_budget_status(session: AsyncSession = Depends(get_async_session)):
    """Get current budget status and usage"""
    return await billing_service.get_budget_status()


@router.get("/usage")
async def get_budget_usage(
    period: str = "daily", session: AsyncSession = Depends(get_async_session)
):
    """Get budget usage for specified period"""
    return await billing_service.get_usage(period)


@router.post("/limits")
async def set_budget_limits(
    limits: Dict[str, float], session: AsyncSession = Depends(get_async_session)
):
    """Set budget limits"""
    return await billing_service.set_limits(limits)
