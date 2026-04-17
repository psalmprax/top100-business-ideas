"""Self-healing system endpoints"""

import logging
from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from datetime import datetime

from app.core.models import SelfHealingEvent
from app.core.database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.self_healing_manager import self_healing_manager

router = APIRouter()


@router.get("/events", response_model=List[SelfHealingEvent])
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


@router.post("/events", response_model=SelfHealingEvent)
async def create_self_healing_event(
    event: SelfHealingEvent, session: AsyncSession = Depends(get_async_session)
):
    """Create a new self-healing event"""
    event.timestamp = datetime.utcnow()
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


@router.get("/stats")
async def get_self_healing_stats(session: AsyncSession = Depends(get_async_session)):
    """Get self-healing system statistics"""
    return await self_healing_manager.get_stats()


@router.get("/metrics/streaming")
async def get_self_healing_streaming_metrics(
    request: Request, session: AsyncSession = Depends(get_async_session)
):
    """
    Real-time streaming metrics for self-healing dashboard using Server-Sent Events.

    This endpoint streams metrics updates every 2 seconds.
    Client should connect with EventSource:

    ```javascript
    const evtSource = new EventSource('/api/v1/self-healing/metrics/streaming');
    evtSource.onmessage = (event) => {
        const metrics = JSON.parse(event.data);
        console.log(metrics);
    };
    ```
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
