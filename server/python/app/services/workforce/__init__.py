"""
Modular workforce service implementation

This package replaces the monolithic workforce_service.py with
domain-specific modules that follow single responsibility principle.
"""

from app.services.workforce.base import BaseWorkforceService
from app.services.workforce.lead_sourcing import LeadSourcingService
from app.services.workforce.outreach import OutreachService
from app.services.workforce.goals import GoalsService


class WorkforceService:
    """Facade class that composes all workforce services"""

    def __init__(self):
        self.lead_sourcing = LeadSourcingService()
        self.outreach = OutreachService()
        self.goals = GoalsService()

    # Delegate methods to specific services for backward compatibility
    async def run_autosearch(self, config):
        return await self.lead_sourcing.run_autosearch(config)

    async def get_outreach_drafts(self, session):
        return await self.outreach.get_outreach_drafts(session)

    async def approve_draft(self, draft_id, session):
        return await self.outreach.approve_draft(draft_id, session)

    async def activate_referral(self, referral_id, session):
        return await self.goals.activate_referral(referral_id, session)

    async def get_status(self, session):
        return await self.goals.get_status(session)


# Singleton instance for backward compatibility
workforce_service = WorkforceService()

__all__ = [
    "WorkforceService",
    "workforce_service",
    "BaseWorkforceService",
    "LeadSourcingService",
    "OutreachService",
    "GoalsService",
]
