"""
Automated Webhook Service for ReguLens
Handles Article 71 incident notifications and compliance drift alerts.
"""

from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from enum import Enum
import httpx
import json
import logging
import asyncio
import uuid

from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import WebhookConfig, WebhookExecution


class WebhookEventType(str, Enum):
    # Compliance events
    COMPLIANCE_CHECK_COMPLETE = "compliance.check_complete"
    COMPLIANCE_CHECK_FAILED = "compliance.check_failed"
    COMPLIANCE_SCORE_CHANGED = "compliance.score_changed"

    # Incident events (Article 71)
    INCIDENT_DETECTED = "incident.detected"
    INCIDENT_REPORTED = "incident.reported"
    INCIDENT_RESOLVED = "incident.resolved"

    # Risk events
    RISK_THRESHOLD_BREACHED = "risk.threshold_breached"
    BIAS_DETECTED = "bias.detected"
    MODEL_DRIFT_DETECTED = "model.drift_detected"

    # Documentation events
    DOCUMENTATION_OUT_OF_SYNC = "documentation.out_of_sync"
    TECHNICAL_FOLDER_EXPIRED = "technical_folder.expired"


# WebhookSubscription and WebhookPayload classes are now replaced by WebhookConfig/Execution in app.core.models


class WebhookPayload:
    """Standard webhook payload structure."""

    def __init__(
        self,
        event_type: WebhookEventType,
        data: Dict[str, Any],
        timestamp: Optional[datetime] = None,
    ):
        self.event_type = event_type
        self.data = data
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event": self.event_type.value,
            "timestamp": self.timestamp.isoformat(),
            "data": self.data,
        }


