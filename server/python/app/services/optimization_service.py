import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from app.core.models import Agent, LLMUsageLog, WorkforceInteraction, InteractionStatus, AgentAuditLog
from app.core.database import engine

logger = logging.getLogger(__name__)

class OptimizationService:
    """
    Closed-loop workforce optimization engine.
    Analyzes telemetry to tune agent performance, cost, and alignment.
    """

    def analyze_llm_performance(self, agent_id: UUID, days: int = 7) -> Dict[str, Any]:
        """Analyze model performance and cost for a specific agent via LLMUsageLog"""
        since = datetime.utcnow() - timedelta(days=days)
        with Session(engine) as session:
            statement = select(LLMUsageLog).where(
                (LLMUsageLog.agent_id == agent_id) & (LLMUsageLog.created_at >= since)
            )
            logs = session.exec(statement).all()
            
            if not logs:
                return {"status": "insufficient_data", "recommendation": "MAINTAIN"}
            
            total_cost = sum(l.cost for l in logs)
            avg_latency = sum(l.latency_ms for l in logs) / len(logs)
            failure_count = sum(1 for l in logs if l.status == "error")
            success_rate = (len(logs) - failure_count) / len(logs)
            
            # Identify model complexity vs cost
            recommendation = self._get_model_recommendation(success_rate, total_cost, avg_latency)
            
            return {
                "total_requests": len(logs),
                "total_cost": round(total_cost, 4),
                "avg_latency_ms": round(avg_latency, 2),
                "success_rate": round(success_rate, 2),
                "recommendation": recommendation
            }

    def _get_model_recommendation(self, success_rate: float, cost: float, latency: float) -> str:
        """Heuristic for model optimization"""
        if success_rate < 0.85:
            return "UPGRADE_MODEL" # Low reliability, need more reasoning power
        if cost > 1.0 and success_rate > 0.98 and latency > 5000:
            return "DOWNGRADE_MODEL" # Over-specified, slow, and expensive
        if latency > 15000:
            return "SWITCH_PROVIDER" # Regional or provider latency spikes
        return "MAINTAIN"

    def optimize_agent(self, agent_id: UUID) -> Dict[str, Any]:
        """Apply automatic tuning to an agent's configuration based on performance"""
        try:
            with Session(engine) as session:
                agent = session.get(Agent, agent_id)
                if not agent:
                    return {"status": "error", "message": "Agent not found"}
                
                performance = self.analyze_llm_performance(agent_id)
                rec = performance.get("recommendation")
                
                updates = {}
                # Strategic transitions to optimize ROI
                if rec == "DOWNGRADE_MODEL" and agent.model == "gpt-4o":
                    agent.model = "gpt-4o-mini"
                    agent.provider = "openai"
                    updates["model"] = "gpt-4o-mini"
                elif rec == "UPGRADE_MODEL" and agent.model == "gpt-4o-mini":
                    agent.model = "gpt-4o"
                    updates["model"] = "gpt-4o"
                elif rec == "SWITCH_PROVIDER" and agent.provider == "openai":
                    # Failover or performance-based provider switch to Azure
                    agent.provider = "azure"
                    updates["provider"] = "azure"
                    
                if updates:
                    agent.updated_at = datetime.utcnow()
                    session.add(agent)
                    
                    # Strategic: Enforce Audit Trail for Autonomous Tuning
                    audit_entry = AgentAuditLog(
                        agent_id=agent.id,
                        action="AUTONOMOUS_TUNING",
                        intent=f"Optimization recommended: {rec}",
                        outcome="success",
                        reasoning=f"Performance metrics: Success={performance.get('success_rate')}, Cost={performance.get('total_cost')}. Applied updates: {updates}",
                        risk_score=0.2 if rec == "DOWNGRADE_MODEL" else 0.1,
                        metadata_json={
                            "performance": performance,
                            "updates": updates,
                            "previous_model": agent.model if "model" in updates else None
                        }
                    )
                    session.add(audit_entry)
                    
                    session.commit()
                    logger.info(f"[Optimization] Agent {agent_id} auto-tuned: {updates}")
                
                return {
                    "agent_id": str(agent_id),
                    "performance": performance,
                    "updates_applied": updates,
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            logger.error(f"[Optimization] Tuning failure for {agent_id}: {e}")
            return {"status": "error", "message": str(e)}

    def get_workforce_efficiency_report(self) -> List[Dict[str, Any]]:
        """Generate a global efficiency report for the telemetry dashboard"""
        with Session(engine) as session:
            agents = session.exec(select(Agent)).all()
            report = []
            for agent in agents:
                performance = self.analyze_llm_performance(agent.id)
                # Join with feedback data
                feedback_counts = session.exec(
                    select(WorkforceInteraction.user_feedback, func.count(WorkforceInteraction.id))
                    .where(WorkforceInteraction.agent_role.ilike(f"%{agent.name}%"))
                    .group_by(WorkforceInteraction.user_feedback)
                ).all()
                
                feedback_map = {str(f[0]): f[1] for f in feedback_counts}
                
                report.append({
                    "agent_id": str(agent.id),
                    "agent_name": agent.name,
                    "model": agent.model,
                    "provider": agent.provider,
                    "llm_performance": performance,
                    "feedback_summary": feedback_map
                })
            return report

optimization_service = OptimizationService()
