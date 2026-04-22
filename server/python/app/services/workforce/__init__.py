"""
Modular workforce service implementation

This package replaces the monolithic workforce_service.py with
domain-specific modules that follow single responsibility principle.
"""

import logging
from typing import Any, Dict

from app.services.workforce.base import (
    BaseWorkforceService,
    CouplingLevel,
    set_coupling_level,
    get_coupling_level,
    register_workflow,
    register_trigger,
)

logger = logging.getLogger(__name__)
from app.services.workforce.lead_sourcing import LeadSourcingService
from app.services.workforce.outreach import OutreachService
from app.services.workforce.goals import GoalsService
from app.services.workforce.operations import OperationsService
from app.services.workforce.cashclaw import CashClawService

# CashClaw Skill Nodes (ported from official CashClaw ecosystem)
from app.services.workforce.competitor import CompetitorIntelligenceService
from app.services.workforce.seo_auditor import SEOAuditorService
from app.services.workforce.reputation import ReputationManagerService
from app.services.workforce.chat_automation import ChatAutomationService
from app.services.workforce.landing_page import LandingPageService
from app.services.workforce.data_scraper import DataScraperService


# ============ DEFAULT WORKFLOW CONFIGURATIONS ============
# These are registered automatically but can be overridden


# Lead-to-SEO: After finding leads, optionally audit their websites
def _init_default_workflows():
    """Initialize default workflow triggers"""

    # Example workflow: Lead found -> Run SEO audit if website exists
    register_trigger("lead_sourcing", "leads contains website", "seo_auditor")

    # Example workflow: Competitor analysis -> Check sentiment
    register_trigger("competitor", "score < 0.5", "reputation")

    # Example workflow: Revenue recovery found -> Add to outreach
    register_trigger("cashclaw", "recovered_total > 1000", "outreach")


# Initialize defaults
_init_default_workflows()


class WorkforceService:
    """Facade class that composes all workforce services"""

    def __init__(self):
        self.lead_sourcing = LeadSourcingService()
        self.outreach = OutreachService()
        self.goals = GoalsService()
        self.operations = OperationsService()
        self.cashclaw = CashClawService()

        # CashClaw Skill Nodes
        self.competitor = CompetitorIntelligenceService()
        self.seo_auditor = SEOAuditorService()
        self.reputation = ReputationManagerService()
        self.chat = ChatAutomationService()
        self.landing = LandingPageService()
        self.scraper = DataScraperService()

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
        return await self.operations.create_fiscal_request(
            purpose, amount, priority, session
        )

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
    "CompetitorIntelligenceService",
    "SEOAuditorService",
    "ReputationManagerService",
    "ChatAutomationService",
    "LandingPageService",
    "DataScraperService",
]


# ============ CONVENIENCE HELPERS ============


def configure_workflow_preset(preset: str):
    """
    Configure a predefined workflow preset.

    Presets:
    - "lead_gen": Leads -> SEO Audit -> Outreach (MEDIUM coupling)
    - "full_chain": Competitor -> Reputation -> Outreach -> Landing Page (TIGHT)
    - "minimal": No cross-service triggers (LOOSE)
    """
    presets = {
        "lead_gen": {
            "level": CouplingLevel.MEDIUM,
            "triggers": [
                ("lead_sourcing", "leads", "seo_auditor"),
                ("seo_auditor", "score < 70", "outreach"),
            ],
        },
        "full_chain": {
            "level": CouplingLevel.TIGHT,
            "triggers": [
                ("competitor", "score", "reputation"),
                ("reputation", "score < 0.5", "outreach"),
                ("outreach", "status == sent", "landing"),
                ("seo_auditor", "score", "competitor"),
            ],
        },
        "minimal": {"level": CouplingLevel.LOOSE, "triggers": []},
    }

    if preset not in presets:
        raise ValueError(f"Unknown preset: {preset}. Available: {list(presets.keys())}")

    config = presets[preset]
    set_coupling_level(config["level"])

    # Clear existing triggers and register new ones
    _coupling_config["triggers"] = {}
    for source, condition, target in config["triggers"]:
        register_trigger(source, condition, target)

    logger.info(
        f"Applied workflow preset: {preset} (coupling: {config['level'].value})"
    )


def get_workflow_status() -> Dict[str, Any]:
    """Get current workflow configuration status"""
    from app.services.workforce.base import _coupling_config

    return {
        "coupling_level": get_coupling_level().value,
        "workflows": list(_coupling_config.get("workflows", {}).keys()),
        "triggers": _coupling_config.get("triggers", {}),
    }


def set_coupling_from_preset(preset: str):
    """Set coupling level from preset name (loose/medium/tight)"""
    levels = {
        "loose": CouplingLevel.LOOSE,
        "medium": CouplingLevel.MEDIUM,
        "tight": CouplingLevel.TIGHT,
    }
    if preset.lower() not in levels:
        raise ValueError(f"Invalid preset: {preset}. Use: loose, medium, tight")
    set_coupling_level(levels[preset.lower()])
