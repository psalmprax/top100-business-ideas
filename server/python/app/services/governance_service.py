"""
Governance Service for Agent Ops
Manages budget rules, webhook subscriptions, and global retention policies.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import WebhookConfig, AlertConfig, AgentAuditLog
import asyncio

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
        logger.info(f"Updated global retention policy to {days} days. Spawning purge task...")
        
        # Fire and forget background DB pruning
        asyncio.create_task(self._purge_old_logs(days))
        
        return {
            "status": "success",
            "policy": {
                "retention_days": days,
                "auto_purge": True,
                "updated_at": datetime.utcnow().isoformat()
            }
        }

    async def _purge_old_logs(self, days_to_keep: int):
        """Asynchronously delete audit logs older than the retention policy."""
        try:
            cutoff = datetime.utcnow() - timedelta(days=days_to_keep)
            with Session(engine) as session:
                # Find old logs and delete them
                old_logs = session.exec(select(AgentAuditLog).where(AgentAuditLog.timestamp < cutoff)).all()
                count = len(old_logs)
                for log in old_logs:
                    session.delete(log)
                session.commit()
                logger.info(f"Purged {count} old AgentAuditLog records exceeding the {days_to_keep} day retention policy.")
        except Exception as e:
            logger.error(f"Failed to run retention purge logic: {e}")

    async def run_hipaa_audit(self, system: str = "default") -> Dict[str, Any]:
        """Execute a simulated HIPAA compliance audit on the specified system."""
        logger.info(f"Initiating HIPAA compliance audit for system: {system}")
        await asyncio.sleep(1.5) # Simulate processing
        
        findings = [
            {"id": "HIPAA-01", "check": "PHI Access Logging", "status": "Compliant"},
            {"id": "HIPAA-02", "check": "Data at Rest Encryption", "status": "Compliant"},
            {"id": "HIPAA-03", "check": "Unique User Identification", "status": "Warning", "detail": "3 stale sessions found"}
        ]
        
        return {
            "status": "success",
            "system": system,
            "timestamp": datetime.utcnow().isoformat(),
            "score": 92,
            "findings": findings
        }

    async def run_sox_audit(self, system: str = "default") -> Dict[str, Any]:
        """Execute a simulated SOX financial compliance audit."""
        logger.info(f"Initiating SOX financial audit for system: {system}")
        await asyncio.sleep(2.0) # Simulate processing
        
        findings = [
            {"id": "SOX-01", "check": "Financial Transaction integrity", "status": "Compliant"},
            {"id": "SOX-02", "check": "Access Control Review", "status": "Compliant"},
            {"id": "SOX-03", "check": "Segregation of Duties", "status": "Critical", "detail": "Admin has direct DB write access"}
        ]
        
        return {
            "status": "success",
            "system": system,
            "timestamp": datetime.utcnow().isoformat(),
            "score": 85,
            "findings": findings
        }

# Singleton instance
governance_service = GovernanceService()

