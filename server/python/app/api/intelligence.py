"""
Intelligence API Router
Endpoints for Paperclip (Research) and Hermes (Strategy).
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.services.intelligence_service import intelligence_service

router = APIRouter()

@router.get("/research")
async def get_market_research(
    topic: str = Query(..., min_length=2),
    session: Session = Depends(get_session)
):
    """Run Paperclip automated research for a given topic."""
    try:
        return await intelligence_service.run_market_research(session, topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/strategy")
async def generate_product_strategy(
    project_data: dict,
    session: Session = Depends(get_session)
):
    """Generate Hermes product strategy for a given project."""
    project_name = project_data.get("name")
    if not project_name:
        raise HTTPException(status_code=400, detail="Project name is required")
        
    try:
        return await intelligence_service.generate_product_strategy(session, project_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
