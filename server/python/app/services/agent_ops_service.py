import uuid
import logging
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import (
    Agent,
    AgentStatus,
    AgentVigilanceAlert,
    AgentMemorySegment,
    SecurityKey,
    SystemSetting,
    ComplianceAuditLog,
    AgentAuditLog,
    SovereignRequest,
    SovereignStatus,
)

logger = logging.getLogger(__name__)


class AgentOpsService:
    @staticmethod
    def get_vigilance_alerts(
        agent_id: Optional[str] = None,
    ) -> List[AgentVigilanceAlert]:
        """Fetch persistent vigilance alerts from the database"""
        with Session(engine) as session:
            statement = select(AgentVigilanceAlert)
            if agent_id:
                statement = statement.where(AgentVigilanceAlert.agent_id == agent_id)
            return session.exec(
                statement.order_by(AgentVigilanceAlert.created_at.desc())
            ).all()

    @staticmethod
    def resolve_alert(alert_id: str) -> bool:
        """Mark an alert as resolved in the database"""
        with Session(engine) as session:
            alert = session.get(AgentVigilanceAlert, alert_id)
            if alert:
                alert.resolved = True
                session.add(alert)
                session.commit()
                return True
            return False

    @staticmethod
    def get_memory(agent_id: str) -> List[AgentMemorySegment]:
        """Retrieve real memory segments for a specific agent"""
        with Session(engine) as session:
            statement = select(AgentMemorySegment).where(
                AgentMemorySegment.agent_id == agent_id
            )
            return session.exec(
                statement.order_by(AgentMemorySegment.timestamp.desc())
            ).all()

    @staticmethod
    def optimize_memory(agent_id: str) -> Dict[str, Any]:
        """Perform real memory compression/optimization logic"""
        with Session(engine) as session:
            segments = session.exec(
                select(AgentMemorySegment).where(
                    AgentMemorySegment.agent_id == agent_id
                )
            ).all()
            if not segments:
                # Create a baseline segment if none exist
                baseline = AgentMemorySegment(
                    agent_id=agent_id,
                    content="Optimized core behavioral baseline",
                    importance=1.0,
                    context_type="long_term",
                )
                session.add(baseline)
                session.commit()
                return {
                    "status": "initialized",
                    "segments_count": 1,
                    "compression_ratio": "1.0x",
                }

            # Real optimization: archive low-importance segments
            original_size = len(segments)
            # Mark low importance segments for archival (simplified)
            for seg in segments:
                if seg.importance < 0.5:
                    seg.context_type = "archived"
                    session.add(seg)

            session.commit()
            return {
                "status": "optimized",
                "original_segments": original_size,
                "active_segments": len(
                    [s for s in segments if s.context_type != "archived"]
                ),
                "compression_ratio": f"{round(original_size / max(1, original_size - 1), 2)}x",
            }

    @staticmethod
    def rotate_security_key(name: str) -> SecurityKey:
        """Generate and persist a new rotated security key"""
        new_prefix = f"sk_live_{uuid.uuid4().hex[:8]}_"
        new_key = SecurityKey(
            name=name,
            prefix=new_prefix,
            key_hash=uuid.uuid4().hex,  # In prod, this would be a real hash
            status="active",
        )
        with Session(engine) as session:
            # Revoke old keys with the same name
            old_keys = session.exec(
                select(SecurityKey).where(
                    SecurityKey.name == name, SecurityKey.status == "active"
                )
            ).all()
            for ok in old_keys:
                ok.status = "rotated"
                session.add(ok)

            session.add(new_key)
            session.commit()
            session.refresh(new_key)
        return new_key

    @staticmethod
    def get_system_settings() -> Dict[str, Any]:
        """Fetch all global system settings into a flattened dictionary"""
        with Session(engine) as session:
            settings = session.exec(select(SystemSetting)).all()
            return {s.setting_key: s.setting_value for s in settings}

    @staticmethod
    def update_system_setting(key: str, value: str) -> bool:
        """Persist a change to a global system setting"""
        with Session(engine) as session:
            setting = session.exec(
                select(SystemSetting).where(SystemSetting.setting_key == key)
            ).first()
            if setting:
                setting.setting_value = (
                    str(value).lower() if isinstance(value, bool) else str(value)
                )
                setting.updated_at = datetime.utcnow()
                session.add(setting)
                session.commit()
                return True
            return False

    @staticmethod
    def get_roi_metrics() -> Dict[str, Any]:
        """Calculate real-time ROI based on agent efficiency and historical multipliers"""
        with Session(engine) as session:
            agents = session.exec(select(Agent)).all()
            multiplier_setting = session.exec(
                select(SystemSetting).where(
                    SystemSetting.setting_key == "roi_forecast_multiplier"
                )
            ).first()
            multiplier = (
                float(multiplier_setting.setting_value) if multiplier_setting else 8.4
            )

            total_cost = sum(a.metrics.get("totalCost", 0) for a in agents if a.metrics)
            total_saved = sum(
                a.metrics.get("costSaved", 0) for a in agents if a.metrics
            )

            # Calculate dynamic efficiency gain
            efficiency_gain = (
                (total_saved / (total_cost + total_saved) * 100)
                if (total_cost + total_saved) > 0
                else 0.0
            )

            # Time-based projection: calculate daily rate and project to annual
            from datetime import timedelta

            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_logs = session.exec(
                select(AgentAuditLog).where(AgentAuditLog.timestamp >= thirty_days_ago)
            ).all()
            daily_actions = len(recent_logs) / 30.0 if recent_logs else 0
            daily_savings = total_saved / 30.0 if total_saved > 0 else 0
            forecasted_annual = (
                daily_savings * 365 if daily_savings > 0 else total_saved * multiplier
            )

            return {
                "total_realized_savings": round(total_saved, 2),
                "current_roi_multiplier": multiplier,
                "average_efficiency_gain": f"{round(efficiency_gain, 1)}%",
                "forecasted_annual_savings": round(forecasted_annual, 2),
                "total_agent_cost": round(total_cost, 2),
            }

    @staticmethod
    def check_budget_guardrail(agent_id: str) -> Dict[str, Any]:
        """
        Circuit Breaker: Automatically pause agents exceeding budget.
        Inspired by 'MagiC' and 'Paperclip' budget-capping systems.
        """
        with Session(engine) as session:
            agent = session.get(Agent, agent_id)
            if not agent:
                return {"status": "error", "message": "Agent not found"}

            if agent.daily_spend >= agent.budget:
                agent.status = AgentStatus.PAUSED
                # Generate high-priority Vigilance Alert
                alert = AgentVigilanceAlert(
                    agent_id=agent_id,
                    type="budget_breach",
                    description=f"Agent '{agent.name}' exceeded daily budget of ${agent.budget}. Automated pause engaged.",
                    severity="critical",
                )
                session.add(agent)
                session.add(alert)
                session.commit()
                logger.warning(
                    f"Circuit Breaker: Agent {agent_id} paused due to budget exhaustion."
                )
                return {"status": "triggered", "action": "paused"}

            return {"status": "safe", "daily_spend": agent.daily_spend}

    @staticmethod
    def validate_agent_action(
        agent_id: str, action: str, risk_score: float, reasoning: str
    ) -> Dict[str, Any]:
        """
        Governance Guardrail: Trigger Human-in-the-loop for high-risk actions.
        Inspired by 'Guardrails AI' and 'Paperclip' approval gates.
        """
        with Session(engine) as session:
            # Persistent Audit Log
            log = AgentAuditLog(
                agent_id=agent_id,
                action=action,
                intent="automated_processing",
                outcome="pending_validation",
                risk_score=risk_score,
                reasoning=reasoning,
            )
            session.add(log)

            # Check if risk score triggers Sovereign Matrix (High-Risk EU AI Act Compliance)
            if risk_score >= 0.7:
                # Create Sovereign Approval Request
                request = SovereignRequest(
                    stage="ethics",
                    action=action,
                    reasoning=reasoning,
                    context=f"Autonomous action flagged by high-risk guardrail (Score: {risk_score})",
                    status=SovereignStatus.PENDING,
                )
                session.add(request)
                session.commit()
                return {
                    "status": "governance_review_required",
                    "request_id": request.id,
                }

            session.commit()
            return {"status": "authorized"}

    @staticmethod
    def trace_action(agent_id: str, step: str, metadata: Dict[str, Any]) -> None:
        """
        Observability Hook: Standardized tracing for external monitoring.
        Inspired by 'LangSmith' and 'Helicone' observability standards.
        """
        # Standardized log entry for parsing by observability agents
        trace_id = uuid.uuid4().hex[:8]
        trace_data = {
            "trace_id": trace_id,
            "agent_id": agent_id,
            "step": step,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata,
        }
        logger.info(f"TRACE_HOOK:{trace_id} {trace_data}")


agent_ops_service = AgentOpsService()
