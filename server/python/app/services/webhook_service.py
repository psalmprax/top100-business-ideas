"""
Automated Webhook Service for ReguLens
Handles Article 71 incident notifications and compliance drift alerts.
"""

from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from enum import Enum
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)


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


class WebhookSubscription:
    """Represents a webhook subscription."""
    
    def __init__(
        self,
        subscription_id: str,
        url: str,
        events: List[WebhookEventType],
        secret: Optional[str] = None,
        enabled: bool = True,
    ):
        self.subscription_id = subscription_id
        self.url = url
        self.events = events
        self.secret = secret
        self.enabled = enabled
        self.created_at = datetime.utcnow()
        self.last_triggered = None
        self.trigger_count = 0
        self.failure_count = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "subscription_id": self.subscription_id,
            "url": self.url,
            "events": [e.value for e in self.events],
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
            "last_triggered": self.last_triggered.isoformat() if self.last_triggered else None,
            "trigger_count": self.trigger_count,
            "failure_count": self.failure_count,
        }


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
        self.subscriptions: Dict[str, WebhookSubscription] = {}
        self.event_history: List[Dict[str, Any]] = []
        self._processing = False
    
    def subscribe(
        self,
        subscription_id: str,
        url: str,
        events: List[str],
        secret: Optional[str] = None,
    ) -> WebhookSubscription:
        """Create a new webhook subscription."""
        # Convert string events to enums
        event_enums = []
        for e in events:
            try:
                event_enums.append(WebhookEventType(e))
            except ValueError:
                logger.warning(f"Unknown event type: {e}")
        
        subscription = WebhookSubscription(
            subscription_id=subscription_id,
            url=url,
            events=event_enums,
            secret=secret,
        )
        
        self.subscriptions[subscription_id] = subscription
        logger.info(f"Created webhook subscription: {subscription_id} for {len(event_enums)} events")
        
        return subscription
    
    def unsubscribe(self, subscription_id: str) -> bool:
        """Remove a webhook subscription."""
        if subscription_id in self.subscriptions:
            del self.subscriptions[subscription_id]
            logger.info(f"Removed webhook subscription: {subscription_id}")
            return True
        return False
    
    def list_subscriptions(self) -> List[Dict[str, Any]]:
        """List all webhook subscriptions."""
        return [s.to_dict() for s in self.subscriptions.values()]
    
    async def trigger_event(
        self,
        event_type: WebhookEventType,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Trigger a webhook event to all matching subscribers."""
        
        # Create payload
        payload = WebhookEventType(event_type, data)
        
        # Find matching subscriptions
        matching_subs = [
            sub for sub in self.subscriptions.values()
            if sub.enabled and event_type in sub.events
        ]
        
        if not matching_subs:
            logger.info(f"No subscribers for event: {event_type.value}")
            return {
                "event": event_type.value,
                "delivered": 0,
                "failed": 0,
            }
        
        # Send to all subscribers
        results = []
        success_count = 0
        failed_count = 0
        
        for sub in matching_subs:
            result = await self._deliver_webhook(sub, payload)
            results.append(result)
            
            if result["status"] == "success":
                success_count += 1
                sub.trigger_count += 1
                sub.last_triggered = datetime.utcnow()
            else:
                failed_count += 1
                sub.failure_count += 1
        
        # Record in history
        self.event_history.append({
            "event_type": event_type.value,
            "timestamp": datetime.utcnow().isoformat(),
            "delivered": success_count,
            "failed": failed_count,
            "subscribers": [s.subscription_id for s in matching_subs],
        })
        
        # Keep only last 100 events
        if len(self.event_history) > 100:
            self.event_history = self.event_history[-100:]
        
        return {
            "event": event_type.value,
            "delivered": success_count,
            "failed": failed_count,
            "results": results,
        }
    
    async def _deliver_webhook(
        self,
        subscription: WebhookSubscription,
        payload: WebhookPayload,
    ) -> Dict[str, Any]:
        """Deliver a webhook to a specific subscription."""
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Content-Type": "application/json",
                    "X-Webhook-Event": payload.event_type.value,
                    "X-Webhook-Timestamp": payload.timestamp.isoformat(),
                }
                
                # Add signature if secret is configured
                if subscription.secret:
                    import hmac
                    import hashlib
                    payload_str = str(payload.to_dict())
                    signature = hmac.new(
                        subscription.secret.encode(),
                        payload_str.encode(),
                        hashlib.sha256,
                    ).hexdigest()
                    headers["X-Webhook-Signature"] = f"sha256={signature}"
                
                response = await client.post(
                    subscription.url,
                    json=payload.to_dict(),
                    headers=headers,
                    timeout=10.0,
                )
                
                response.raise_for_status()
                
                return {
                    "subscription_id": subscription.subscription_id,
                    "status": "success",
                    "status_code": response.status_code,
                }
                
        except httpx.TimeoutException:
            logger.warning(f"Webhook delivery timeout: {subscription.subscription_id}")
            return {
                "subscription_id": subscription.subscription_id,
                "status": "timeout",
                "error": "Request timeout",
            }
        except Exception as e:
            logger.error(f"Webhook delivery failed: {subscription.subscription_id}: {e}")
            return {
                "subscription_id": subscription.subscription_id,
                "status": "error",
                "error": str(e),
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
        event_type: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Get webhook event delivery history."""
        history = self.event_history
        
        if event_type:
            history = [h for h in history if h["event_type"] == event_type]
        
        return history[-limit:]


# Singleton instance
webhook_service = WebhookService()
