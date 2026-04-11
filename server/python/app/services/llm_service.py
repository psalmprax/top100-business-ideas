import logging
import time
from typing import Dict, Any, Optional, Tuple, List
from app.core.config import settings
from sqlmodel import Session
from app.core.models.agent_models import Agent as DB_Agent, LLMUsageLog
from app.services.multi_cloud_proxy import multi_cloud_proxy, CloudProvider

logger = logging.getLogger(__name__)

# LLM Pricing (approximate per 1k tokens)
PRICING = {
    "gpt-4o": {"input": 0.005 / 1000, "output": 0.015 / 1000},
    "gpt-4o-mini": {"input": 0.00015 / 1000, "output": 0.0006 / 1000},
    "claude-3-5-sonnet": {"input": 0.003 / 1000, "output": 0.015 / 1000},
    "bedrock": {"input": 0.003 / 1000, "output": 0.015 / 1000},
}

class LLMService:
    """
    Unified AI Service leveraging MultiCloudProxy for resilience and auditability.
    """
    
    async def call_gpt(
        self, 
        agent_id: str, 
        session: Session,
        messages: list, 
        model: str = "gpt-4o",
        temperature: float = 0.7,
        provider: str = "openai"
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Executes a resilient LLM call via unified proxy gateway.
        """
        try:
            cloud_provider = CloudProvider(provider)
        except ValueError:
            cloud_provider = CloudProvider.OPENAI

        start_time = time.time()
        
        try:
            # Call the multi-cloud proxy
            result = await multi_cloud_proxy.complete(
                input_data=messages,
                provider=cloud_provider,
                model=model,
                temperature=temperature
            )

            duration_ms = int((time.time() - start_time) * 1000)

            if "error" in result:
                logger.error(f"[LLMService] Proxy failure: {result['error']}")
                return f"Error: {result['error']}", {}

            content = result.get("content", "")
            usage = result.get("usage", {})
            actual_provider = result.get("provider", provider)
            actual_model = result.get("model", model)

            # Metrics / Cost tracking
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            total_tokens = prompt_tokens + completion_tokens
            
            pricing_key = actual_model if actual_model in PRICING else "gpt-4o"
            pricing = PRICING.get(pricing_key, PRICING["gpt-4o"])
            cost = (prompt_tokens * pricing["input"]) + (completion_tokens * pricing["output"])

            # Persistence
            self._record_usage(
                agent_id, session, actual_provider, actual_model, 
                prompt_tokens, completion_tokens, cost, duration_ms
            )
            self._update_agent_metrics(agent_id, session, total_tokens, cost, duration_ms)

            return content, {
                "provider": actual_provider,
                "usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "cost": cost
                },
                "latency_ms": duration_ms
            }

        except Exception as e:
            logger.error(f"[LLMService] Critical failure in LLM chain: {e}")
            return f"Error: Critical system failure during LLM orchestration: {str(e)}", {}

    def _record_usage(self, agent_id: str, session: Session, provider: str, model: str, prompt: int, completion: int, cost: float, latency: int):
        """Persistent log of LLM usage for ROI and Audit"""
        try:
            from uuid import UUID
            log = LLMUsageLog(
                agent_id=UUID(agent_id) if agent_id and agent_id != "None" else None,
                provider=provider,
                model=model,
                prompt_tokens=prompt,
                completion_tokens=completion,
                total_tokens=prompt + completion,
                cost=cost,
                latency_ms=latency,
                status="success"
            )
            session.add(log)
            session.commit()
        except Exception as e:
            # We don't want to crash the request if logging fails, but we must log the error
            logger.error(f"[LLMService] ROI Persistence Leak: {e}")

    def _update_agent_metrics(self, agent_id: str, session: Session, tokens: int, cost: float, latency: int):
        """Update the agent's summary stats"""
        if not agent_id or agent_id == "None": return
        try:
            from uuid import UUID
            agent = session.get(DB_Agent, UUID(agent_id))
            if agent:
                m = dict(agent.metrics) if agent.metrics else {}
                m["totalRequests"] = m.get("totalRequests", 0) + 1
                m["totalTokens"] = m.get("totalTokens", 0) + tokens
                m["totalCost"] = round(m.get("totalCost", 0.0) + cost, 6)
                m["avgLatencyMs"] = latency
                agent.metrics = m
                agent.daily_spend = round((agent.daily_spend or 0.0) + cost, 6)
                session.add(agent)
                session.commit()
        except Exception as e:
            logger.error(f"[LLMService] Agent Metrics Leak: {e}")

    def get_resilient_chat_model(self, temperature: float = 0.7):
        """
        LangChain-compatible model selection.
        """
        try:
            from langchain_openai import ChatOpenAI
            # Defaults to OpenAI if available, as per roadmap platform preference
            if settings.OPENAI_API_KEY:
                return ChatOpenAI(model="gpt-4o", temperature=temperature)
        except ImportError:
            logger.warning("[LLMService] LangChain missing - restricted to core proxy calls.")
        return None

llm_service = LLMService()
