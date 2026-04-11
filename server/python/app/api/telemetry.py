"""
Telemetry and Optimization API Router
Endpoints for workforce efficiency and self-tuning metrics.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session
from uuid import UUID
from datetime import datetime

from app.core.database import get_session
from app.services.optimization_service import optimization_service
from app.services.workforce_service import workforce_service

router = APIRouter()

@router.get("/workforce/efficiency")
async def get_workforce_efficiency(session: Session = Depends(get_session)):
    """Get global workforce efficiency report including LLM performance and feedback"""
    try:
        return optimization_service.get_workforce_efficiency_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate efficiency report: {str(e)}")

@router.post("/workforce/optimize/{agent_id}")
async def optimize_agent(
    agent_id: str,
    session: Session = Depends(get_session)
):
    """Trigger manual optimization cycle for a specific agent"""
    try:
        target_uuid = UUID(agent_id)
        return optimization_service.optimize_agent(target_uuid)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workforce/status")
async def get_workforce_status():
    """Real-time health status of Alpha Workforce products"""
    try:
        return await workforce_service.get_products_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/llm/performance/{agent_id}")
async def get_llm_performance(
    agent_id: str,
    days: int = Query(7, ge=1, le=30),
    session: Session = Depends(get_session)
):
    """Get detailed LLM performance metrics for an agent"""
    try:
        target_uuid = UUID(agent_id)
        return optimization_service.analyze_llm_performance(target_uuid, days)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
