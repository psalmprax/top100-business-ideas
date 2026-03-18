"""
Agent Ops Sentinel SDK
AI Agent Monitoring & Management Platform

@package agentops
@version 1.0.0
"""

import json
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Callable
from enum import Enum

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

try:
    import websocket
except ImportError:
    websocket = None


class LogLevel(str, Enum):
    DEBUG = "debug"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"


class AgentStatus(str, Enum):
    ACTIVE = "active"
    IDLE = "idle"
    ERROR = "error"
    PAUSED = "paused"


class TraceStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentOpsClient:
    """
    Main SDK client for interacting with Agent Ops Sentinel
    """
    
    def __init__(
        self,
        api_key: str,
        endpoint: str = "https://api.agentops.dev",
        environment: str = "production",
        max_retries: int = 3
    ):
        """
        Initialize the Agent Ops client.
        
        Args:
            api_key: Your API key for authentication
            endpoint: Base URL for the API (default: https://api.agentops.dev)
            environment: Environment (production, staging, development)
            max_retries: Maximum number of retries for failed requests
        """
        self.api_key = api_key
        self.endpoint = endpoint
        self.environment = environment
        self.agent_id: Optional[str] = None
        self._trace_id: Optional[str] = None
        
        # Setup session with retry logic
        self.session = requests.Session()
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })
    
    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """Make an API request with error handling."""
        url = f"{self.endpoint}{path}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[AgentOps] API Error: {e}")
            raise
    
    def register_agent(self, agent_name: str, agent_type: str) -> Dict[str, Any]:
        """
        Register an agent with Agent Ops.
        
        Args:
            agent_name: Name of the AI agent
            agent_type: Type/category of the agent
            
        Returns:
            Agent information dictionary
        """
        data = self._request("POST", "/agents", json={
            "name": agent_name,
            "type": agent_type,
        })
        self.agent_id = data.get("id")
        return data
    
    def heartbeat(self) -> None:
        """Send a heartbeat to indicate the agent is alive."""
        if not self.agent_id:
            raise ValueError("Agent not registered. Call register_agent() first.")
        
        self._request("POST", f"/agents/{self.agent_id}/heartbeat", json={
            "timestamp": datetime.utcnow().isoformat(),
        })
    
    def report_task_complete(
        self, 
        task_id: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Report a task completion."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        self._request("POST", f"/agents/{self.agent_id}/tasks", json={
            "taskId": task_id,
            "status": "completed",
            "metadata": metadata or {},
        })
    
    def report_task_failed(self, task_id: str, error: str) -> None:
        """Report a task failure."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        self._request("POST", f"/agents/{self.agent_id}/tasks", json={
            "taskId": task_id,
            "status": "failed",
            "error": error,
        })
    
    def log(
        self, 
        level: LogLevel, 
        message: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log an event."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        self._request("POST", f"/agents/{self.agent_id}/logs", json={
            "level": level.value,
            "message": message,
            "metadata": metadata or {},
        })
    
    def start_trace(self, name: str) -> str:
        """Start a trace for distributed tracing."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        data = self._request("POST", f"/agents/{self.agent_id}/traces", json={
            "name": name,
            "startTime": datetime.utcnow().isoformat(),
        })
        self._trace_id = data.get("id")
        return self._trace_id
    
    def end_trace(self, trace_id: str, status: TraceStatus) -> None:
        """End a trace."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        self._request("PATCH", f"/agents/{self.agent_id}/traces/{trace_id}", json={
            "endTime": datetime.utcnow().isoformat(),
            "status": status.value,
        })
    
    def add_span(
        self, 
        trace_id: str, 
        name: str, 
        attributes: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add a span to a trace."""
        if not self.agent_id:
            raise ValueError("Agent not registered")
        
        data = self._request(
            "POST", 
            f"/agents/{self.agent_id}/traces/{trace_id}/spans",
            json={"name": name, "attributes": attributes or {}}
        )
        return data.get("id")
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get all agents."""
        return self._request("GET", "/agents")
    
    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """Get a specific agent."""
        return self._request("GET", f"/agents/{agent_id}")
    
    def get_agent_metrics(self, agent_id: str) -> Dict[str, Any]:
        """Get metrics for a specific agent."""
        return self._request("GET", f"/agents/{agent_id}/metrics")
    
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get dashboard metrics."""
        return self._request("GET", "/dashboard/metrics")
    
    def get_alerts(self, agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get alerts, optionally filtered by agent ID."""
        params = {"agentId": agent_id} if agent_id else {}
        return self._request("GET", "/alerts", params=params)
    
    def acknowledge_alert(self, alert_id: str) -> None:
        """Acknowledge an alert."""
        self._request("PATCH", f"/alerts/{alert_id}", json={"acknowledged": True})
    
    def get_logs(
        self, 
        agent_id: str, 
        level: Optional[str] = None, 
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get logs for an agent."""
        params = {}
        if level:
            params["level"] = level
        if limit:
            params["limit"] = limit
        return self._request("GET", f"/agents/{agent_id}/logs", params=params)
    
    def get_traces(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get traces for an agent."""
        return self._request("GET", f"/agents/{agent_id}/traces")
    
    def configure_sso(self, config: Dict[str, Any]) -> None:
        """Configure SSO settings."""
        self._request("POST", "/sso/configure", json=config)
    
    def configure_scim(self, config: Dict[str, Any]) -> None:
        """Configure SCIM settings."""
        self._request("POST", "/scim/configure", json=config)
    
    def connect_websocket(self, on_message: Callable[[Any], None]) -> None:
        """Connect to WebSocket for real-time updates."""
        if not websocket:
            raise ImportError("websocket-client package required. Install with: pip install websocket-client")
        
        ws_url = f"wss://api.agentops.dev/ws?apiKey={self.api_key}"
        self.ws = websocket.WebSocketApp(
            ws_url,
            on_message=lambda ws, msg: on_message(json.loads(msg)),
        )
        self.ws.run_forever()
    
    def destroy(self) -> None:
        """Clean up resources."""
        if hasattr(self, 'ws'):
            self.ws.close()


def create_client(
    api_key: str,
    endpoint: str = "https://api.agentops.dev",
    environment: str = "production"
) -> AgentOpsClient:
    """Convenience function to create an Agent Ops client."""
    return AgentOpsClient(api_key, endpoint, environment)


# Decorator for automatic tracing
def trace(name: str = None):
    """Decorator for automatic trace management."""
    def decorator(func):
        def wrapper(self, *args, **kwargs):
            trace_name = name or func.__name__
            trace_id = self.start_trace(trace_name)
            try:
                result = func(self, *args, **kwargs)
                self.end_trace(trace_id, TraceStatus.COMPLETED)
                return result
            except Exception as e:
                self.end_trace(trace_id, TraceStatus.FAILED)
                raise
        return wrapper
    return decorator
