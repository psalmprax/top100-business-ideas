from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime

from app.core.database import get_async_session
from app.services.optimization_service import optimization_service
from app.services.workforce import workforce_service

router = APIRouter()


@router.get("/workforce/efficiency")
async def get_workforce_efficiency(session: AsyncSession = Depends(get_async_session)):
    """Get global workforce efficiency report including LLM performance and feedback"""
    try:
        # Note: optimization_service needs to be compatible with AsyncSession if it hits the DB
        return await optimization_service.get_workforce_efficiency_report_async(session)
    except AttributeError:
        # Fallback if async method not yet implemented
        try:
            return optimization_service.get_workforce_efficiency_report()
        except Exception as e:
             raise HTTPException(
                status_code=500, detail=f"Failed to generate efficiency report: {str(e)}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate efficiency report: {str(e)}"
        )


@router.post("/workforce/optimize/{agent_id}")
async def optimize_agent(agent_id: str, session: AsyncSession = Depends(get_async_session)):
    """Trigger manual optimization cycle for a specific agent"""
    try:
        target_uuid = UUID(agent_id)
        # Note: optimization_service needs to be compatible with AsyncSession if it hits the DB
        return await optimization_service.optimize_agent_async(session, target_uuid)
    except AttributeError:
        # Fallback if async method not yet implemented
        try:
            return optimization_service.optimize_agent(target_uuid)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
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
    session: AsyncSession = Depends(get_async_session),
):
    """Get detailed LLM performance metrics for an agent"""
    try:
        target_uuid = UUID(agent_id)
        # Note: optimization_service needs to be compatible with AsyncSession if it hits the DB
        return await optimization_service.analyze_llm_performance_async(session, target_uuid, days)
    except AttributeError:
        # Fallback if async method not yet implemented
        try:
            return optimization_service.analyze_llm_performance(target_uuid, days)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
