"""Real-time streaming endpoints"""

import asyncio
import json
import logging
from datetime import datetime
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func

from app.core.database import get_session
from app.core.models import Agent, AgentStatus, LLMUsageLog, SelfHealingEvent
from app.services.self_healing_manager import self_healing_manager

router = APIRouter()
logger = logging.getLogger(__name__)


async def generate_metrics_stream(session: Session) -> AsyncGenerator[str, None]:
    """Generate real-time metrics stream using Server-Sent Events"""
    try:
        while True:
            # Get current metrics
            agents = session.exec(select(Agent)).all()
            total_agents = len(agents)
            running = sum(1 for a in agents if a.status == AgentStatus.RUNNING)
            stopped = sum(1 for a in agents if a.status == AgentStatus.STOPPED)
            error = sum(1 for a in agents if a.status == AgentStatus.ERROR)

            total_requests = session.exec(select(func.count(LLMUsageLog.id))).one()
            total_cost = session.exec(select(func.sum(LLMUsageLog.cost))).one() or 0.0

            recent_events = session.exec(
                select(SelfHealingEvent)
                .order_by(SelfHealingEvent.timestamp.desc())
                .limit(10)
            ).all()

            # Get self-healing status
            healing_status = await self_healing_manager.get_stats()

            metrics = {
                "timestamp": datetime.utcnow().isoformat(),
                "agents": {
                    "total": total_agents,
                    "running": running,
                    "stopped": stopped,
                    "error": error,
                },
                "usage": {
                    "total_requests": total_requests,
                    "total_cost": float(total_cost),
                },
                "self_healing": healing_status,
                "recent_events": [
                    {
                        "id": event.id,
                        "type": event.event_type,
                        "status": event.status,
                        "timestamp": event.timestamp.isoformat(),
                    }
                    for event in recent_events
                ],
            }

            # Send SSE formatted message
            yield f"data: {json.dumps(metrics)}\n\n"

            # Wait before next update
            await asyncio.sleep(2)

    except asyncio.CancelledError:
        logger.info("Metrics stream disconnected")
    except Exception as e:
        logger.error(f"Error in metrics stream: {e}")
        yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"


@router.get("/self-healing/metrics/streaming")
async def get_self_healing_streaming_metrics(
    request: Request, session: Session = Depends(get_session)
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
    return StreamingResponse(
        generate_metrics_stream(session),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )
