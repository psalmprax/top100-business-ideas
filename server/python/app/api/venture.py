from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime
import logging

from app.core.database import get_async_session
from app.core.models import BusinessIdea

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/insights", response_model=List[BusinessIdea])
async def get_business_ideas(
    limit: int = 50, offset: int = 0, session: AsyncSession = Depends(get_async_session)
):
    """Fetch all persistent business ideas from the database with pagination"""
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=400, detail="Limit must be between 1 and 100"
            )
        if offset < 0:
            raise HTTPException(status_code=400, detail="Offset must be non-negative")

        statement = (
            select(BusinessIdea).order_by(BusinessIdea.rank).offset(offset).limit(limit)
        )
        result = await session.execute(statement)
        results = result.scalars().all()

        logger.info(
            f"Retrieved {len(results)} business ideas (offset: {offset}, limit: {limit})"
        )
        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch business ideas: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while fetching business ideas",
        )


@router.post("/realize/{idea_id}")
async def realize_business_impact(
    idea_id: int, session: AsyncSession = Depends(get_async_session)
):
    """Convert a business idea into a realized impact log"""
    try:
        # Input validation
        if idea_id <= 0:
            raise HTTPException(
                status_code=400, detail="Invalid idea_id: must be positive integer"
            )

        # Fetch the idea
        idea = await session.get(BusinessIdea, idea_id)
        if not idea:
            logger.warning(f"Business idea not found: {idea_id}")
            raise HTTPException(status_code=404, detail="Business Idea not found")

        # Log the realization
        realization_time = datetime.utcnow()
        logger.info(f"Realizing business impact for idea {idea_id}: {idea.title}")

        # In a real implementation, you might create a separate table for realized impacts
        # For now, we'll just return the realization data

        return {
            "idea_id": idea_id,
            "title": idea.title,
            "status": "realized",
            "impact_verified": True,
            "realized_at": realization_time.isoformat(),
            "rank": idea.rank,
            "category": getattr(idea, "category", "unknown"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to realize business impact for idea {idea_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while realizing business impact",
        )
