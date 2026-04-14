"""Multi-cloud management endpoints"""

from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from app.core.models import MultiCloudStatus
from app.core.database import get_session
from app.services.multi_cloud_proxy import multi_cloud_proxy

router = APIRouter()


@router.get("/status", response_model=List[MultiCloudStatus])
async def get_multi_cloud_status(session: Session = Depends(get_session)):
    """Get status of all multi-cloud providers"""
    return session.exec(select(MultiCloudStatus)).all()


@router.get("/metrics")
async def get_multi_cloud_metrics(session: Session = Depends(get_session)):
    """Get aggregated multi-cloud metrics"""
    return await multi_cloud_proxy.get_metrics()


@router.post("/failover")
async def trigger_multi_cloud_failover(
    provider: str, session: Session = Depends(get_session)
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
