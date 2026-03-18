"""
Multi-Cloud Proxy Service for Agent Ops
Routes LLM requests to OpenAI, Azure OpenAI, Anthropic, and AWS Bedrock via unified gateway.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import httpx
import os
import logging

logger = logging.getLogger(__name__)


class CloudProvider(str, Enum):
    OPENAI = "openai"
    AZURE = "azure"
    ANTHROPIC = "anthropic"
    BEDROCK = "bedrock"


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
                "base_url": os.getenv("AZURE_OPENAI_ENDPOINT", "https://<resource>.openai.azure.com/openai/deployments/<deployment>"),
                "auth_header": "api-key",
                "api_key": os.getenv("AZURE_OPENAI_KEY", ""),
                "api_version": os.getenv("AZURE_OPENAI_VERSION", "2024-02-01"),
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
        }
        self.fallback_order = [
            CloudProvider.OPENAI,
            CloudProvider.ANTHROPIC,
            CloudProvider.AZURE,
            CloudProvider.BEDROCK,
        ]
    
    async def complete(
        self,
        prompt: str,
        provider: CloudProvider = CloudProvider.OPENAI,
        model: str = "gpt-4",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        fallback: bool = True,
    ) -> Dict[str, Any]:
        """
        Route completion request to specified provider or failover.
        """
        if fallback:
            return await self._complete_with_failover(
                prompt, provider, model, max_tokens, temperature
            )
        else:
            return await self._complete_single(
                prompt, provider, model, max_tokens, temperature
            )
    
    async def _complete_single(
        self,
        prompt: str,
        provider: CloudProvider,
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> Dict[str, Any]:
        """Complete request to a single provider."""
        
        if provider == CloudProvider.OPENAI:
            return await self._call_openai(prompt, model, max_tokens, temperature)
        elif provider == CloudProvider.AZURE:
            return await self._call_azure(prompt, model, max_tokens, temperature)
        elif provider == CloudProvider.ANTHROPIC:
            return await self._call_anthropic(prompt, model, max_tokens, temperature)
        elif provider == CloudProvider.BEDROCK:
            return await self._call_bedrock(prompt, model, max_tokens, temperature)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    async def _complete_with_failover(
        self,
        prompt: str,
        preferred_provider: CloudProvider,
        model: str,
        max_tokens: int,
        temperature: float,
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
                    prompt, provider, model, max_tokens, temperature
                )
                result["provider_used"] = provider.value
                result["failover_count"] = providers.index(provider)
                return result
            except Exception as e:
                logger.warning(f"Provider {provider.value} failed: {e}")
                errors.append({"provider": provider.value, "error": str(e)})
                continue
        
        return {
            "error": "All providers failed",
            "errors": errors,
            "status": "failed",
        }
    
    async def _call_openai(
        self, prompt: str, model: str, max_tokens: int, temperature: float
    ) -> Dict[str, Any]:
        """Call OpenAI API."""
        config = self.providers[CloudProvider.OPENAI]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config['base_url']}/chat/completions",
                headers={
                    config["auth_header"]: f"Bearer {config['api_key']}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
                timeout=30.0,
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
        self, prompt: str, model: str, max_tokens: int, temperature: float
    ) -> Dict[str, Any]:
        """Call Azure OpenAI API."""
        config = self.providers[CloudProvider.AZURE]
        
        # Azure uses deployment name as model
        deployment = os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-4")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config['base_url'].replace('<deployment>', deployment)}?api-version={config['api_version']}",
                headers={
                    config["auth_header"]: config["api_key"],
                    "Content-Type": "application/json",
                },
                json={
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
                timeout=30.0,
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
        self, prompt: str, model: str, max_tokens: int, temperature: float
    ) -> Dict[str, Any]:
        """Call Anthropic API."""
        config = self.providers[CloudProvider.ANTHROPIC]
        
        # Map model names
        model_map = {
            "gpt-4": "claude-3-5-sonnet-20241022",
            "gpt-3.5": "claude-3-haiku-20240307",
        }
        anthropic_model = model_map.get(model, model)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config['base_url']}/messages",
                headers={
                    config["auth_header"]: config["api_key"],
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": anthropic_model,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=30.0,
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
        self, prompt: str, model: str, max_tokens: int, temperature: float
    ) -> Dict[str, Any]:
        """Call AWS Bedrock API."""
        config = self.providers[CloudProvider.BEDROCK]
        
        # Map model names to Bedrock IDs
        model_map = {
            "gpt-4": "anthropic.claude-3-sonnet-20240229-v1:0",
            "gpt-3.5": "anthropic.claude-3-haiku-20240307-v1:0",
            "llama": "meta.llama2-70b-chat-v1",
        }
        bedrock_model = model_map.get(model, model_map["gpt-4"])
        
        import json
        import base64
        import hashlib
        import hmac
        import time
        
        # Simplified Bedrock call (would need full AWS Signature in production)
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config['base_url']}/model/{bedrock_model}/invoke",
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "status": "success",
                "content": data.get("completion", data.get("outputs", [{}])[0].get("text", "")),
                "model": bedrock_model,
                "provider": "bedrock",
            }
    
    def get_provider_status(self) -> Dict[str, bool]:
        """Check availability of all providers."""
        return {
            "openai": bool(self.providers[CloudProvider.OPENAI]["api_key"]),
            "azure": bool(self.providers[CloudProvider.AZURE]["api_key"]),
            "anthropic": bool(self.providers[CloudProvider.ANTHROPIC]["api_key"]),
            "bedrock": bool(self.providers[CloudProvider.BEDROCK]["api_key"]),
        }
    
    def switch_provider(
        self, from_provider: CloudProvider, to_provider: CloudProvider
    ) -> bool:
        """Programmatically switch routing in case of provider outage."""
        # Reorder fallback list to put to_provider first
        self.fallback_order = [
            to_provider,
            from_provider,
            *[p for p in self.fallback_order if p not in [from_provider, to_provider]],
        ]
        logger.info(f"Switched fallback order: {self.fallback_order}")
        return True


# Singleton instance
multi_cloud_proxy = MultiCloudProxy()
