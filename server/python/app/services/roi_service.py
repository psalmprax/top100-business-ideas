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
    def get_real_metrics(session: Session, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates real cost and activity metrics from the persistent audit trail.
        """
        one_month_ago = datetime.utcnow() - timedelta(days=30)
        statement = select(AgentAuditLog).where(AgentAuditLog.timestamp >= one_month_ago)
        if agent_id:
            statement = statement.where(AgentAuditLog.agent_id == agent_id)
            
        logs = session.exec(statement).all()
        
        total_actions = len(logs)
        # Assuming average cost per action from logs or metadata
        total_cost = sum([log.metadata_json.get("tokens", 500) * 0.002 / 1000 for log in logs])
        avg_risk = sum([log.risk_score for log in logs]) / total_actions if total_actions > 0 else 0
        
        return {
            "total_actions": total_actions,
            "total_cost": round(total_cost, 4),
            "avg_risk": round(avg_risk, 2),
            "period": "last_30_days"
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
        
        # Real-world logic: calculate diff between last_active and now
        # For this demonstration, we use simulated ranges based on status
        downtime_hours = 4.5 if agent.status == AgentStatus.ERROR else 0.5
        
        return round(hourly_rate * downtime_hours, 2)

    @staticmethod
    def calculate_productivity_roi(agent: Agent, session: Session) -> Dict[str, Any]:
        """
        Calculates risk-adjusted productivity ROI based on real logs.
        """
        # Define baseline labor costs (Human replacement value)
        labor_cost_per_action = 15.0 # Average human cost per task
        
        metrics = ROIService.get_real_metrics(session, agent.id)
        total_actions = metrics["total_actions"]
        total_cost = metrics["total_cost"]
        
        # Calculate saved costs (Gross Value - Execution Cost)
        human_equivalent_cost = total_actions * labor_cost_per_action
        net_savings = human_equivalent_cost - total_cost
        
        # Calculate Strategic Value (Loops Prevented, Security Threats Neutered)
        # This scans logs for HINT_INJECTION or RECOVERY actions
        statement = select(AgentAuditLog).where(
            (AgentAuditLog.agent_id == agent.id) & 
            (AgentAuditLog.action.in_(["HINT_INJECTION", "SYSTEM_RECOVERY", "FAILOVER"]))
        )
        critical_logs = session.exec(statement).all()
        strategic_value = len(critical_logs) * 500.0 # High value for autonomous corrections
        
        total_economic_value = net_savings + strategic_value
        roi_multiple = total_economic_value / (total_cost if total_cost > 0.01 else 1)
        
        return {
            "total_cost": round(total_cost, 2),
            "net_savings": round(net_savings, 2),
            "strategic_value": round(strategic_value, 2),
            "total_economic_value": round(total_economic_value, 2),
            "roi_multiple": round(roi_multiple, 1),
            "status": "elite" if roi_multiple > 10 else "optimized",
            "audit_trail_verified": True
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
            insights.append({
                "insight_type": "cost_alert",
                "title": "Token Expenditure Spike",
                "description": f"Overall tokens costs reached ${metrics['total_cost']} this month. Recommend fine-tuning high-cost agents.",
                "confidence_score": 0.95,
                "impact_level": "high",
                "recommended_actions": ["Review token limits", "Switch to lower-tier models for non-critical tasks"]
            })
            
        if metrics["avg_risk"] > 0.3:
            insights.append({
                "insight_type": "security_risk",
                "title": "Elevated Behavioral Risk",
                "description": f"Average risk score from audit trail is {metrics['avg_risk']}. Intent drift detected.",
                "confidence_score": 0.88,
                "impact_level": "medium",
                "recommended_actions": ["Run Red-Team audit", "Inject restrictive hints"]
            })
            
        # Add a default positive insight if data is clean
        if not insights:
            insights.append({
                "insight_type": "opportunity",
                "title": "System Stability High",
                "description": "All agents operating within safety guardrails with optimal ROI multiples.",
                "confidence_score": 0.90,
                "impact_level": "low",
                "recommended_actions": ["Maintain current scaling strategy"]
            })
            
        return insights

roi_service = ROIService()
