"""
Modular workforce service implementation

This package replaces the monolithic workforce_service.py with
domain-specific modules that follow single responsibility principle.
"""

from app.services.workforce.base import BaseWorkforceService
from app.services.workforce.lead_sourcing import LeadSourcingService
from app.services.workforce.outreach import OutreachService
from app.services.workforce.goals import GoalsService
from app.services.workforce.operations import OperationsService
from app.services.workforce.cashclaw import CashClawService


class WorkforceService:
    """Facade class that composes all workforce services"""

    def __init__(self):
        self.lead_sourcing = LeadSourcingService()
        self.outreach = OutreachService()
        self.goals = GoalsService()
        self.operations = OperationsService()
        self.cashclaw = CashClawService()

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

    # Operations & Persistence
    async def get_fiscal_requests(self, session):
        return await self.operations.get_fiscal_requests(session)

    async def create_fiscal_request(self, purpose, amount, priority, session):
        return await self.operations.create_fiscal_request(purpose, amount, priority, session)

    async def approve_fiscal_request(self, id, status, session):
        return await self.operations.approve_fiscal_request(id, status, session)

    async def get_jobs(self, session):
        return await self.operations.get_jobs(session)

    async def get_acquisitions(self, session):
        return await self.operations.get_acquisitions(session)

    async def get_content_drafts(self, session):
        return await self.operations.get_content_drafts(session)

    async def get_skills(self, session):
        return await self.operations.get_skills(session)

    async def get_ventures(self, session):
        return await self.goals.list_ventures(session)

    async def get_goals(self, session):
        return await self.goals.list_goals(session)

    async def update_goal_value(self, goal_id, value, session):
        return await self.goals.update_goal(goal_id, {"current_value": value}, session)

    # Recovery
    async def recover_revenue(self, criteria, session):
        return await self.cashclaw.run_recovery_cycle(criteria, session)


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
