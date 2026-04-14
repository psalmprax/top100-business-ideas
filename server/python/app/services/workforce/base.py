"""
Base workforce service with core functionality
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

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
        self.live_executions = {}

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