class WebhookService:
    """
    Manages webhook subscriptions and automated event delivery.
    Handles Article 71 incident notifications and compliance drift.
    """

    def __init__(self):
        # Persistence is now handled via engine and session
        self._processing = False
        self._monitoring_task: Optional[asyncio.Task] = None

    def start_monitoring(self):
        """Start the background incident monitoring task."""
        if not self._monitoring_task:
            self._monitoring_task = asyncio.create_task(self._monitor_incidents())
            logger.info("Started Article 71 Incident Monitoring")

    async def _monitor_incidents(self):
        """Background task to monitor agent audit logs for compliance incidents."""
        from app.core.models import AgentAuditLog

        while True:
            await asyncio.sleep(300)  # Check every 5 minutes

            try:
                with Session(engine) as session:
                    # Find recent high-risk audit log entries
                    from datetime import timedelta

                    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
                    high_risk_logs = session.exec(
                        select(AgentAuditLog).where(
                            (AgentAuditLog.timestamp >= five_min_ago)
                            & (AgentAuditLog.risk_score > 0.7)
                        )
                    ).all()

                    for log in high_risk_logs:
                        logger.warning(
                            f"High-risk event detected: agent={log.agent_id} "
                            f"action={log.action} risk={log.risk_score}"
                        )
                        await self.notify_incident(
                            incident_id=f"inc-{log.id[:8]}",
                            severity="serious" if log.risk_score > 0.9 else "moderate",
                            description=f"High-risk agent action: {log.action} (intent: {log.intent})",
                            affected_system=log.agent_id,
                        )
            except Exception as e:
                logger.error(f"Incident monitoring error: {e}")

    def subscribe(
        self,
        name: str,
        url: str,
        events: List[str],
        secret: Optional[str] = None,
    ) -> WebhookConfig:
        """Create a new webhook subscription."""
        with Session(engine) as session:
            subscription = WebhookConfig(
                name=name,
                url=url,
                events=events,
                secret=secret,
            )
            session.add(subscription)
            session.commit()
            session.refresh(subscription)
            logger.info(
                f"Created persistent webhook subscription: {subscription.id} ({name})"
            )
            return subscription

    def unsubscribe(self, subscription_id: str) -> bool:
        """Remove a webhook subscription."""
        with Session(engine) as session:
            subscription = session.get(WebhookConfig, subscription_id)
            if subscription:
                session.delete(subscription)
                session.commit()
                logger.info(
                    f"Removed persistent webhook subscription: {subscription_id}"
                )
                return True
            return False

    def update_subscription(
        self, subscription_id: str, data: Dict[str, Any]
    ) -> Optional[WebhookConfig]:
        """Update an existing webhook subscription."""
        with Session(engine) as session:
            subscription = session.get(WebhookConfig, subscription_id)
            if not subscription:
                return None

            for key, value in data.items():
                if hasattr(subscription, key):
                    setattr(subscription, key, value)

            session.add(subscription)
            session.commit()
            session.refresh(subscription)
            return subscription

    def list_subscriptions(self) -> List[WebhookConfig]:
        """List all webhook subscriptions."""
        with Session(engine) as session:
            statement = select(WebhookConfig)
            return session.exec(statement).all()

    async def trigger_event(
        self,
        event_type: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Trigger a webhook event to all matching subscribers."""

        with Session(engine) as session:
            statement = select(WebhookConfig).where(WebhookConfig.enabled == True)
            all_subs = session.exec(statement).all()

            # Find matching subscriptions
            matching_subs = [sub for sub in all_subs if event_type in sub.events]

        if not matching_subs:
            logger.info(f"No subscribers for event: {event_type}")
            return {
                "event": event_type,
                "delivered": 0,
                "failed": 0,
            }

        # Send to all subscribers
        results = []
        success_count = 0
        failed_count = 0

        for sub in matching_subs:
            result = await self._deliver_webhook(sub, event_type, data)
            results.append(result)

            if result["status"] == "success":
                success_count += 1
                # Update sub stats (done in separate session or updated here)
                with Session(engine) as session:
                    db_sub = session.get(WebhookConfig, sub.id)
                    if db_sub:
                        db_sub.trigger_count += 1
                        db_sub.last_triggered = datetime.utcnow()
                        session.add(db_sub)
                        session.commit()
            else:
                failed_count += 1
                with Session(engine) as session:
                    db_sub = session.get(WebhookConfig, sub.id)
                    if db_sub:
                        db_sub.failure_count += 1
                        session.add(db_sub)
                        session.commit()

        return {
            "event": event_type,
            "delivered": success_count,
            "failed": failed_count,
            "results": results,
        }

    async def _deliver_webhook(
        self,
        subscription: WebhookConfig,
        event_type: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Deliver a webhook to a specific subscription."""

        start_time = time.time() if "time" not in globals() else 0  # Simple timing
        import time as pytime

        start_time = pytime.time()

        payload = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
        }

        status = "error"
        status_code = None
        error_msg = None

        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Content-Type": "application/json",
                    "X-Webhook-Event": event_type,
                    "X-Webhook-Timestamp": payload["timestamp"],
                }

                # Add signature if secret is configured
                if subscription.secret:
                    import hmac
                    import hashlib

                    payload_str = json.dumps(payload)
                    signature = hmac.new(
                        subscription.secret.encode(),
                        payload_str.encode(),
                        hashlib.sha256,
                    ).hexdigest()
                    headers["X-Webhook-Signature"] = f"sha256={signature}"

                response = await client.post(
                    subscription.url,
                    json=payload,
                    headers=headers,
                    timeout=10.0,
                )

                status_code = response.status_code
                response.raise_for_status()
                status = "success"

        except httpx.TimeoutException:
            status = "timeout"
            error_msg = "Request timeout"
        except Exception as e:
            status = "error"
            error_msg = str(e)

        duration = int((pytime.time() - start_time) * 1000)

        # Log execution to database
        with Session(engine) as session:
            execution = WebhookExecution(
                webhook_id=subscription.id,
                event_type=event_type,
                payload=data,
                status=status,
                status_code=status_code,
                error_message=error_msg,
                duration_ms=duration,
            )
            session.add(execution)
            session.commit()

        return {
            "subscription_id": subscription.id,
            "status": status,
            "status_code": status_code,
            "error": error_msg,
        }

    # Convenience methods for common compliance events

    async def notify_incident(
        self,
        incident_id: str,
        severity: str,
        description: str,
        affected_system: str,
    ) -> Dict[str, Any]:
        """Notify subscribers of an AI incident (Article 71)."""
        return await self.trigger_event(
            WebhookEventType.INCIDENT_DETECTED,
            {
                "incident_id": incident_id,
                "severity": severity,  # "minor", "serious", "serious damage"
                "description": description,
                "affected_system": affected_system,
                "article_71_deadline": "72 hours",
                "reported_at": datetime.utcnow().isoformat(),
            },
        )

    async def notify_compliance_check(
        self,
        check_id: str,
        status: str,
        score: float,
        findings_count: int,
    ) -> Dict[str, Any]:
        """Notify subscribers of a completed compliance check."""
        return await self.trigger_event(
            WebhookEventType.COMPLIANCE_CHECK_COMPLETE,
            {
                "check_id": check_id,
                "status": status,
                "score": score,
                "findings_count": findings_count,
            },
        )

    async def notify_risk_threshold(
        self,
        metric: str,
        current_value: float,
        threshold: float,
        agent_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Notify subscribers when a risk threshold is breached."""
        return await self.trigger_event(
            WebhookEventType.RISK_THRESHOLD_BREACHED,
            {
                "metric": metric,
                "current_value": current_value,
                "threshold": threshold,
                "agent_id": agent_id,
                "breach_time": datetime.utcnow().isoformat(),
            },
        )

    async def notify_bias_detected(
        self,
        model_id: str,
        bias_type: str,
        statistical_significance: float,
        affected_groups: List[str],
    ) -> Dict[str, Any]:
        """Notify subscribers when bias is detected (Article 10)."""
        return await self.trigger_event(
            WebhookEventType.BIAS_DETECTED,
            {
                "model_id": model_id,
                "bias_type": bias_type,
                "statistical_significance": statistical_significance,
                "affected_groups": affected_groups,
                "article_10_requirement": "Data governance measures required",
            },
        )

    def get_event_history(
        self,
        subscription_id: Optional[str] = None,
        event_type: Optional[str] = None,
        limit: int = 50,
    ) -> List[WebhookExecution]:
        """Get webhook event delivery history from database."""
        with Session(engine) as session:
            statement = select(WebhookExecution)
            if subscription_id:
                statement = statement.where(
                    WebhookExecution.webhook_id == subscription_id
                )
            if event_type:
                statement = statement.where(WebhookExecution.event_type == event_type)

            statement = statement.order_by(WebhookExecution.timestamp.desc()).limit(
                limit
            )
            return session.exec(statement).all()


# Singleton instance
webhook_service = WebhookService()
