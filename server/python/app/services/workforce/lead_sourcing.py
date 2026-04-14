"""
Lead sourcing and prospecting functionality
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session, select

from app.services.workforce.base import (
    BaseWorkforceService,
    CREWAI_AVAILABLE,
    CrewAgent,
    CrewTask,
    Crew,
    Process,
)
from app.core.models import MarketResearch, WorkforceOutreach

logger = logging.getLogger(__name__)


class LeadSourcingService(BaseWorkforceService):
    """Service for lead sourcing, prospecting, and market research"""

    async def run_autosearch(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Run automatic lead search based on configuration"""
        criteria = config.get("criteria", "")
        limit = config.get("limit", 10)

        logger.info(f"Running autosearch with criteria: {criteria}")

        if CREWAI_AVAILABLE:
            return await self._run_crewai_search(criteria, limit)
        else:
            leads = self._heuristic_lead_sourcing(criteria)
            return {
                "status": "completed",
                "method": "heuristic",
                "leads": leads[:limit],
                "count": len(leads[:limit]),
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _run_crewai_search(self, criteria: str, limit: int) -> Dict[str, Any]:
        """Run CrewAI powered lead search"""
        researcher = CrewAgent(
            role="Market Research Analyst",
            goal=f"Find {limit} high-quality leads matching criteria: {criteria}",
            backstory="Expert at identifying potential clients through market research",
            tools=[self.search_tool],
            verbose=True,
        )

        research_task = CrewTask(
            description=f"Research and identify {limit} potential clients matching: {criteria}",
            agent=researcher,
            expected_output="List of companies with contact info and fit score",
        )

        crew = Crew(
            agents=[researcher], tasks=[research_task], process=Process.sequential
        )

        result = await crew.kickoff()

        return {
            "status": "completed",
            "method": "crewai",
            "leads": result,
            "count": limit,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_market_research(
        self, research_id: str, session: Session
    ) -> Optional[MarketResearch]:
        """Get market research by ID"""
        return session.get(MarketResearch, research_id)

    async def list_market_research(
        self, session: Session, limit: int = 50
    ) -> List[MarketResearch]:
        """List all market research entries"""
        return session.exec(
            select(MarketResearch)
            .order_by(MarketResearch.created_at.desc())
            .limit(limit)
        ).all()
