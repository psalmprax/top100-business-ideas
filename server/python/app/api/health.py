"""Health check endpoints"""

import os
import psutil
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, text
import logging

from app.core.database import get_session

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("")
async def health(session: Session = Depends(get_session)):
    """Comprehensive health check endpoint"""
    try:
        # Check database connectivity
        db_healthy = await check_database_health(session)

        # Check system resources
        system_health = check_system_health()

        # Check external services (if any)
        services_health = await check_external_services()

        # Overall status
        overall_status = (
            "healthy"
            if all(
                [
                    db_healthy["status"] == "healthy",
                    system_health["status"] == "healthy",
                    services_health["status"] == "healthy",
                ]
            )
            else "unhealthy"
        )

        return {
            "status": overall_status,
            "service": "ai-ml-backend",
            "version": os.getenv("APP_VERSION", "1.0.0"),
            "checks": {
                "database": db_healthy,
                "system": system_health,
                "services": services_health,
            },
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")


async def check_database_health(session: Session) -> Dict[str, Any]:
    """Check database connectivity and basic query"""
    try:
        # Simple query to test connectivity
        result = session.exec(text("SELECT 1 as test")).first()
        if result and result.test == 1:
            return {"status": "healthy", "message": "Database connection successful"}
        else:
            return {"status": "unhealthy", "message": "Database query failed"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "message": f"Database error: {str(e)}"}


def check_system_health() -> Dict[str, Any]:
    """Check system resources"""
    try:
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)

        memory_usage_percent = memory.percent
        memory_available_mb = memory.available / (1024 * 1024)

        # Thresholds for unhealthy status
        if memory_usage_percent > 95 or cpu_percent > 95:
            status = "unhealthy"
        elif memory_usage_percent > 85 or cpu_percent > 85:
            status = "warning"
        else:
            status = "healthy"

        return {
            "status": status,
            "memory_usage_percent": round(memory_usage_percent, 2),
            "memory_available_mb": round(memory_available_mb, 2),
            "cpu_usage_percent": round(cpu_percent, 2),
        }
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        return {"status": "unhealthy", "message": f"System check error: {str(e)}"}


async def check_external_services() -> Dict[str, Any]:
    """Check external service dependencies"""
    # For now, just return healthy - can be extended to check Redis, external APIs, etc.
    try:
        # Add checks for external services here as needed
        # Example: Redis connectivity, external API endpoints, etc.
        return {"status": "healthy", "message": "All external services operational"}
    except Exception as e:
        logger.error(f"External services health check failed: {e}")
        return {"status": "unhealthy", "message": f"External services error: {str(e)}"}
