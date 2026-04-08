"""
GraphQL Gateway for Alpha Products
Provides unified GraphQL API for Agent Ops, Compliance, and Deepfake.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging

logger = logging.getLogger(__name__)


class GraphQLQueryType(str, Enum):
    # Agent Ops queries
    AGENT_LIST = "agents"
    AGENT_SINGLE = "agent"
    AGENT_METRICS = "agentMetrics"
    BUDGET_STATUS = "budgetStatus"
    AUDIT_LOGS = "auditLogs"

    # Compliance queries
    COMPLIANCE_CHECKS = "complianceChecks"
    COMPLIANCE_CHECK = "complianceCheck"
    COMPLIANCE_CATEGORIES = "complianceCategories"
    SUPPLY_CHAIN = "supplyChain"
    VENDOR_STATUS = "vendorStatus"

    # Deepfake queries
    DEEPFAKE_ANALYSES = "deepfakeAnalyses"
    DEEPFAKE_ANALYSIS = "deepfakeAnalysis"
    DEEPFAKE_STATS = "deepfakeStats"
    BIOMETRIC_STATUS = "biometricStatus"
    SESSION_STATUS = "sessionStatus"


class GraphQLResolver:
    """
    GraphQL resolver that handles queries for all three Alpha products.
    """

    def __init__(self):
        from app.core.database import engine

        self.engine = engine

    async def resolve(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Main GraphQL resolution entry point."""

        operation_type = query.get("type", "query")

        if operation_type == "query":
            return await self._resolve_query(query)
        elif operation_type == "mutation":
            return await self._resolve_mutation(query)
        else:
            return {
                "errors": [{"message": f"Unknown operation type: {operation_type}"}]
            }

    async def _resolve_query(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve GraphQL queries."""

        selection = query.get("selection", {})

        # Agent Ops queries
        if "agents" in selection:
            return {"agents": await self._resolve_agents(selection.get("agents", {}))}

        if "agent" in selection:
            return {"agent": await self._resolve_agent(selection.get("agent", {}))}

        if "agentMetrics" in selection:
            return {
                "agentMetrics": await self._resolve_agent_metrics(
                    selection.get("agentMetrics", {})
                )
            }

        # Compliance queries
        if "complianceChecks" in selection:
            return {
                "complianceChecks": await self._resolve_compliance_checks(
                    selection.get("complianceChecks", {})
                )
            }

        if "supplyChain" in selection:
            return {
                "supplyChain": await self._resolve_supply_chain(
                    selection.get("supplyChain", {})
                )
            }

        # Deepfake queries
        if "deepfakeAnalyses" in selection:
            return {
                "deepfakeAnalyses": await self._resolve_deepfake_analyses(
                    selection.get("deepfakeAnalyses", {})
                )
            }

        if "deepfakeStats" in selection:
            return {"deepfakeStats": await self._resolve_deepfake_stats()}

        return {"errors": [{"message": "No valid query selections found"}]}

    async def _resolve_mutation(self, mutation: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve GraphQL mutations."""

        selection = mutation.get("selection", {})

        # Agent Ops mutations
        if "createAgent" in selection:
            return {
                "createAgent": await self._resolve_create_agent(
                    selection.get("createAgent", {})
                )
            }

        if "updateAgent" in selection:
            return {
                "updateAgent": await self._resolve_update_agent(
                    selection.get("updateAgent", {})
                )
            }

        if "pauseAgent" in selection:
            return {
                "pauseAgent": await self._resolve_pause_agent(
                    selection.get("pauseAgent", {})
                )
            }

        # Compliance mutations
        if "runComplianceCheck" in selection:
            return {
                "runComplianceCheck": await self._resolve_run_compliance_check(
                    selection.get("runComplianceCheck", {})
                )
            }

        # Deepfake mutations
        if "analyzeMedia" in selection:
            return {
                "analyzeMedia": await self._resolve_analyze_media(
                    selection.get("analyzeMedia", {})
                )
            }

        if "createBiometricChallenge" in selection:
            return {
                "createBiometricChallenge": await self._resolve_create_challenge(
                    selection.get("createBiometricChallenge", {})
                )
            }

        return {"errors": [{"message": "No valid mutation selections found"}]}

    # ========== Agent Ops Resolvers ==========

    async def _resolve_agents(self, selection: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Resolve agents list query from real database."""
        from sqlmodel import Session, select
        from app.core.models import Agent

        with Session(self.engine) as session:
            agents = session.exec(select(Agent).limit(50)).all()
            return [
                {
                    "id": a.id,
                    "name": a.name,
                    "type": a.type.value if hasattr(a.type, "value") else str(a.type),
                    "status": a.status.value
                    if hasattr(a.status, "value")
                    else str(a.status),
                    "budget": a.budget,
                    "daily_spend": a.daily_spend,
                    "metrics": a.metrics or {},
                    "createdAt": a.created_at.isoformat() + "Z" if a.created_at else "",
                }
                for a in agents
            ]

    async def _resolve_agent(
        self, selection: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Resolve single agent query from real database."""
        agent_id = selection.get("id")
        if not agent_id:
            return {"errors": [{"message": "Agent ID required"}]}

        from sqlmodel import Session
        from app.core.models import Agent

        with Session(self.engine) as session:
            a = session.get(Agent, agent_id)
            if not a:
                return None
            return {
                "id": a.id,
                "name": a.name,
                "type": a.type.value if hasattr(a.type, "value") else str(a.type),
                "status": a.status.value
                if hasattr(a.status, "value")
                else str(a.status),
                "budget": a.budget,
                "daily_spend": a.daily_spend,
                "metrics": a.metrics or {},
            }

    async def _resolve_agent_metrics(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve agent metrics query from real database."""
        from sqlmodel import Session, select, func
        from app.core.models import Agent, AgentStatus

        with Session(self.engine) as session:
            total = session.exec(select(func.count(Agent.id))).one() or 0
            running = (
                session.exec(
                    select(func.count(Agent.id)).where(
                        Agent.status == AgentStatus.RUNNING
                    )
                ).one()
                or 0
            )
            stopped = (
                session.exec(
                    select(func.count(Agent.id)).where(
                        Agent.status == AgentStatus.STOPPED
                    )
                ).one()
                or 0
            )
            error = (
                session.exec(
                    select(func.count(Agent.id)).where(
                        Agent.status == AgentStatus.ERROR
                    )
                ).one()
                or 0
            )

            agents = session.exec(select(Agent)).all()
            total_cost = sum(a.metrics.get("totalCost", 0) for a in agents if a.metrics)

            top = sorted(
                [(a.id, a.daily_spend) for a in agents],
                key=lambda x: x[1],
                reverse=True,
            )[:5]

            return {
                "totalAgents": total,
                "running": running,
                "stopped": stopped,
                "error": error,
                "totalCostToday": round(total_cost, 2),
                "projectedMonthlyCost": round(total_cost * 30, 2),
                "topConsumers": [{"agentId": aid, "daily_spend": ds} for aid, ds in top],
            }

    async def _resolve_create_agent(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve create agent mutation."""
        name = selection.get("name", "New Agent")
        agent_type = selection.get("type", "ANALYSIS")
        budget = selection.get("budget", 50.0)

        new_agent = {
            "id": str(uuid.uuid4()),
            "name": name,
            "type": agent_type,
            "status": "STOPPED",
            "budget": budget,
            "daily_spend": 0.0,
            "metrics": {"totalRequests": 0, "loopsPrevented": 0, "costSaved": 0.0},
            "createdAt": datetime.utcnow().isoformat() + "Z",
        }

        return new_agent

    async def _resolve_update_agent(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve update agent mutation."""
        agent_id = selection.get("id")
        return {
            "id": agent_id,
            "name": selection.get("name", "Updated Agent"),
            "status": "RUNNING",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
        }

    async def _resolve_pause_agent(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve pause agent mutation."""
        agent_id = selection.get("id")
        return {
            "id": agent_id,
            "status": "STOPPED",
            "pausedAt": datetime.utcnow().isoformat() + "Z",
        }

    # ========== Compliance Resolvers ==========

    async def _resolve_compliance_checks(
        self, selection: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Resolve compliance checks query."""
        from sqlmodel import Session, select
        from app.core.models import AIModel

        with Session(self.engine) as session:
            models = session.exec(select(AIModel).limit(20)).all()
            return [
                {
                    "id": m.id,
                    "type": m.risk_category or "GENERAL",
                    "status": m.status,
                    "score": m.compliance_score or 0,
                    "findings": [],
                    "checkedAt": m.last_audit.isoformat() + "Z" if m.last_audit else "",
                }
                for m in models
            ]

    async def _resolve_supply_chain(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve supply chain query from real database."""
        from sqlmodel import Session, select
        from app.core.models import Vendor

        with Session(self.engine) as session:
            vendors = session.exec(select(Vendor)).all()
            compliant = sum(1 for v in vendors if v.compliance_status == "compliant")
            pending = sum(1 for v in vendors if v.compliance_status == "pending")
            non_compliant = len(vendors) - compliant - pending

            return {
                "totalVendors": len(vendors),
                "compliant": compliant,
                "pending": pending,
                "nonCompliant": non_compliant,
                "riskLevel": "LOW"
                if non_compliant == 0
                else "MEDIUM"
                if non_compliant < 3
                else "HIGH",
                "vendors": [
                    {
                        "id": v.id,
                        "name": v.name,
                        "tier": v.tier or 1,
                        "status": (v.compliance_status or "unknown").upper(),
                    }
                    for v in vendors
                ],
            }

    async def _resolve_run_compliance_check(
        self, selection: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Resolve run compliance check mutation."""
        check_type = selection.get("type", "AI_ACT")
        return {
            "id": str(uuid.uuid4()),
            "type": check_type,
            "status": "RUNNING",
            "startedAt": datetime.utcnow().isoformat() + "Z",
        }

    # ========== Deepfake Resolvers ==========

    async def _resolve_deepfake_analyses(
        self, selection: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Resolve deepfake analyses query from real database."""
        from sqlmodel import Session, select
        from app.core.models import DeepfakeAnalysis

        with Session(self.engine) as session:
            analyses = session.exec(
                select(DeepfakeAnalysis)
                .order_by(DeepfakeAnalysis.analysis_at.desc())
                .limit(20)
            ).all()
            return [
                {
                    "id": a.id,
                    "mediaType": a.media_type.upper() if a.media_type else "IMAGE",
                    "result": a.result.value
                    if hasattr(a.result, "value")
                    else str(a.result),
                    "confidence": a.confidence or 0,
                    "details": a.details or {},
                    "analyzedAt": a.analysis_at.isoformat() + "Z"
                    if a.analysis_at
                    else "",
                }
                for a in analyses
            ]

    async def _resolve_deepfake_stats(self) -> Dict[str, Any]:
        """Resolve deepfake statistics query from real database."""
        from sqlmodel import Session, select, func
        from app.core.models import DeepfakeAnalysis, AnalysisResult

        with Session(self.engine) as session:
            total = session.exec(select(func.count(DeepfakeAnalysis.id))).one() or 0
            real_count = (
                session.exec(
                    select(func.count(DeepfakeAnalysis.id)).where(
                        DeepfakeAnalysis.result == AnalysisResult.REAL
                    )
                ).one()
                or 0
            )
            fake_count = (
                session.exec(
                    select(func.count(DeepfakeAnalysis.id)).where(
                        DeepfakeAnalysis.result == AnalysisResult.FAKE
                    )
                ).one()
                or 0
            )
            uncertain = total - real_count - fake_count

            analyses = session.exec(select(DeepfakeAnalysis)).all()
            avg_conf = (
                round(sum(a.confidence for a in analyses) / len(analyses), 1)
                if analyses
                else 0.0
            )

            return {
                "totalAnalyses": total,
                "real": real_count,
                "fake": fake_count,
                "uncertain": max(uncertain, 0),
                "avgConfidence": avg_conf,
                "threatTypes": [],
            }

    async def _resolve_analyze_media(self, selection: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve analyze media mutation by calling deepfake service."""
        from app.services.deepfake_service import deepfake_service

        media_url = selection.get("mediaUrl", "")
        media_type = selection.get("mediaType", "IMAGE")

        try:
            result = deepfake_service.analyze_media(media_url, media_type)
            return {
                "id": result.id,
                "mediaUrl": result.media_url,
                "mediaType": result.media_type,
                "status": "COMPLETED",
                "result": result.result.value
                if hasattr(result.result, "value")
                else str(result.result),
                "confidence": result.confidence,
                "analyzedAt": result.analysis_at.isoformat() + "Z"
                if result.analysis_at
                else "",
            }
        except RuntimeError:
            raise RuntimeError("Deepfake analysis requires ML models (torch, cv2)")

    async def _resolve_create_challenge(
        self, selection: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Resolve create biometric challenge mutation."""
        user_id = selection.get("userId")

        return {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "type": "FIDO2_CHALLENGE",
            "status": "PENDING",
            "expiresAt": datetime.utcnow().isoformat() + "Z",
        }


class GraphQLGateway:
    """
    GraphQL API gateway that provides a unified GraphQL endpoint
    for all Alpha products with federated schema support.
    """

    def __init__(self):
        self.resolver = GraphQLResolver()

        # Define the unified schema
        self.schema = """
        type Query {
            # Agent Ops
            agents: [Agent!]!
            agent(id: ID!): Agent
            agentMetrics: AgentMetrics!
            budgetStatus: BudgetStatus!
            auditLogs(agentId: ID!): [AuditLog!]!
            
            # Compliance
            complianceChecks: [ComplianceCheck!]!
            complianceCheck(id: ID!): ComplianceCheck
            complianceCategories: [ComplianceCategory!]!
            supplyChain: SupplyChainStatus!
            vendorStatus(vendorId: ID!): VendorStatus!
            
            # Deepfake
            deepfakeAnalyses: [DeepfakeAnalysis!]!
            deepfakeAnalysis(id: ID!): DeepfakeAnalysis
            deepfakeStats: DeepfakeStats!
            biometricStatus(userId: ID!): BiometricStatus!
            sessionStatus(sessionId: ID!): SessionStatus!
        }
        
        type Mutation {
            # Agent Ops
            createAgent(input: CreateAgentInput!): Agent!
            updateAgent(id: ID!, input: UpdateAgentInput!): Agent!
            pauseAgent(id: ID!): AgentStatus!
            resumeAgent(id: ID!): AgentStatus!
            
            # Compliance
            runComplianceCheck(input: ComplianceCheckInput!): ComplianceCheck!
            
            # Deepfake
            analyzeMedia(input: AnalyzeMediaInput!): DeepfakeAnalysis!
            createBiometricChallenge(input: ChallengeInput!): BiometricChallenge!
            verifyBiometricResponse(input: VerifyResponseInput!): BiometricVerification!
        }
        
        # Agent Ops Types
        type Agent {
            id: ID!
            name: String!
            type: AgentType!
            status: AgentStatus!
            budget: Float!
            daily_spend: Float!
            metrics: AgentMetrics!
            createdAt: String!
        }
        
        type AgentMetrics {
            totalRequests: Int!
            loopsPrevented: Int!
            costSaved: Float!
        }
        
        enum AgentType {
            RESEARCH
            CODE_GENERATION
            ANALYSIS
            CONTENT_GENERATION
            AUTOMATION
        }
        
        enum AgentStatus {
            RUNNING
            STOPPED
            ERROR
            PAUSED
        }
        
        # Compliance Types
        type ComplianceCheck {
            id: ID!
            type: ComplianceCheckType!
            status: ComplianceStatus!
            score: Float!
            findings: [Finding!]!
            checkedAt: String!
        }
        
        type SupplyChainStatus {
            totalVendors: Int!
            compliant: Int!
            pending: Int!
            nonCompliant: Int!
            riskLevel: String!
            vendors: [Vendor!]!
        }
        
        # Deepfake Types
        type DeepfakeAnalysis {
            id: ID!
            mediaType: MediaType!
            result: AnalysisResult!
            confidence: Float!
            details: JSON
            analyzedAt: String!
        }
        
        type DeepfakeStats {
            totalAnalyses: Int!
            real: Int!
            fake: Int!
            uncertain: Int!
            avgConfidence: Float!
            threatTypes: [ThreatType!]!
        }
        
        input JSON
        """

    async def execute(
        self, query: str, variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a GraphQL query."""
        try:
            # Parse and execute the query
            # In production, would use a proper GraphQL parser
            parsed_query = self._parse_query(query)

            result = await self.resolver.resolve(parsed_query)

            return {"data": result}

        except Exception as e:
            logger.error(f"GraphQL execution error: {e}")
            return {"errors": [{"message": str(e)}]}

    def _parse_query(self, query: str) -> Dict[str, Any]:
        """Parse GraphQL query string into internal format."""
        # Simplified parser for demonstration
        # In production, would use graphql-core

        parsed = {"type": "query", "selection": {}}

        if "mutation" in query.lower():
            parsed["type"] = "mutation"

        # Extract field names (simplified)
        import re

        fields = re.findall(r"(\w+)\s*(?:\([^)]*\))?\s*\{", query)

        for field in fields:
            parsed["selection"][field] = {}

        return parsed


# Singleton instance
graphql_gateway = GraphQLGateway()
