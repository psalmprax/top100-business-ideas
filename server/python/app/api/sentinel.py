from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_async_session, AsyncSession
from app.core.models.compliance_models import HealingConfiguration
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter()

class HealingUpdate(BaseModel):
    auto_refine: bool = None
    safety_rollback: bool = None

@router.get("/healing/status")
async def get_healing_status(session: AsyncSession = Depends(get_async_session)):
    """Get current self-healing status and metrics"""
    from app.services.self_healing_manager import self_healing_manager
    return self_healing_manager.get_cluster_status()

@router.get("/healing/configs")
async def get_healing_configs(session: AsyncSession = Depends(get_async_session)):
    """List all healing configurations"""
    result = await session.execute(select(HealingConfiguration))
    return result.scalars().all()

@router.post("/healing/config")
async def update_healing_config(
    update: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Update self-healing configuration parameters with real database persistence."""
    statement = select(HealingConfiguration)
    result = await session.execute(statement)
    config = result.scalars().first()

    if not config:
        config = HealingConfiguration(
            id="default",
            auto_refine=update.get("auto_refine", True),
            safety_rollback=update.get("safety_rollback", True),
            max_retries=3,
        )
    else:
        for key, value in update.items():
            if hasattr(config, key):
                setattr(config, key, value)
    
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return {"status": "updated", "config": config}

@router.post("/healing/simulate")
async def simulate_healing(session: AsyncSession = Depends(get_async_session)):
    """Trigger a simulated healing event for UI verification."""
    from app.services.self_healing_manager import self_healing_manager
    event = self_healing_manager.remediate_drift("simulation-trigger")
    return {"status": "success", "event": event}
