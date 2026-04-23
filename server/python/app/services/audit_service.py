"""
Audit Service for AlphaHecta Hardening
Unifies querying of ComplianceAuditLog and AgentAuditLog for a real-time audit trail.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from sqlmodel import Session, select, desc, or_
from app.core.models import ComplianceAuditLog, AgentAuditLog

logger = logging.getLogger(__name__)

class AuditService:
    """
    Unified search service for all system and compliance actions.
    Ensures 100% audit visibility across PostgreSQL log tables.
    """

    def get_combined_logs(
        self, 
        session: Session, 
        agent_id: Optional[str] = None, 
        resource: Optional[str] = None,
        action: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fetch and merge compliance and operational logs into a single view.
        """
        combined = []

        # 1. Fetch Compliance Audit Logs (AI Act Registration, Scans, etc.)
        comp_query = select(ComplianceAuditLog)
        if resource:
            comp_query = comp_query.where(ComplianceAuditLog.resource.contains(resource))
        if action:
            comp_query = comp_query.where(ComplianceAuditLog.action == action)
        if status:
            comp_query = comp_query.where(ComplianceAuditLog.status == status)
        
        comp_logs = session.exec(comp_query.order_by(desc(ComplianceAuditLog.timestamp)).limit(limit)).all()
        
        for log in comp_logs:
            combined.append({
                "id": str(log.id),
                "timestamp": log.timestamp.isoformat(),
                "user": log.user_id,
                "action": log.action,
                "resource": log.resource,
                "status": log.status,
                "type": "compliance",
                "complianceType": log.compliance_type,
                "metadata": log.metadata_json
            })

        # 2. Fetch Agent Audit Logs (Cloning, Optimization, etc.)
        agent_query = select(AgentAuditLog)
        if agent_id:
            agent_query = agent_query.where(AgentAuditLog.agent_id == agent_id)
        if action:
            agent_query = agent_query.where(AgentAuditLog.action == action)
        
        agent_logs = session.exec(agent_query.order_by(desc(AgentAuditLog.timestamp)).limit(limit)).all()
        
        for log in agent_logs:
            combined.append({
                "id": str(log.id),
                "timestamp": log.timestamp.isoformat(),
                "user": log.user_id,
                "action": log.action,
                "resource": f"Agent:{log.agent_id}",
                "status": "completed", # Implicit success for these logs
                "type": "operational",
                "metadata": log.metadata_json
            })

        # Sort by timestamp descending
        combined.sort(key=lambda x: x["timestamp"], reverse=True)
        return combined[:limit]

# Singleton
audit_service = AuditService()
