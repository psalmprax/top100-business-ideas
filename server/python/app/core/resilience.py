import time
import asyncio
import logging
from functools import wraps
from typing import Callable, Dict, Any, Optional
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

class SlidingWindowLimiter:
    """
    In-memory Sliding Window Rate Limiter.
    Thread-safe and suitable for single-node deployments.
    """
    def __init__(self, window_seconds: int, max_requests: int):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self.requests: Dict[str, list] = {}
        self._lock = asyncio.Lock()

    async def is_allowed(self, identity: str) -> bool:
        async with self._lock:
            now = time.time()
            # Initialize if not present
            if identity not in self.requests:
                self.requests[identity] = []
            
            # Filter out old requests
            self.requests[identity] = [t for t in self.requests[identity] if now - t < self.window_seconds]
            
            if len(self.requests[identity]) < self.max_requests:
                self.requests[identity].append(now)
                return True
            return False

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, window: int = 60, limit: int = 100):
        super().__init__(app)
        self.limiter = SlidingWindowLimiter(window, limit)

    async def dispatch(self, request: Request, call_next):
        # Identity can be IP or API Key (if authenticated)
        identity = request.client.host
        
        # Skip certain paths if needed
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        if not await self.limiter.is_allowed(identity):
            logger.warning(f"Rate limit exceeded for {identity} on {request.url.path}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "too_many_requests",
                    "message": "AlphaHecta Resilience Shield: Rate limit exceeded. Please throttle your requests.",
                    "retry_after": "1 minute"
                }
            )
        
        return await call_next(request)

class CircuitBreaker:
    def __init__(self, name: str, threshold: int = 5, timeout: int = 30):
        self.name = name
        self.threshold = threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED, OPEN, HALF-OPEN

    def __call__(self, func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            now = time.time()
            
            if self.state == "OPEN":
                if now - self.last_failure_time > self.timeout:
                    self.state = "HALF-OPEN"
                    logger.info(f"Circuit Breaker '{self.name}' transition to HALF-OPEN")
                else:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Circuit Breaker '{self.name}' is OPEN. Service is currently isolated."
                    )

            try:
                result = await func(*args, **kwargs)
                
                if self.state == "HALF-OPEN":
                    self.state = "CLOSED"
                    self.failures = 0
                    logger.info(f"Circuit Breaker '{self.name}' transition to CLOSED")
                
                return result
            except Exception as e:
                self.failures += 1
                self.last_failure_time = now
                
                if self.failures >= self.threshold:
                    self.state = "OPEN"
                    logger.error(f"Circuit Breaker '{self.name}' transition to OPEN due to: {e}")
                
                raise e
        return wrapper

# Global breakers for shared services
ml_breaker = CircuitBreaker("ml-inference-engine", threshold=3, timeout=60)
db_breaker = CircuitBreaker("postgres-connection", threshold=5, timeout=15)
