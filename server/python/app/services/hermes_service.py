"""
Hermes Agent Integration Service
Wraps the NousResearch/hermes-agent library for advanced AI capabilities.
"""

import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class HermesAgentService:
    def __init__(self):
        self._agent = None
        self._initialized = False

    def _get_agent(self):
        """Lazy initialization of Hermes agent"""
        if not self._initialized:
            try:
                from run_agent import AIAgent

                model = os.getenv("HERMES_MODEL", "anthropic/claude-sonnet-4-20250514")
                api_key = (
                    os.getenv("OPENROUTER_API_KEY")
                    or os.getenv("ANTHROPIC_API_KEY")
                    or os.getenv("OPENAI_API_KEY")
                )

                # Map model to provider format
                if not api_key:
                    logger.warning("No API key found for Hermes agent")
                elif "gpt" in model.lower() or os.getenv("OPENAI_API_KEY"):
                    model = os.getenv("HERMES_MODEL", "openai/gpt-4o")

                self._agent = AIAgent(
                    model=model,
                    quiet_mode=True,
                    skip_memory=True,
                    skip_context_files=True,
                    max_iterations=30,
                    api_key=api_key,
                )
                self._initialized = True
                logger.info("Hermes agent initialized successfully")
            except ImportError as e:
                logger.warning(f"Hermes agent not available: {e}")
                self._initialized = True  # Prevent repeated attempts
            except Exception as e:
                logger.error(f"Failed to initialize Hermes agent: {e}")
                self._initialized = True

        return self._agent

    def chat(self, message: str, system_prompt: Optional[str] = None) -> str:
        """Send a chat message to Hermes agent"""
        agent = self._get_agent()
        if not agent:
            return "Hermes agent not available - falling back to internal intelligence"

        try:
            if system_prompt:
                result = agent.run_conversation(
                    user_message=message,
                    ephemeral_system_prompt=system_prompt,
                )
            else:
                result = agent.run_conversation(user_message=message)
            return result.get("final_response", "No response")
        except Exception as e:
            logger.error(f"Hermes chat error: {e}")
            return f"Error: {str(e)}"

    def analyze_performance(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Use Hermes to analyze agent performance metrics"""
        agent = self._get_agent()
        if not agent:
            return {
                "error": "Hermes not available",
                "fallback": "using internal analysis",
            }

        prompt = f"""Analyze these agent performance metrics and provide insights:
{metrics}

Provide:
1. Key observations
2. Anomalies detected
3. Recommendations for optimization"""

        try:
            response = agent.run_conversation(
                user_message=prompt,
                ephemeral_system_prompt="You are a senior AI operations analyst. Provide concise, actionable insights.",
            )
            return {
                "analysis": response.get("final_response", ""),
                "source": "hermes",
            }
        except Exception as e:
            logger.error(f"Hermes performance analysis error: {e}")
            return {"error": str(e), "fallback": "using internal analysis"}

    def suggest_fix(self, error: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Use Hermes to suggest a fix for an error"""
        agent = self._get_agent()
        if not agent:
            return {"suggestion": "Hermes not available", "fallback": True}

        prompt = f"""Error: {error}

Context:
{context}

Provide a suggested fix with code if applicable."""

        try:
            response = agent.run_conversation(
                user_message=prompt,
                ephemeral_system_prompt="You are an expert AI debugging assistant. Provide specific, actionable fixes.",
            )
            return {
                "suggestion": response.get("final_response", ""),
                "source": "hermes",
            }
        except Exception as e:
            logger.error(f"Hermes suggest fix error: {e}")
            return {"suggestion": f"Error: {str(e)}", "fallback": True}

    def validate_strategy(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Use Hermes to validate a product strategy"""
        agent = self._get_agent()
        if not agent:
            return {"valid": True, "source": "fallback"}

        prompt = f"""Validate this product strategy:
{strategy}

Assess:
1. Feasibility
2. Risks
3. Missing considerations"""

        try:
            response = agent.run_conversation(
                user_message=prompt,
                ephemeral_system_prompt="You are a strategic business advisor. Be thorough and critical.",
            )
            return {
                "validation": response.get("final_response", ""),
                "source": "hermes",
            }
        except Exception as e:
            logger.error(f"Hermes validate strategy error: {e}")
            return {"error": str(e), "fallback": True}


hermes_agent_service = HermesAgentService()
