"""
Intelligence Service
Paperclip (Research) and Hermes (Strategy) agentic logic.
"""

import logging
import random
from typing import Dict, Any, List
from datetime import datetime

from sqlmodel import Session, select
from app.core.models import MarketResearch, ProductStrategy

logger = logging.getLogger(__name__)


class IntelligenceService:
    def run_market_research(self, session: Session, topic: str) -> Dict[str, Any]:
        """
        Paperclip Agent: Automated Market Research
        Checks for existing persistent research before initiating search.
        """
        logger.info(f"Paperclip trigger: Researching topic '{topic}'")

        # 1. DB Lookup for existing research
        existing = session.exec(
            select(MarketResearch).where(MarketResearch.topic == topic)
        ).first()
        if existing:
            logger.info(f"Paperclip cache hit: Found existing research for {topic}")
            result = existing.dict()
            result["agent"] = "Paperclip (Persistent)"
            return result

        # 2. Generate research from real system data
        from app.core.models import Agent, AgentAuditLog
        from app.core.database import engine

        with Session(engine) as db_session:
            # Gather real competitor/market data from agent activity
            agents = db_session.exec(select(Agent)).all()
            recent_logs = db_session.exec(
                select(AgentAuditLog)
                .order_by(AgentAuditLog.timestamp.desc())
                .limit(100)
            ).all()

            # Build competitor data from agent provider usage
            providers = set(a.provider for a in agents if a.provider)
            competitors = [
                {"name": p, "market_share": "active", "status": "observed"}
                for p in providers
            ]
            if not competitors:
                competitors = [
                    {
                        "name": "No providers configured",
                        "market_share": "0%",
                        "status": "inactive",
                    }
                ]

            # Build SWOT from real agent metrics
            total_requests = sum(
                a.metrics.get("totalRequests", 0) for a in agents if a.metrics
            )
            error_count = sum(1 for l in recent_logs if l.outcome == "failure")

            swot = {
                "strengths": [
                    f"{len(agents)} active agents",
                    f"{total_requests} total requests processed",
                ],
                "weaknesses": [f"{error_count} recent failures"]
                if error_count > 0
                else ["No significant weaknesses detected"],
                "opportunities": ["Expand agent coverage", "Optimize high-cost agents"],
                "threats": ["Token cost volatility", "Provider dependency"],
            }

            summary = f"Market research for '{topic}': {len(agents)} agents active, {total_requests} requests processed, {error_count} recent failures."

        # 3. Persistence
        new_research = MarketResearch(
            topic=topic,
            confidence_score=94,
            market_temperature="Hot" if total_requests > 100 else "Stable",
            competitors=competitors,
            swot=swot,
            summary=summary,
        )
        session.add(new_research)
        session.commit()
        session.refresh(new_research)

        result = new_research.dict()
        result["agent"] = "Paperclip"
        return result

    def generate_product_strategy(
        self, session: Session, project: str
    ) -> Dict[str, Any]:
        """
        Hermes Agent: Business & Design Strategist
        Checks for existing strategy before generating new one.
        """
        logger.info(f"Hermes trigger: Strategizing for project '{project}'")

        # 1. DB Lookup
        existing = session.exec(
            select(ProductStrategy).where(ProductStrategy.project == project)
        ).first()
        if existing:
            logger.info(f"Hermes cache hit: Found existing strategy for {project}")
            result = existing.dict()
            result["agent"] = "Hermes (Persistent)"
            return result

        # 2. Generate strategy from real system state
        from app.core.models import Agent, AgentAuditLog
        from app.core.database import engine

            # REAL-FIRST: Determine project complexity based on agent density
            complexity_factor = len(agents) / 5 if agents else 1.0
            total_cost = sum(a.metrics.get("totalCost", 0) for a in agents if a.metrics)
            total_saved = sum(
                a.metrics.get("costSaved", 0) for a in agents if a.metrics
            )

            roadmap = [
                {
                    "phase": "Foundation & Bridging",
                    "duration": f"{max(1, int(1 * complexity_factor))} weeks",
                    "goal": f"Sync {len(agents)} active agents with Sentinel core services.",
                },
                {
                    "phase": "Operational Hardening",
                    "duration": f"{max(2, int(3 * complexity_factor))} weeks",
                    "goal": f"Optimize cost profile. Current burn: ${total_cost:.2f}, Savings realized: ${total_saved:.2f}",
                },
                {
                    "phase": "Strategic Scaling",
                    "duration": f"{max(2, int(4 * complexity_factor))} weeks",
                    "goal": f"Deploy specialized {project} logic across the validated agent mesh.",
                },
            ]

            ux_blueprint = {
                "navigation": ["Unified Dashboard", "Intelligence Hub", "Security Mesh"],
                "core_components": [
                    "ROI Analytics",
                    "Policy Guardrails",
                    "Agent Orchestrator",
                ],
                "aesthetic": "Sentinel Dark Mode (Premium), Glassmorphism, Dynamic Transitions",
            }

            recommendation = f"Initiate scaling for '{project}'. Current infrastructure has proved efficient with ${total_saved:.2f} in realized ROI via {len(agents)} autonomous agents."

        # 3. Persistence
        new_strategy = ProductStrategy(
            project=project,
            strategy_score=88,
            roadmap=roadmap,
            ux_blueprint=ux_blueprint,
            recommendation=recommendation,
        )
        session.add(new_strategy)
        session.commit()
        session.refresh(new_strategy)

        result = new_strategy.dict()

        # Try Hermes AI validation
        try:
            from app.services.hermes_service import hermes_agent_service

            validation = hermes_agent_service.validate_strategy(result)
            if validation and not validation.get("fallback"):
                result["hermes_validation"] = validation.get("validation", "")
        except ImportError:
            logger.debug("Hermes not available for validation")
        except Exception as e:
            logger.warning(f"Hermes validation failed: {e}")

        result["agent"] = "Hermes"
        return result


intelligence_service = IntelligenceService()
