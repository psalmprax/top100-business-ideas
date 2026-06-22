"""
Multi-Cloud Proxy Service for Agent Ops
Routes LLM requests to OpenAI, Azure OpenAI, Anthropic, and AWS Bedrock via unified gateway.
Supports cost-aware routing, governance overrides, and Sentinel Guard integration.
"""

from typing import Dict, Any, Optional, List, Union
from enum import Enum
import httpx
import os
import logging
import asyncio
import time
from datetime import datetime, timedelta
from app.core.resilience import ml_breaker

logger = logging.getLogger(__name__)

# Cost per 1K tokens (input, output) by provider+model
MODEL_COSTS = {
    "openai": {
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    },
    "anthropic": {
        "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
        "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
        "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
    },
    "azure": {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4o": {"input": 0.005, "output": 0.015},
    },
    "bedrock": {
        "anthropic.claude-3-sonnet-20240229-v1:0": {"input": 0.003, "output": 0.015},
        "anthropic.claude-3-haiku-20240307-v1:0": {"input": 0.00025, "output": 0.00125},
    },
    "ollama": {
        "llama3": {"input": 0.0, "output": 0.0},
    },
}


class CloudProvider(str, Enum):
    OPENAI = "openai"
    AZURE = "azure"
    ANTHROPIC = "anthropic"
    BEDROCK = "bedrock"
    OLLAMA = "ollama"


