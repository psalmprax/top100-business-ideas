import logging
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from uuid import UUID
from datetime import datetime
from sqlmodel import Session
from app.core.database import engine
from app.core.models.agent_models import SelfHealingEvent, AgentVigilanceAlert

logger = logging.getLogger(__name__)

async def resilience_exception_handler(request: Request, exc: Exception):
    """
    Global Resilience Exception Handler.
    Intercepts unhandled exceptions, persists them for AI self-healing audit,
    and returns a normalized secure response.
    """
    
    error_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    
    # Protocol: Respect explicit HTTPExceptions
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "error_id": error_id}
        )

    # Protocol: Log catastrophic failure to database for Real-First self-healing
    try:
        with Session(engine) as session:
            # Use a null UUID for global system events
            system_tag = UUID("00000000-0000-0000-0000-000000000000")
            
            event = SelfHealingEvent(
                agent_id=system_tag,
                event_type="CRITICAL_EXCEPTION",
                severity="high",
                description=f"Endpoint: {request.method} {request.url.path} | Fault: {str(exc)}",
                action_taken="ISOLATED_AND_LOGGED",
                resolved=False
            )
            session.add(event)
            
            alert = AgentVigilanceAlert(
                type="runtime_fault",
                severity="critical",
                description=f"System Fault Detected: {str(exc)[:200]}",
                metadata_json={
                    "path": request.url.path,
                    "method": request.method,
                    "traceback": traceback.format_exc()[-2000:] # Capture recent stack
                }
            )
            session.add(alert)
            session.commit()
    except Exception as db_e:
        logger.error(f"Persistence Fault in Resilience Handler: {db_e}")

    # Log to stdout for container logs
    logger.critical(f"FAULT [{error_id}]: {str(exc)}\n{traceback.format_exc()}")

    # Return secure, production-grade response (hiding raw stack from client)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_id": error_id,
            "message": "AlphaHecta Resilience Shield intercepted a critical fault.",
            "instruction": "This event has been logged to the Self-Healing audit trail."
        }
    )
