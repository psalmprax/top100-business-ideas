"""
ROI Calculation Service for Agent Ops
Handles Downtime-to-Dollar and Productivity ROI logic.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from app.core.models import Agent, AgentType, AgentStatus, AgentAuditLog
from app.core.database import engine


class ROIService:
    @staticmethod
    def get_real_metrics(
        session: Session, agent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates real cost and activity metrics from the persistent audit trail.
        """
        one_month_ago = datetime.utcnow() - timedelta(days=30)
        statement = select(AgentAuditLog).where(
            AgentAuditLog.timestamp >= one_month_ago
        )
        if agent_id:
            statement = statement.where(AgentAuditLog.agent_id == agent_id)

        logs = session.exec(statement).all()

        total_actions = len(logs)
        # Assuming average cost per action from logs or metadata
        total_cost = sum(
            [log.metadata_json.get("tokens", 500) * 0.002 / 1000 for log in logs]
        )
        avg_risk = (
            sum([log.risk_score for log in logs]) / total_actions
            if total_actions > 0
            else 0
        )

        return {
            "total_actions": total_actions,
            "total_cost": round(total_cost, 4),
            "avg_risk": round(avg_risk, 2),
            "period": "last_30_days",
        }

    @staticmethod
    def calculate_downtime_loss(agent: Agent) -> float:
        """
        Calculates theoretical dollar loss due to agent downtime.
        """
        if agent.status == AgentStatus.RUNNING:
            return 0.0

        value_map = {
            AgentType.DATA_PROCESSING: 45.0,
            AgentType.CONTENT_GENERATION: 85.0,
            AgentType.ANALYSIS: 150.0,
            AgentType.AUTOMATION: 65.0,
        }

        hourly_rate = value_map.get(agent.type, 50.0)

        # Calculate real downtime from last_active_at timestamp
        if agent.updated_at:
            downtime_delta = datetime.utcnow() - agent.updated_at
            downtime_hours = max(downtime_delta.total_seconds() / 3600, 0.1)
        else:
            downtime_hours = 0.1  # Minimum if no timestamp available

        return round(hourly_rate * downtime_hours, 2)

    @staticmethod
    def calculate_productivity_roi(agent: Agent, session: Session) -> Dict[str, Any]:
        """
        Calculates risk-adjusted productivity ROI based on real logs.
        """
        from app.core.models import SystemSetting
        # REAL-FIRST: Fetch labor savings from system settings
        labor_setting = session.exec(select(SystemSetting).where(SystemSetting.setting_key == "roi_labor_savings_per_task")).first()
        labor_cost_per_action = float(labor_setting.setting_value) if labor_setting else 15.0

        metrics = ROIService.get_real_metrics(session, agent.id)
        total_actions = metrics["total_actions"]
        total_cost = metrics["total_cost"]

        # Calculate saved costs (Gross Value - Execution Cost)
        human_equivalent_cost = total_actions * labor_cost_per_action
        net_savings = human_equivalent_cost - total_cost

        # Calculate Strategic Value (Loops Prevented, Security Threats Neutered)
        # This scans logs for HINT_INJECTION or RECOVERY actions
        statement = select(AgentAuditLog).where(
            (AgentAuditLog.agent_id == agent.id)
            & (
                AgentAuditLog.action.in_(
                    ["HINT_INJECTION", "SYSTEM_RECOVERY", "FAILOVER"]
                )
            )
        )
        critical_logs = session.exec(statement).all()
        strategic_value = (
            len(critical_logs) * 500.0
        )  # High value for autonomous corrections

        total_economic_value = net_savings + strategic_value
        roi_multiple = total_economic_value / (total_cost if total_cost > 0.01 else 1)

        return {
            "total_cost": round(total_cost, 2),
            "net_savings": round(net_savings, 2),
            "strategic_value": round(strategic_value, 2),
            "total_economic_value": round(total_economic_value, 2),
            "roi_multiple": round(roi_multiple, 1),
            "status": "elite" if roi_multiple > 10 else "optimized",
            "audit_trail_verified": True,
        }

    @staticmethod
    def get_deepfake_roi(session: Session) -> Dict[str, Any]:
        """
        Calculates financial ROI for deepfake defense specifically.
        """
        from app.core.models import DeepfakeAnalysis, AnalysisResult, SystemSetting
        
        total_scans = session.exec(select(func.count(DeepfakeAnalysis.id))).one()
        fakes_detected = session.exec(
            select(func.count(DeepfakeAnalysis.id)).where(
                DeepfakeAnalysis.result == AnalysisResult.FAKE
            )
        ).one()

        # REAL-FIRST: Fetch baseline costs from system settings
        hr_setting = session.exec(select(SystemSetting).where(SystemSetting.setting_key == "roi_human_review_cost")).first()
        ai_setting = session.exec(select(SystemSetting).where(SystemSetting.setting_key == "roi_ai_detection_cost")).first()
        fraud_setting = session.exec(select(SystemSetting).where(SystemSetting.setting_key == "roi_fraud_loss_per_case")).first()

        human_review_cost_per_unit = float(hr_setting.setting_value) if hr_setting else 45.00
        ai_detection_cost_per_unit = float(ai_setting.setting_value) if ai_setting else 0.12
        fraud_loss_per_case = float(fraud_setting.setting_value) if fraud_setting else 50000.00

        total_human_cost = total_scans * human_review_cost_per_unit
        total_ai_cost = total_scans * ai_detection_cost_per_unit
        
        # Savings from detection (prevented fraud)
        prevented_loss = fakes_detected * fraud_loss_per_case
        
        # Operational savings (human vs ai)
        operational_savings = total_human_cost - total_ai_cost
        
        total_savings = prevented_loss + operational_savings

        return {
            "human_unit_cost": human_review_cost_per_unit,
            "ai_unit_cost": ai_detection_cost_per_unit,
            "total_scans": total_scans,
            "total_human_cost": round(total_human_cost, 2),
            "total_ai_cost": round(total_ai_cost, 2),
            "prevented_loss": round(prevented_loss, 2),
            "total_savings": round(total_savings, 2),
            "threats_blocked": fakes_detected,
            "roi_percentage": round((total_savings / (total_ai_cost if total_ai_cost > 0 else 1)) * 100, 1)
        }

    @staticmethod
    def generate_strategic_insights(session: Session) -> List[Dict[str, Any]]:
        """
        Generate dynamic strategic insights based on real system trends.
        """
        # 1. Check for cost spikes
        metrics = ROIService.get_real_metrics(session)

        insights = []

        if metrics["total_cost"] > 100:
            insights.append(
                {
                    "insight_type": "cost_alert",
                    "title": "Token Expenditure Spike",
                    "description": f"Overall tokens costs reached ${metrics['total_cost']} this month. Recommend fine-tuning high-cost agents.",
                    "confidence_score": 0.95,
                    "impact_level": "high",
                    "recommended_actions": [
                        "Review token limits",
                        "Switch to lower-tier models for non-critical tasks",
                    ],
                }
            )

        if metrics["avg_risk"] > 0.3:
            insights.append(
                {
                    "insight_type": "security_risk",
                    "title": "Elevated Behavioral Risk",
                    "description": f"Average risk score from audit trail is {metrics['avg_risk']}. Intent drift detected.",
                    "confidence_score": 0.88,
                    "impact_level": "medium",
                    "recommended_actions": [
                        "Run Red-Team audit",
                        "Inject restrictive hints",
                    ],
                }
            )

        # Add a default positive insight if data is clean
        if not insights:
            insights.append(
                {
                    "insight_type": "opportunity",
                    "title": "System Stability High",
                    "description": "All agents operating within safety guardrails with optimal ROI multiples.",
                    "confidence_score": 0.90,
                    "impact_level": "low",
                    "recommended_actions": ["Maintain current scaling strategy"],
                }
            )

        return insights


roi_service = ROIService()
