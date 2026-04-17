from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.models import MultiCloudStatus
from app.core.database import get_async_session
from app.services.multi_cloud_proxy import multi_cloud_proxy

router = APIRouter()


@router.get("/status", response_model=List[MultiCloudStatus])
async def get_multi_cloud_status(session: AsyncSession = Depends(get_async_session)):
    """Get status of all multi-cloud providers"""
    result = await session.execute(select(MultiCloudStatus))
    return result.scalars().all()


@router.get("/metrics")
async def get_multi_cloud_metrics(session: AsyncSession = Depends(get_async_session)):
    """Get aggregated multi-cloud metrics"""
    return await multi_cloud_proxy.get_metrics()


@router.post("/failover")
async def trigger_multi_cloud_failover(
    provider: str, session: AsyncSession = Depends(get_async_session)
):
    """Trigger failover to a specific cloud provider"""
    result = await multi_cloud_proxy.trigger_failover(provider)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return {
        "status": "success",
        "message": f"Failover to {provider} completed successfully",
        "timestamp": result.timestamp,
    }
