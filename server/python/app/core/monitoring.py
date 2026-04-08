"""
Centralized Monitoring & Health Checks - Enterprise-grade observability
"""

import time
import psutil
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class HealthStatus:
    """Health check result"""

    service: str
    status: str  # healthy, degraded, unhealthy
    response_time: float
    last_check: datetime
    details: Dict[str, Any]


@dataclass
class SystemMetrics:
    """System performance metrics"""

    cpu_percent: float
    memory_percent: float
    disk_usage: float
    network_io: Dict[str, int]
    timestamp: datetime


class HealthCheckManager:
    """Centralized health check orchestration"""

    def __init__(self):
        self.services: Dict[str, HealthStatus] = {}
        self.system_metrics: List[SystemMetrics] = []
        self.alert_thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_usage": 90.0,
            "response_time_ms": 5000,
        }

    async def run_health_checks(self) -> Dict[str, Any]:
        """Run comprehensive health checks"""
        results = {}

        # System health
        results["system"] = await self._check_system_health()

        # Database health
        results["database"] = await self._check_database_health()

        # External services
        results["external_services"] = await self._check_external_services()

        # AI/ML services
        results["ml_services"] = await self._check_ml_services()

        # Overall status
        results["overall"] = self._calculate_overall_status(results)

        return results

    async def _check_system_health(self) -> Dict[str, Any]:
        """Check system resource health"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            # Collect network I/O
            net_io = psutil.net_io_counters()
            network_stats = {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv,
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv,
            }

            metrics = SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_usage=disk.percent,
                network_io=network_stats,
                timestamp=datetime.utcnow(),
            )

            self.system_metrics.append(metrics)
            # Keep only last 100 metrics
            if len(self.system_metrics) > 100:
                self.system_metrics = self.system_metrics[-100:]

            status = "healthy"
            issues = []

            if cpu_percent > self.alert_thresholds["cpu_percent"]:
                status = "degraded"
                issues.append(f"High CPU usage: {cpu_percent:.1f}%")

            if memory.percent > self.alert_thresholds["memory_percent"]:
                status = "degraded"
                issues.append(f"High memory usage: {memory.percent:.1f}%")

            if disk.percent > self.alert_thresholds["disk_usage"]:
                status = "unhealthy"
                issues.append(f"Low disk space: {disk.percent:.1f}% used")

            return {
                "status": status,
                "issues": issues,
                "metrics": {
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": disk.percent,
                    "network_bytes_sent": network_stats["bytes_sent"],
                    "network_bytes_recv": network_stats["bytes_recv"],
                },
            }

        except Exception as e:
            logger.error(f"System health check failed: {e}")
            return {
                "status": "unhealthy",
                "issues": [f"Health check error: {str(e)}"],
                "metrics": {},
            }

    async def _check_database_health(self) -> Dict[str, Any]:
        """Check database connectivity and performance"""
        try:
            start_time = time.time()

            # Simple database query to test connectivity
            from app.core.database import get_session
            from sqlmodel import text

            with get_session() as session:
                result = session.exec(text("SELECT 1 as health_check")).first()
                response_time = (time.time() - start_time) * 1000

            status = (
                "healthy"
                if response_time < self.alert_thresholds["response_time_ms"]
                else "degraded"
            )

            return {
                "status": status,
                "response_time_ms": response_time,
                "issues": []
                if status == "healthy"
                else [f"Slow response: {response_time:.0f}ms"],
            }

        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "issues": [f"Database connection failed: {str(e)}"],
            }

    async def _check_external_services(self) -> Dict[str, Any]:
        """Check external service dependencies"""
        services_to_check = {
            "openai": "https://api.openai.com/v1/models",
            "anthropic": "https://api.anthropic.com/v1/messages",
            "stripe": "https://api.stripe.com/v1/charges",
        }

        results = {}

        for service_name, url in services_to_check.items():
            try:
                import httpx

                async with httpx.AsyncClient(timeout=5.0) as client:
                    start_time = time.time()
                    response = await client.get(
                        url,
                        headers={"Authorization": "Bearer dummy"}
                        if "api." in url
                        else {},
                    )
                    response_time = (time.time() - start_time) * 1000

                    results[service_name] = {
                        "status": "healthy"
                        if response.status_code < 500
                        else "degraded",
                        "response_time_ms": response_time,
                        "http_status": response.status_code,
                    }

            except Exception as e:
                results[service_name] = {"status": "unhealthy", "error": str(e)}

        return results

    async def _check_ml_services(self) -> Dict[str, Any]:
        """Check ML service availability"""
        results = {}

        # Check if ML models are loaded and responsive
        try:
            # Try to load a small test model or check service status
            results["transformers_available"] = self._check_module_available(
                "transformers"
            )
            results["torch_available"] = self._check_module_available("torch")
            results["crewai_available"] = self._check_module_available("crewai")

        except Exception as e:
            results["error"] = str(e)

        return results

    def _check_module_available(self, module_name: str) -> bool:
        """Check if a Python module is available"""
        try:
            import importlib

            importlib.import_module(module_name)
            return True
        except ImportError:
            return False

    def _calculate_overall_status(self, results: Dict[str, Any]) -> str:
        """Calculate overall system health"""
        statuses = []

        for category, result in results.items():
            if isinstance(result, dict) and "status" in result:
                statuses.append(result["status"])

        if "unhealthy" in statuses:
            return "unhealthy"
        elif "degraded" in statuses:
            return "degraded"
        else:
            return "healthy"

    async def get_metrics_history(self, hours: int = 24) -> List[SystemMetrics]:
        """Get historical system metrics"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return [m for m in self.system_metrics if m.timestamp > cutoff]


# Global health check manager instance
health_check_manager = HealthCheckManager()


# FastAPI health check endpoint
def create_health_router():
    """Create FastAPI router for health endpoints"""
    from fastapi import APIRouter, HTTPException
    from fastapi.responses import JSONResponse

    router = APIRouter()

    @router.get("/health")
    async def health_check():
        """Basic health check endpoint"""
        try:
            results = await health_check_manager.run_health_checks()
            status_code = 200 if results["overall"] == "healthy" else 503
            return JSONResponse(content=results, status_code=status_code)
        except Exception as e:
            return JSONResponse(
                content={"status": "unhealthy", "error": str(e)}, status_code=503
            )

    @router.get("/health/detailed")
    async def detailed_health():
        """Detailed health check with metrics"""
        try:
            results = await health_check_manager.run_health_checks()
            metrics = await health_check_manager.get_metrics_history(hours=1)

            return {
                "health": results,
                "metrics": [m.__dict__ for m in metrics[-10:]],  # Last 10 metrics
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            raise HTTPException(
                status_code=503, detail=f"Health check failed: {str(e)}"
            )

    @router.get("/metrics")
    async def system_metrics():
        """Raw system metrics endpoint"""
        try:
            metrics = await health_check_manager.get_metrics_history(hours=24)
            return {"metrics": [m.__dict__ for m in metrics], "count": len(metrics)}
        except Exception as e:
            raise HTTPException(
                status_code=503, detail=f"Metrics retrieval failed: {str(e)}"
            )

    return router
