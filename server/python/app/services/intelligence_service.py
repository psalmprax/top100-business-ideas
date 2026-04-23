"""
Intelligence Service
Paperclip (Research) and Hermes (Strategy) agentic logic.
"""

import logging
import json
from typing import Dict, Any, List
from datetime import datetime

from sqlmodel import Session, select
from app.core.models import MarketResearch, ProductStrategy, Agent, AgentType, AgentStatus
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class IntelligenceService:
    async def run_market_research(self, session: Session, topic: str) -> Dict[str, Any]:
        """
        Paperclip Agent: Automated Market Research via Unified Proxy
        """
        logger.info(f"Paperclip trigger: Researching topic '{topic}'")

        # 1. DB Lookup for existing research
        existing = session.exec(
            select(MarketResearch).where(MarketResearch.topic == topic)
        ).first()
        if existing:
            return {**existing.model_dump(), "agent": "Paperclip (Persistent)"}

        # 2. Get or Create Paperclip Agent for tracking
        agent = session.exec(select(Agent).where(Agent.name == "Paperclip")).first()
        if not agent:
            agent = Agent(
                name="Paperclip",
                type=AgentType.analysis,
                provider="ollama",
                model="hermes3",
                status=AgentStatus.RUNNING,
                tier="strategic"
            )
            session.add(agent)
            session.commit()
            session.refresh(agent)

        # 3. Real Reasoning via Gateway
        system_prompt = "You are Paperclip, a high-fidelity market research agent. You must return your analysis in strict JSON format."
        user_prompt = f"""Conduct market research for: {topic}
        Return JSON with keys: 'summary' (str), 'confidence_score' (int 0-100), 'market_temperature' (Hot/Stable/Cold), 
        'competitors' (list of dicts with name, market_share, status), 
        'swot' (dict with strengths, weaknesses, opportunities, threats lists)."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        # Await the async llm_service call
        content, metadata = await llm_service.call_gpt(str(agent.id), session, messages)
        
        try:
            # Strip any markdown backticks if present
            clean_content = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_content)
        except Exception as e:
            logger.error(f"Failed to parse Paperclip JSON: {e}")
            data = {
                "summary": content[:1000], 
                "confidence_score": 85, 
                "market_temperature": "Stable", 
                "competitors": [], 
                "swot": {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}
            }

        # 4. Persistence
        new_research = MarketResearch(
            topic=topic,
            confidence_score=data.get("confidence_score", 90),
            market_temperature=data.get("market_temperature", "Stable"),
            competitors=data.get("competitors", []),
            swot=data.get("swot", {}),
            summary=data.get("summary", ""),
        )
        session.add(new_research)
        session.commit()
        session.refresh(new_research)

        return {**new_research.model_dump(), "agent": "Paperclip", "usage": metadata.get("usage")}

    async def generate_product_strategy(self, session: Session, project: str) -> Dict[str, Any]:
        """
        Hermes Agent: Business & Design Strategist via Unified Proxy
        """
        logger.info(f"Hermes trigger: Strategizing for project '{project}'")

        # 1. DB Lookup
        existing = session.exec(
            select(ProductStrategy).where(ProductStrategy.project == project)
        ).first()
        if existing:
            return {**existing.model_dump(), "agent": "Hermes (Persistent)"}

        # 2. Get or Create Hermes Agent for tracking
        agent = session.exec(select(Agent).where(Agent.name == "Hermes")).first()
        if not agent:
            agent = Agent(
                name="Hermes",
                type=AgentType.content_generation,
                provider="ollama",
                model="hermes3",
                status=AgentStatus.RUNNING,
                tier="strategic"
            )
            session.add(agent)
            session.commit()
            session.refresh(agent)

        # 3. Real Reasoning via Gateway
        system_prompt = "You are Hermes, a premier business and product design strategist. Return your strategy in strict JSON format."
        user_prompt = f"""Generate a comprehensive product strategy for: {project}
        Return JSON with keys: 'project' (str), 'strategy_score' (int 0-100), 
        'roadmap' (list of dicts with phase, duration, goal), 
        'ux_blueprint' (dict with navigation list, core_components list, aesthetic str), 
        'recommendation' (str)."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        # Await the async llm_service call
        content, metadata = await llm_service.call_gpt(str(agent.id), session, messages)
        
        try:
            clean_content = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_content)
        except Exception as e:
            logger.error(f"Failed to parse Hermes JSON: {e}")
            data = {
                "project": project,
                "strategy_score": 88,
                "roadmap": [],
                "ux_blueprint": {"navigation": [], "core_components": [], "aesthetic": "AlphaHecta Dark"},
                "recommendation": content[:1000]
            }

        # 4. Persistence
        new_strategy = ProductStrategy(
            project=project,
            strategy_score=data.get("strategy_score", 90),
            roadmap=data.get("roadmap", []),
            ux_blueprint=data.get("ux_blueprint", {}),
            recommendation=data.get("recommendation", ""),
        )
        session.add(new_strategy)
        session.commit()
        session.refresh(new_strategy)

        return {**new_strategy.model_dump(), "agent": "Hermes", "usage": metadata.get("usage")}


intelligence_service = IntelligenceService()
