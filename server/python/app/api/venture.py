"""Strategic venture insights endpoints"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from app.core.database import get_session
from app.core.models import BusinessIdea

router = APIRouter()

@router.get("/insights", response_model=List[BusinessIdea])
async def get_business_ideas(session: Session = Depends(get_session)):
    """Fetch all persistent business ideas from the database"""
    statement = select(BusinessIdea).order_by(BusinessIdea.rank)
    results = session.exec(statement).all()
    return results

@router.post("/realize/{idea_id}")
async def realize_business_impact(idea_id: int, session: Session = Depends(get_session)):
    """Convert a business idea into a realized impact log"""
    idea = session.get(BusinessIdea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Business Idea not found")
        
    return {
        "idea_id": idea_id,
        "title": idea.title,
        "status": "realized",
        "impact_verified": True,
        "realized_at": datetime.utcnow().isoformat()
    }