class MultiCloudProxy:
    """
    Unified gateway for routing LLM requests across multiple cloud providers.
    Supports failover and centralized budget management.
    """

    def __init__(self):
        self.providers = {
            CloudProvider.OPENAI: {
                "base_url": "https://api.openai.com/v1",
                "auth_header": "Authorization",
                "api_key": os.getenv("OPENAI_API_KEY", ""),
            },
            CloudProvider.AZURE: {
                "base_url": os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/"),
                "auth_header": "api-key",
                "api_key": os.getenv("AZURE_OPENAI_KEY", ""),
                "api_version": os.getenv("AZURE_OPENAI_VERSION", "2024-02-01"),
                "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4"),
            },
            CloudProvider.ANTHROPIC: {
                "base_url": "https://api.anthropic.com/v1",
                "auth_header": "x-api-key",
                "api_key": os.getenv("ANTHROPIC_API_KEY", ""),
            },
            CloudProvider.BEDROCK: {
                "base_url": "https://bedrock-runtime.us-east-1.amazonaws.com",
                "auth_header": "Authorization",
                "api_key": os.getenv("AWS_ACCESS_KEY_ID", ""),
                "region": os.getenv("AWS_REGION", "us-east-1"),
            },
            CloudProvider.OLLAMA: {
                "base_url": os.getenv("OLLAMA_BASE_URL", "http://ollama:11434/v1"),
                "api_key": "ollama", # Placeholder for compatibility
            },
        }
        self.fallback_order = [
            CloudProvider.OLLAMA, # Local first for cost/sovereignty
            CloudProvider.OPENAI,
            CloudProvider.ANTHROPIC,
            CloudProvider.AZURE,
            CloudProvider.BEDROCK,
        ]
        self.retry_config = {
            "max_attempts": 3,
            "base_delay": 1.0,  # seconds
            "backoff_factor": 2.0,
        }
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
            )
        return self._client

    async def close(self):
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    @ml_breaker
    async def complete(
        self,
        input_data: Union[str, List[Dict[str, str]]],
        provider: CloudProvider = CloudProvider.OPENAI,
        model: str = "gpt-4",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        fallback: bool = True,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Route completion request to specified provider or failover.
        """
        messages = (
            input_data
            if isinstance(input_data, list)
            else [{"role": "user", "content": input_data}]
        )
        # Use first message content as prompt for legacy string-based provider calls if needed
        prompt = messages[-1]["content"] if messages else ""

        if fallback:
            return await self._complete_with_failover(
                messages, provider, model, max_tokens, temperature, api_key
            )
        else:
            return await self._complete_single(
                messages, provider, model, max_tokens, temperature, api_key
            )

    async def _complete_single(
        self,
        messages: List[Dict[str, str]],
        provider: CloudProvider,
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Complete request to a single provider with exponential backoff."""

        last_exception = None
        for attempt in range(self.retry_config["max_attempts"]):
            try:
                if provider == CloudProvider.OPENAI:
                    result = await self._call_openai(
                        messages, model, max_tokens, temperature, api_key
                    )
                elif provider == CloudProvider.AZURE:
                    result = await self._call_azure(
                        messages, model, max_tokens, temperature, api_key
                    )
                elif provider == CloudProvider.ANTHROPIC:
                    result = await self._call_anthropic(
                        messages, model, max_tokens, temperature, api_key
                    )
                elif provider == CloudProvider.BEDROCK:
                    result = await self._call_bedrock(
                        messages, model, max_tokens, temperature, api_key
                    )
                elif provider == CloudProvider.OLLAMA:
                    result = await self._call_ollama(
                        messages, model, max_tokens, temperature
                    )
                else:
                    raise ValueError(f"Unknown provider: {provider}")

                return result

            except Exception as e:
                last_exception = e
                # Protocol: 429 triggers immediate failover to keep the real-first engine moving
                if "429" in str(e) or "rate limit" in str(e).lower():
                    logger.warning(f"Rate limit hit on {provider}. Failover initiated.")
                    break

                if attempt < self.retry_config["max_attempts"] - 1:
                    delay = self.retry_config["base_delay"] * (
                        self.retry_config["backoff_factor"] ** attempt
                    )
                    logger.warning(
                        f"Retry {attempt + 1}/{self.retry_config['max_attempts']} for {provider} after {delay}s failure: {e}"
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"Final attempt failed for {provider}: {e}")

        raise last_exception or RuntimeError(
            f"Multi-Cloud Gateway failed to resolve {provider}"
        )

    async def _complete_with_failover(
        self,
        messages: List[Dict[str, str]],
        preferred_provider: CloudProvider,
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Try preferred provider, then failover to others on failure."""

        # Build provider order with preferred first
        providers = [preferred_provider] + [
            p for p in self.fallback_order if p != preferred_provider
        ]

        errors = []

        for provider in providers:
            try:
                result = await self._complete_single(
                    messages, provider, model, max_tokens, temperature, api_key
                )
                result["provider_used"] = provider.value
                result["failover_count"] = providers.index(provider)
                if providers.index(provider) > 0:
                    self.emit_sentinel_event("failover", {
                        "from_provider": preferred_provider.value,
                        "to_provider": provider.value,
                        "model": model,
                        "attempt": providers.index(provider),
                    })
                return result
            except Exception as e:
                logger.warning(f"Provider {provider.value} failed: {e}")
                errors.append({"provider": provider.value, "error": str(e)})
                self.emit_sentinel_event("provider_failure", {
                    "provider": provider.value,
                    "error": str(e),
                    "model": model,
                })
                continue

        return {
            "error": "All providers failed",
            "errors": errors,
            "status": "failed",
        }

    async def _call_openai(
        self,
        messages: List[Dict[str, str]],
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Call OpenAI API."""
        config = self.providers[CloudProvider.OPENAI]
        key = api_key or config["api_key"]

        response = await self.client.post(
            f"{config['base_url']}/chat/completions",
            headers={
                config["auth_header"]: f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
        data = response.json()

        return {
            "status": "success",
            "content": data["choices"][0]["message"]["content"],
            "model": data["model"],
            "usage": data.get("usage", {}),
            "provider": "openai",
        }

    async def _call_azure(
        self,
        messages: List[Dict[str, str]],
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Call Azure OpenAI API."""
        config = self.providers[CloudProvider.AZURE]
        key = api_key or config["api_key"]

        deployment = config["deployment"]
        url = f"{config['base_url']}/openai/deployments/{deployment}/chat/completions?api-version={config['api_version']}"

        response = await self.client.post(
            url,
            headers={
                config["auth_header"]: key,
                "Content-Type": "application/json",
            },
            json={
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
        data = response.json()

        return {
            "status": "success",
            "content": data["choices"][0]["message"]["content"],
            "model": deployment,
            "usage": data.get("usage", {}),
            "provider": "azure",
        }

    async def _call_anthropic(
        self,
        messages: List[Dict[str, str]],
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Call Anthropic API."""
        config = self.providers[CloudProvider.ANTHROPIC]
        key = api_key or config["api_key"]

        # Map model names
        model_map = {
            "gpt-4": "claude-3-5-sonnet-20241022",
            "gpt-3.5": "claude-3-haiku-20240307",
        }
        anthropic_model = model_map.get(model, model)

        response = await self.client.post(
            f"{config['base_url']}/messages",
            headers={
                config["auth_header"]: key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": anthropic_model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages,
            },
        )
        response.raise_for_status()
        data = response.json()

        return {
            "status": "success",
            "content": data["content"][0]["text"],
            "model": data["model"],
            "usage": {
                "prompt_tokens": data["usage"]["input_tokens"],
                "completion_tokens": data["usage"]["output_tokens"],
            },
            "provider": "anthropic",
        }

    async def _call_bedrock(
        self,
        messages: List[Dict[str, str]],
        model: str,
        max_tokens: int,
        temperature: float,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Call AWS Bedrock API with manual Signature V4 signing."""
        config = self.providers[CloudProvider.BEDROCK]
        key = api_key or config["api_key"]

        model_map = {
            "gpt-4": "anthropic.claude-3-sonnet-20240229-v1:0",
            "gpt-3.5": "anthropic.claude-3-haiku-20240307-v1:0",
            "llama": "meta.llama3-70b-instruct-v1:0",
        }
        bedrock_model = model_map.get(model, model_map["gpt-4"])

        import json
        import hashlib
        import hmac
        from datetime import datetime

        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages,
        }
        body = json.dumps(payload).encode("utf-8")

        # Manual SigV4 implementation helper
        def sign(key, msg):
            return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

        def get_signature_key(key, date_stamp, region_name, service_name):
            k_date = sign(("AWS4" + key).encode("utf-8"), date_stamp)
            k_region = sign(k_date, region_name)
            k_service = sign(k_region, service_name)
            k_signing = sign(k_service, "aws4_request")
            return k_signing

        access_key = config["api_key"]
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        region = config["region"]
        service = "bedrock"
        host = f"bedrock-runtime.{region}.amazonaws.com"
        endpoint = f"https://{host}/model/{bedrock_model}/invoke"

        now = datetime.utcnow()
        amz_date = now.strftime("%Y%m%dT%H%M%SZ")
        date_stamp = now.strftime("%Y%m%d")

        canonical_uri = f"/model/{bedrock_model}/invoke"
        canonical_querystring = ""
        canonical_headers = (
            f"content-type:application/json\nhost:{host}\nx-amz-date:{amz_date}\n"
        )
        signed_headers = "content-type;host;x-amz-date"
        payload_hash = hashlib.sha256(body).hexdigest()

        canonical_request = f"POST\n{canonical_uri}\n{canonical_querystring}\n{canonical_headers}\n{signed_headers}\n{payload_hash}"

        algorithm = "AWS4-HMAC-SHA256"
        credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
        string_to_sign = f"{algorithm}\n{amz_date}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"

        signing_key = get_signature_key(secret_key, date_stamp, region, service)
        signature = hmac.new(
            signing_key, string_to_sign.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        auth_header = f"{algorithm} Credential={access_key}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"

        response = await self.client.post(
            endpoint,
            headers={
                "Content-Type": "application/json",
                "X-Amz-Date": amz_date,
                "Authorization": auth_header,
            },
            content=body,
        )
        response.raise_for_status()
        data = response.json()

        return {
            "status": "success",
            "content": data.get("content", [{}])[0].get("text", ""),
            "model": bedrock_model,
            "usage": {
                "prompt_tokens": data.get("usage", {}).get("input_tokens", 0),
                "completion_tokens": data.get("usage", {}).get("output_tokens", 0),
            },
            "provider": "bedrock",
        }

    def get_provider_status(self) -> Dict[str, bool]:
        """Check availability of all providers."""
        return {
            "openai": bool(self.providers[CloudProvider.OPENAI]["api_key"]),
            "azure": bool(self.providers[CloudProvider.AZURE]["api_key"]),
            "anthropic": bool(self.providers[CloudProvider.ANTHROPIC]["api_key"]),
            "bedrock": bool(self.providers[CloudProvider.BEDROCK]["api_key"]),
            "ollama": True, # Always true if network is reachable
        }

    async def _call_ollama(
        self,
        messages: List[Dict[str, str]],
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> Dict[str, Any]:
        """Call local/remote Ollama API (OpenAI-compatible)."""
        config = self.providers[CloudProvider.OLLAMA]
        
        # Default to llama3 if no specific local model is requested
        ollama_model = model if model and not model.startswith("gpt") else "llama3"

        try:
            response = await self.client.post(
                f"{config['base_url']}/chat/completions",
                headers={"Content-Type": "application/json"},
                json={
                    "model": ollama_model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
                timeout=60.0 # Ollama can be slow on large models
            )
            response.raise_for_status()
            data = response.json()

            return {
                "status": "success",
                "content": data["choices"][0]["message"]["content"],
                "model": data["model"],
                "usage": data.get("usage", {"prompt_tokens": 0, "completion_tokens": 0}),
                "provider": "ollama",
            }
        except Exception as e:
            logger.error(f"Ollama call failed: {e}")
            # Try fallback to localhost if internal docker name fails
            if "ollama" in config["base_url"]:
                logger.info("Retrying Ollama on localhost...")
                config["base_url"] = "http://localhost:11434/v1"
                return await self._call_ollama(messages, model, max_tokens, temperature)
            raise e

    def switch_provider(
        self, from_provider: CloudProvider, to_provider: CloudProvider
    ) -> bool:
        """Programmatically switch routing in case of provider outage."""
        self.fallback_order = [
            to_provider,
            from_provider,
            *[p for p in self.fallback_order if p not in [from_provider, to_provider]],
        ]
        logger.info(f"Switched fallback order: {self.fallback_order}")
        return True

    def estimate_cost(
        self, provider: CloudProvider, model: str, prompt_tokens: int, completion_tokens: int
    ) -> float:
        """Estimate cost in USD for a given provider/model/token combo."""
        costs = MODEL_COSTS.get(provider.value, {}).get(model, {"input": 0.005, "output": 0.015})
        return (prompt_tokens * costs["input"] + completion_tokens * costs["output"]) / 1000

    def select_cheapest_provider(
        self, model: str, max_tokens: int, prefer: Optional[CloudProvider] = None
    ) -> CloudProvider:
        """Pick the cheapest available provider for a given model tier."""
        estimates = []
        for provider in self.fallback_order:
            if not self.providers[provider]["api_key"] and provider != CloudProvider.OLLAMA:
                continue
            cost = self.estimate_cost(provider, model, 500, max_tokens)
            estimates.append((provider, cost))
        if not estimates:
            return prefer or CloudProvider.OPENAI
        estimates.sort(key=lambda x: x[1])
        return estimates[0][0]

    async def complete_cost_aware(
        self,
        input_data: Union[str, List[Dict[str, str]]],
        model: str = "gpt-4o",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        budget_usd: Optional[float] = None,
        agent_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Route to cheapest provider while respecting budget constraints."""
        provider = self.select_cheapest_provider(model, max_tokens)
        estimated = self.estimate_cost(provider, model, 500, max_tokens)

        if budget_usd is not None and estimated > budget_usd:
            free_provider = CloudProvider.OLLAMA
            if self.providers[free_provider]["api_key"]:
                provider = free_provider
                estimated = 0.0
            else:
                return {
                    "error": f"Estimated cost ${estimated:.4f} exceeds budget ${budget_usd:.4f}",
                    "status": "budget_exceeded",
                }

        result = await self.complete(
            input_data=input_data,
            provider=provider,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            fallback=True,
        )
        result["estimated_cost_usd"] = round(estimated, 6)
        result["cost_routing"] = True
        if agent_id:
            result["agent_id"] = agent_id
        return result

    def check_daily_budget(self, agent_id: str, daily_limit_usd: float, current_spend_usd: float) -> Dict[str, Any]:
        """Governance: check if agent is within daily budget."""
        if current_spend_usd >= daily_limit_usd:
            return {
                "allowed": False,
                "reason": f"Daily budget ${daily_limit_usd:.2f} exhausted (spent: ${current_spend_usd:.2f})",
                "action": "BLOCK",
            }
        remaining = daily_limit_usd - current_spend_usd
        if remaining < daily_limit_usd * 0.1:
            return {
                "allowed": True,
                "reason": f"Warning: ${remaining:.2f} remaining of ${daily_limit_usd:.2f} daily budget",
                "action": "WARN",
            }
        return {"allowed": True, "action": "ALLOW"}

    def emit_sentinel_event(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Emit telemetry event for Sentinel Guard real-time monitoring."""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "source": "multi_cloud_proxy",
            **payload,
        }
        logger.info(f"[Sentinel] {event_type}: {payload}")
        return event


# Singleton instance
multi_cloud_proxy = MultiCloudProxy()
