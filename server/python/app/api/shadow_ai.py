"""
Shadow AI Detection API
Endpoints for managing Shadow AI detections and stats.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.services.shadow_ai_service import shadow_ai_service
from app.core.dependencies import get_current_user
from app.core.models.service_models import ShadowAIRiskLevel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/detections")
async def list_detections(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    """List all Shadow AI detections with optional filtering. Public read-only."""
    try:
        detections = shadow_ai_service.list_detections(risk_level, status)
        return {"detections": detections, "total": len(detections)}
    except Exception as e:
        logger.error(f"Error listing detections: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/detections/{detection_id}/remediate")
async def remediate_detection(
    detection_id: str, action: str = "remediate", user=Depends(get_current_user)
) -> Dict[str, Any]:
    """Remediate a Shadow AI detection."""
    try:
        result = shadow_ai_service.remediate_detection(detection_id, action)
        if not result:
            raise HTTPException(status_code=404, detail="Detection not found")
        return {"status": "success", "detection_id": detection_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error remediating detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """Get Shadow AI detection statistics. Public read-only."""
    try:
        stats = shadow_ai_service.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detections")
async def add_detection(
    tool_name: str,
    vendor: str,
    department: str,
    risk_level: str,
    user_count: int = 1,
    user=Depends(get_current_user),
) -> Dict[str, Any]:
    """Add a new Shadow AI detection (for testing/manual entry)."""
    try:
        if risk_level.upper() not in [e.name for e in ShadowAIRiskLevel]:
            raise HTTPException(status_code=400, detail="Invalid risk level")

        detection = shadow_ai_service.add_detection(
            tool_name=tool_name,
            vendor=vendor,
            department=department,
            risk_level=risk_level.upper(),
            user_count=user_count,
        )
        return {"status": "success", "detection": detection}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/block/{tool_id}")
async def block_tool(tool_id: str, user=Depends(get_current_user)) -> Dict[str, Any]:
    """Block a Shadow AI tool."""
    try:
        result = shadow_ai_service.remediate_detection(tool_id, "block")
        if not result:
            raise HTTPException(status_code=404, detail="Detection not found")
        return {"status": "success", "tool_id": tool_id, "action": "blocked"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error blocking tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/allow/{tool_id}")
async def allow_tool(tool_id: str, user=Depends(get_current_user)) -> Dict[str, Any]:
    """Allow/approve a Shadow AI tool."""
    try:
        result = shadow_ai_service.approve_detection(tool_id)
        if not result:
            raise HTTPException(status_code=404, detail="Detection not found")
        return {"status": "success", "tool_id": tool_id, "action": "allowed"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error allowing tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))
