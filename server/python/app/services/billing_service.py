"""
Billing and Dynamic Budget Enforcement Service
Actively monitors token usage across all agents and automatically pauses operations if budget limits are exceeded.
"""

import asyncio
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import Agent, AlertConfig

logger = logging.getLogger(__name__)

class BillingService:
    def __init__(self):
        self._monitor_task = None
        self.is_running = False

    def start_budget_enforcement_loop(self):
        """Start the background enforcement loop"""
        if not self.is_running:
            self.is_running = True
            self._monitor_task = asyncio.create_task(self._monitor_loop())
            logger.info("Dynamic Budget Enforcement Service Started.")

    def stop_budget_enforcement_loop(self):
        self.is_running = False
        if self._monitor_task:
            self._monitor_task.cancel()

    async def _monitor_loop(self):
        """Continuously check agent spend against active budget rules."""
        while self.is_running:
            try:
                self.enforce_all_budgets()
            except Exception as e:
                logger.error(f"Error in budget enforcement loop: {e}")
            await asyncio.sleep(60) # Run every minute

    def enforce_all_budgets(self):
        """Check all agents against their budgets and active rules."""
        from app.core.models import AgentStatus
        with Session(engine) as session:
            agents = session.exec(select(Agent).where(Agent.status == AgentStatus.RUNNING)).all()
            rules = session.exec(select(AlertConfig).where(AlertConfig.is_active == True)).all()
            
            # Simple global budget rule parsing for demonstration
            global_budget_cap = None
            for rule in rules:
                if rule.alert_type == "budget_cap":
                    global_budget_cap = rule.threshold
            
            for agent in agents:
                effective_limit = agent.budget
                if global_budget_cap and global_budget_cap < agent.budget:
                    effective_limit = global_budget_cap
                
                if agent.dailySpend >= effective_limit:
                    logger.warning(f"Agent {agent.id} ({agent.name}) exceeded budget cap of {effective_limit}. Pausing agent...")
                    agent.status = AgentStatus.PAUSED
                    
                    # You would insert a new AuditLog here to document the enforcement
            
            session.commit()

# Singleton
billing_service = BillingService()
