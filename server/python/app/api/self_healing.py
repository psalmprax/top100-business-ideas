"""
AlphaHecta Self-Healing API
Consolidated endpoints for system resilience, recovery, and monitoring.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.core.database import get_async_session, AsyncSession
from app.core.models.compliance_models import HealingConfiguration, SelfHealingEvent
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime
from app.services.self_healing_manager import self_healing_manager

router = APIRouter()

class HealingUpdate(BaseModel):
    auto_refine: bool = None
    safety_rollback: bool = None

@router.get("/healing/status")
async def get_healing_status(session: AsyncSession = Depends(get_async_session)):
    """Get current self-healing status and metrics"""
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
    event = self_healing_manager.remediate_drift("simulation-trigger")
    return {"status": "success", "event": event}

@router.post("/healing/recover")
async def trigger_recovery(
    request: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Trigger a real recovery action for a node or service."""
    node_id = request.get("node_id")
    action = request.get("action", "restart")
    
    result = self_healing_manager.remediate_drift(node_id or "manual-trigger")
    return {"status": "success", "result": result}

@router.get("/healing/events", response_model=List[SelfHealingEvent])
async def get_self_healing_events(
    limit: int = 100, offset: int = 0, session: AsyncSession = Depends(get_async_session)
):
    """Get self-healing event history"""
    result = await session.execute(
        select(SelfHealingEvent)
        .order_by(SelfHealingEvent.timestamp.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()

@router.post("/healing/events", response_model=SelfHealingEvent)
async def create_self_healing_event(
    event: SelfHealingEvent, session: AsyncSession = Depends(get_async_session)
):
    """Create a new self-healing event"""
    event.timestamp = datetime.utcnow()
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event

@router.get("/healing/stats")
async def get_self_healing_stats(session: AsyncSession = Depends(get_async_session)):
    """Get self-healing system statistics"""
    return await self_healing_manager.get_stats()

@router.get("/healing/metrics/streaming")
async def get_self_healing_streaming_metrics(
    request: Request, session: AsyncSession = Depends(get_async_session)
):
    """
    Real-time streaming metrics for self-healing dashboard using Server-Sent Events.
    """
    from app.api.routers.streaming import generate_metrics_stream

    return StreamingResponse(
        generate_metrics_stream(session),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )

@router.post("/healing/hint")
async def inject_healing_hint(
    hint_data: Dict[str, Any], session: AsyncSession = Depends(get_async_session)
):
    """Inject a hint into the self-healing engine."""
    # Logic to record hint or adjust behavior
    return {"status": "success", "hint": hint_data.get("hint")}

@router.post("/healing/events/{event_id}/resolve")
async def resolve_healing_event(
    event_id: str, session: AsyncSession = Depends(get_async_session)
):
    """Mark a self-healing event as resolved."""
    from app.core.models.compliance_models import SelfHealingEvent
    import uuid
    
    try:
        event_uuid = uuid.UUID(event_id)
        event = await session.get(SelfHealingEvent, event_uuid)
        if not event:
             raise HTTPException(status_code=404, detail="Event not found")
        
        event.resolved = True
        session.add(event)
        await session.commit()
        return {"status": "success", "event_id": event_id}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid event ID format")
