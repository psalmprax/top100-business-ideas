"""
Base workforce service with core functionality
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class CouplingLevel(str, Enum):
    """Controls how tightly integrated workforce services are"""

    LOOSE = "loose"  # Each service operates independently
    MEDIUM = "medium"  # Services can trigger related services based on config
    TIGHT = "tight"  # Full workflow composition, auto-chaining


# Coupling configuration - defaults to LOOSE
_coupling_config = {
    "level": CouplingLevel.LOOSE,
    "workflows": {},  # Custom workflow definitions
    "triggers": {},  # Service-to-service triggers
}


def set_coupling_level(level: CouplingLevel):
    """Set the global coupling level"""
    _coupling_config["level"] = level
    logger.info(f"Workforce coupling level set to: {level.value}")


def get_coupling_level() -> CouplingLevel:
    """Get the current coupling level"""
    return _coupling_config["level"]


def register_workflow(name: str, steps: List[str]):
    """Register a workflow (for MEDIUM/LOOSE coupling)"""
    _coupling_config["workflows"][name] = steps


def register_trigger(source_service: str, condition: str, target_service: str):
    """Register a service trigger (for TIGHT coupling)"""
    if "triggers" not in _coupling_config:
        _coupling_config["triggers"] = {}
    if source_service not in _coupling_config["triggers"]:
        _coupling_config["triggers"][source_service] = []
    _coupling_config["triggers"][source_service].append(
        {"condition": condition, "target": target_service}
    )
    logger.info(
        f"Registered trigger: {source_service} -> {target_service} (if {condition})"
    )


def get_triggers_for_service(source_service: str) -> List[Dict[str, str]]:
    """Get triggers registered for a service"""
    return _coupling_config.get("triggers", {}).get(source_service, [])


# Import CrewAI components
CREWAI_AVAILABLE = False
CrewAgent = None
CrewTask = None
Crew = None
Process = None

try:
    from crewai import Agent as CrewAgent, Task as CrewTask, Crew, Process
    from langchain_community.tools import DuckDuckGoSearchRun
    from langchain_openai import ChatOpenAI

    CREWAI_AVAILABLE = True
    logger.info("CrewAI loaded successfully")
except ImportError as e:
    logger.warning(f"CrewAI not available: {e}. Using deterministic fallback.")
    DuckDuckGoSearchRun = None

# Lazy load LLM service to avoid import errors
llm_service = None


def get_llm_service():
    global llm_service
    if llm_service is None:
        try:
            from app.services.llm_service import llm_service as _llm

            llm_service = _llm
        except ImportError:
            pass
    return llm_service


from app.core.database import engine
from app.core.models import (
    WorkforceInteraction,
    WorkforceMessage,
    InteractionStatus,
    FiscalRequest,
    WorkforceGoal,
    WorkforceVenture,
    Agent,
    AgentAuditLog,
    WorkforceSkill,
    MarketResearch,
    WorkforceOutreach,
    OutreachStatus,
    SystemSetting,
)
from sqlmodel import Session, select, func
from app.services.intelligence_service import intelligence_service
from app.services.optimization_service import optimization_service
import asyncio


class BaseWorkforceService:
    """Base service with common functionality for all workforce modules"""

    def __init__(self):
        self.search_tool = DuckDuckGoSearchRun() if CREWAI_AVAILABLE else None
        self.scraper_tool = None  # Will be initialized when needed
        self.live_executions = {}

    def _init_scraper_tool(self):
        """Initialize scraper tool on demand"""
        if self.scraper_tool is None and CREWAI_AVAILABLE:
            try:
                from langchain_community.tools.playwright import (
                    ExtractTextTool,
                    NavigateTool,
                )
                # We provide a placeholder list if playwright is not fully configured,
                # but ensure it's a list of tool types/instances, not a module.
                # For CrewAI, instances are preferred.
                self.scraper_tool = [ExtractTextTool, NavigateTool]
            except ImportError:
                # Fallback to a simple tool if playwright is missing
                from langchain_core.tools import Tool
                from app.services.growth_tools import growth_tools
                
                def _scrape(url: str):
                    import asyncio
                    return asyncio.run(growth_tools.scrape_website(url))

                self.scraper_tool = Tool(
                    name="web_scraper",
                    func=_scrape,
                    description="Useful for scraping text content from a website URL."
                )
        return self.scraper_tool

    async def trigger_related_services(
        self,
        service_name: str,
        result: Dict[str, Any],
        workforce: Any,  # WorkforceService facade
    ) -> List[Dict[str, Any]]:
        """
        Trigger related services based on result and coupling level.

        Returns list of triggered service results.
        """
        coupling = get_coupling_level()
        if coupling == CouplingLevel.LOOSE:
            return []  # No automatic triggering in loose mode

        triggered_results = []
        triggers = get_triggers_for_service(service_name)

        for trigger in triggers:
            condition = trigger.get("condition", "")
            target = trigger.get("target", "")

            # Check if condition is met in result
            if self._evaluate_condition(condition, result):
                logger.info(f"Triggering {target} due to: {condition}")

                if target == "seo_auditor" and hasattr(workforce, "seo_auditor"):
                    # Example: After lead sourcing, run SEO audit on their website
                    url = result.get("leads", [{}])[0].get("website")
                    if url:
                        triggered_results.append(
                            await workforce.seo_auditor.run_seo_audit(url)
                        )
                elif target == "competitor" and hasattr(workforce, "competitor"):
                    triggered_results.append(
                        await workforce.competitor.analyze_competitor(
                            result.get("competitor", "Unknown"), None
                        )
                    )
                elif target == "reputation" and hasattr(workforce, "reputation"):
                    triggered_results.append(
                        await workforce.reputation.monitor_sentiment(
                            result.get("brand", "")
                        )
                    )
                # Add more triggers as needed

        return triggered_results

    def _evaluate_condition(self, condition: str, result: Dict[str, Any]) -> bool:
        """Evaluate if a trigger condition is met"""
        if not condition:
            return True

        # Simple condition evaluation
        # Format: "confidence > 0.7" or "status == completed"
        try:
            if ">" in condition:
                key, threshold = condition.split(">")
                return result.get(key.strip(), 0) > float(threshold)
            elif "<" in condition:
                key, threshold = condition.split("<")
                return result.get(key.strip(), 999) < float(threshold)
            elif "==" in condition:
                key, value = condition.split("==")
                return result.get(key.strip()) == value.strip().strip('"')
            elif "contains" in condition:
                key, value = condition.split("contains")
                return value.strip().strip('"') in result.get(key.strip(), "")
        except Exception as e:
            logger.warning(f"Condition evaluation failed: {e}")

        return False

    def _heuristic_lead_sourcing(self, criteria: str) -> List[Dict[str, Any]]:
        """Deterministic fallback for lead sourcing using pattern matching"""
        industry_patterns = {
            "saas": ["enterprise software", "cloud", "B2B", "subscription"],
            "fintech": ["payments", "banking", "financial", "blockchain"],
            "healthcare": ["medical", "health", "hospital", "clinical"],
            "retail": ["e-commerce", "shop", "retail", "consumer"],
            "manufacturing": ["factory", "industrial", "production", "supply chain"],
        }

        criteria_lower = criteria.lower()
        matched_industries = [
            ind
            for ind, patterns in industry_patterns.items()
            if any(p in criteria_lower for p in patterns)
        ]

        leads = []
        for industry in matched_industries or ["technology"]:
            leads.append(
                {
                    "name": f"{industry.title()} Corp",
                    "industry": industry,
                    "source": "deterministic",
                    "findings": f"Generated lead in {industry} sector using keyword analysis",
                    "status": "found",
                    "confidence": 0.75,
                    "method": "pattern_matching",
                }
            )

        if not leads:
            leads.append(
                {
                    "name": "Tech Solutions Inc",
                    "industry": "technology",
                    "source": "deterministic",
                    "findings": "Generated lead using generic technology sector patterns",
                    "status": "found",
                    "confidence": 0.65,
                    "method": "generic_pattern",
                }
            )

        return leads

    def _heuristic_customer_analysis(self, feedback_data: str) -> Dict[str, Any]:
        """Deterministic fallback for customer feedback analysis using NLP heuristics"""
        feedback_lower = feedback_data.lower()

        negative_words = [
            "bad",
            "slow",
            "broken",
            "expensive",
            "frustrat",
            "hate",
            "worst",
            "issue",
            "problem",
            "fail",
        ]
        positive_words = [
            "good",
            "great",
            "excellent",
            "fast",
            "love",
            "best",
            "perfect",
            "amazing",
            "happy",
        ]

        negative_count = sum(feedback_lower.count(word) for word in negative_words)
        positive_count = sum(feedback_lower.count(word) for word in positive_words)

        total = negative_count + positive_count
        sentiment = 0.5 if total == 0 else positive_count / total

        return {
            "sentiment": sentiment,
            "negative_matches": negative_count,
            "positive_matches": positive_count,
            "method": "heuristic_keyword_matching",
            "confidence": 0.6 if total < 5 else 0.8,
        }
