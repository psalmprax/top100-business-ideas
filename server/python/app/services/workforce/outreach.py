"""
Outreach and communication functionality
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
from app.core.models import WorkforceOutreach, OutreachStatus

logger = logging.getLogger(__name__)


class OutreachService(BaseWorkforceService):
    """Service for email outreach, drafts, and communication"""

    async def get_outreach_drafts(self, session: Session) -> List[WorkforceOutreach]:
        """Get all outreach drafts"""
        return session.exec(
            select(WorkforceOutreach)
            .where(WorkforceOutreach.status == OutreachStatus.DRAFT)
            .order_by(WorkforceOutreach.created_at.desc())
        ).all()

    async def approve_draft(self, draft_id: str, session: Session) -> Dict[str, Any]:
        """Approve an outreach draft for sending"""
        draft = session.get(WorkforceOutreach, draft_id)
        if not draft:
            return {"status": "error", "message": "Draft not found"}

        draft.status = OutreachStatus.APPROVED
        draft.approved_at = datetime.utcnow()
        session.add(draft)
        session.commit()
        session.refresh(draft)

        return {
            "status": "success",
            "message": "Draft approved successfully",
            "draft_id": draft_id,
            "approved_at": draft.approved_at.isoformat(),
        }

    async def generate_outreach_draft(
        self, lead_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate personalized outreach email draft"""
        if CREWAI_AVAILABLE:
            return await self._generate_crewai_outreach(lead_data)
        else:
            return self._generate_heuristic_outreach(lead_data)

    async def _generate_crewai_outreach(
        self, lead_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate outreach using CrewAI"""
        copywriter = CrewAgent(
            role="Sales Copywriter",
            goal="Write personalized cold outreach emails",
            backstory="Expert at crafting high-converting sales emails",
            tools=[],
            verbose=True,
        )

        copy_task = CrewTask(
            description=f"Write a personalized cold email for: {lead_data}",
            agent=copywriter,
            expected_output="Email subject line and body",
        )

        crew = Crew(agents=[copywriter], tasks=[copy_task], process=Process.sequential)

        result = await crew.kickoff()

        return {
            "status": "completed",
            "method": "crewai",
            "draft": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _generate_heuristic_outreach(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate heuristic outreach email"""
        company = lead_data.get("name", "Valued Partner")
        industry = lead_data.get("industry", "business")

        return {
            "status": "completed",
            "method": "heuristic",
            "draft": {
                "subject": f"Improving {industry} efficiency at {company}",
                "body": f"Hi Team at {company},\n\nI noticed your work in the {industry} space and wanted to share how we've helped similar companies.\n\nWould you be open to a 15-minute call to discuss?\n\nBest regards,\nThe Team",
                "confidence": 0.65,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def send_outreach(self, outreach_id: str, session: Session) -> Dict[str, Any]:
        """Send approved outreach"""
        outreach = session.get(WorkforceOutreach, outreach_id)
        if not outreach or outreach.status != OutreachStatus.APPROVED:
            return {"status": "error", "message": "Invalid outreach"}

        # In production, integrate with email service
        outreach.status = OutreachStatus.SENT
        outreach.sent_at = datetime.utcnow()
        session.add(outreach)
        session.commit()

        return {"status": "success", "message": "Outreach sent successfully"}
