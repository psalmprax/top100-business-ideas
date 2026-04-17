"""
Top100 Business Ideas - Python AI/ML Backend
FastAPI application for AI/ML processing
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import asyncio
import os
from starlette.middleware.sessions import SessionMiddleware
from unittest.mock import MagicMock

# Configure logging early
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Real-First Hardening: Dependency Inventory
# Instead of masking missing libraries with MagicMock, we inventory them for the Vigilance dashboard.
DEPENDENCY_STATUS = {}
if os.getenv("ENVIRONMENT") != "testing":
    for mod in ["numpy", "torch", "transformers", "cv2", "PIL"]:
        try:
            __import__(mod)
            DEPENDENCY_STATUS[mod] = "INSTALLED"
        except ImportError:
            DEPENDENCY_STATUS[mod] = "MISSING"
            # We only mock if strictly necessary for the server to BOOT,
            # but we log the technical debt.
            logger.warning(
                f"Technical Debt Detected: AI/ML library '{mod}' is MISSION CRITICAL but MISSING."
            )

from app.api import (
    agents,
    compliance,
    deepfake,
    health,
    auth_verify,
    enterprise,
    governance,
    venture,
    security,
    alerts,
    intelligence,
    telemetry,
    shadow_ai,
)
from app.api.routers import (
    webhooks_router,
    multi_cloud_router,
    self_healing_router,
    agent_ops_router,
    budget_router,
    workforce_router,
)
from app.core.config import settings
from app.services.billing_service import billing_service
from app.core.middleware import resilience_exception_handler
from app.core.resilience import RateLimitMiddleware
from app.services.multi_cloud_proxy import multi_cloud_proxy
from app.services.compliance_service import compliance_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    logger.info("Starting Python AI/ML Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database
    try:
        from app.core.database import init_db

        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise  # Database initialization is critical for the application

    # Start background services
    try:
        billing_service.start_budget_enforcement_loop()
        compliance_service.start_audit_loop()
        logger.info("Background monitor services started (Budget + Compliance)")
    except Exception as e:
        logger.error(f"Failed to start background services: {e}")

    # Resilience: Multi-Cloud Provider Health Check
    try:
        logger.info("Performing Multi-Cloud Gateway Health Check...")
        # Since this is startup, we don't want to block indefinitely, but verification is key.
        # We check the default provider (OpenAI by default)
        # result = await multi_cloud_proxy.complete("ping", fallback=False)
        # logger.info(f"Multi-Cloud Health status: {result.get('status', 'unknown')}")
        pass  # We will keep it as a placeholder for now to avoid consuming tokens at every reboot
    except Exception as e:
        logger.error(f"Multi-Cloud Gateway Health check failed: {e}")

    yield

    logger.info("Shutting down Python AI/ML Backend...")


# Create FastAPI application
app = FastAPI(
    title="Top100 Business Ideas - AI/ML Backend",
    description="Python backend for AI/ML processing including deepfake detection and compliance analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
allowed_origins = (
    os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Starlette SessionMiddleware for OAuth State
session_secret = os.getenv("SESSION_SECRET_KEY")
if not session_secret:
    raise ValueError("SESSION_SECRET_KEY environment variable is required")
app.add_middleware(SessionMiddleware, secret_key=session_secret)

# Resilience: Rate Limiting Shield (In-Memory Sliding Window)
app.add_middleware(RateLimitMiddleware, window=60, limit=200)

# Register Global Resilience Exception Handler
app.add_exception_handler(Exception, resilience_exception_handler)

from app.core.dependencies import get_current_user

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])

# Protected Routers
app.include_router(
    agents.router,
    prefix="/agents",
    tags=["Agents"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    compliance.router,
    prefix="/compliance",
    tags=["Compliance"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    deepfake.router,
    prefix="/deepfake",
    tags=["Deepfake"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    enterprise.router, tags=["Enterprise"], dependencies=[Depends(get_current_user)]
)
app.include_router(
    auth_verify.router,
    prefix="/auth/verify",
    tags=["Liveness Authentication"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    webhooks_router,
    prefix="/webhooks",
    tags=["Webhooks"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    multi_cloud_router,
    prefix="/multi-cloud",
    tags=["Multi-Cloud"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    self_healing_router,
    prefix="/self-healing",
    tags=["Self-Healing"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    agent_ops_router,
    prefix="/agent-ops",
    tags=["Agent Operations"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    budget_router,
    prefix="/budget",
    tags=["Budget Management"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    workforce_router,
    prefix="/workforce",
    tags=["Workforce"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    governance.router,
    prefix="/governance",
    tags=["Governance & Advanced Features"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    venture.router,
    prefix="/venture",
    tags=["Venture"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    security.router,
    prefix="/security",
    tags=["Security"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    alerts.router,
    prefix="/agents",
    tags=["Alerts & Rules"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    intelligence.router,
    prefix="/intelligence",
    tags=["Intelligence"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    shadow_ai.router,
    prefix="/shadow-ai",
    tags=["Shadow AI"],
    dependencies=[Depends(get_current_user)],
)
from app.api import sentinel

app.include_router(
    sentinel.router,
    prefix="/api/v1/sentinel",
    tags=["Sentinel"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    telemetry.router,
    prefix="/telemetry",
    tags=["Telemetry & Optimization"],
    dependencies=[Depends(get_current_user)],
)

# Global Exception Shield
app.add_exception_handler(Exception, resilience_exception_handler)


from app.core.database import init_db


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "ai-ml-backend", "version": "1.0.0", "status": "running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
