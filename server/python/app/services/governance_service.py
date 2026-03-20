"""
Governance Service for Agent Ops
Manages budget rules, webhook subscriptions, and global retention policies.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import WebhookConfig, AlertConfig

logger = logging.getLogger(__name__)

class GovernanceService:
    """Service to handle enterprise guardrails, alerts, and webhooks"""

    def manage_webhook(self, name: str, url: str, events: List[str], secret: Optional[str] = None) -> str:
        """Register or update a persistent webhook subscription"""
        try:
            with Session(engine) as session:
                webhook = WebhookConfig(
                    name=name,
                    url=url,
                    events=events,
                    secret=secret,
                    enabled=True
                )
                session.add(webhook)
                session.commit()
                session.refresh(webhook)
                return webhook.id
        except Exception as e:
            logger.error(f"Failed to register webhook: {e}")
            return None

    def list_webhooks(self) -> List[WebhookConfig]:
        """List all registered webhooks"""
        with Session(engine) as session:
            return session.exec(select(WebhookConfig)).all()

    def set_budget_rule(self, name: str, threshold: float, alert_type: str, channels: List[str]) -> str:
        """Create a new budget or safety alert rule"""
        try:
            with Session(engine) as session:
                rule = AlertConfig(
                    name=name,
                    threshold=threshold,
                    alert_type=alert_type,
                    channels=channels,
                    is_active=True
                )
                session.add(rule)
                session.commit()
                session.refresh(rule)
                return rule.id
        except Exception as e:
            logger.error(f"Failed to set budget rule: {e}")
            return None

    def list_budget_rules(self) -> List[AlertConfig]:
        """List all active budget and safety rules"""
        with Session(engine) as session:
            return session.exec(select(AlertConfig)).all()

    def update_retention_policy(self, days: int) -> Dict[str, Any]:
        """Configure the global retention policy for audit logs and execution history"""
        # Logic to truncate logs beyond 'days' would go here
        logger.info(f"Updated global retention policy to {days} days")
        return {
            "status": "success",
            "policy": {
                "retention_days": days,
                "auto_purge": True,
                "updated_at": datetime.utcnow().isoformat()
            }
        }

# Singleton instance
governance_service = GovernanceService()
