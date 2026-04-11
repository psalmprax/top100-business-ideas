from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

recovery_history = []

@app.get("/health")
async def health():
    return {"status": "ok"}

# API Endpoints
@app.get("/api/v1/agent-ops/self-healing/status")
async def get_status():
    return {
        "mitigations_count": len(recovery_history),
        "recent_recoveries": recovery_history,
        "nodes": [],
        "config": {
            "id": "default",
            "auto_healing_enabled": True,
            "active": True
        }
    }

@app.post("/api/v1/agent-ops/self-healing/simulate")
async def simulate():
    event = {
        "node_id": "simulation-node",
        "timestamp": datetime.utcnow().isoformat(),
        "action": "HALUCINATION_MITIGATION",
        "details": {"reason": "Simulated drift detection", "latency_reduction": 140}
    }
    recovery_history.append(event)
    return {"status": "success", "event": event}

# Mock other endpoints
@app.get("/api/v1/agents")
async def list_agents(): return []
@app.get("/api/v1/agent-ops/rules/budget")
async def budget_rules(): return []
@app.get("/api/v1/agent-ops/webhooks")
async def webhooks(): return []
@app.get("/api/v1/agent-ops/cloud-health")
async def cloud_health(): return {}
@app.get("/api/v1/agent-ops/llm-configs")
async def llm_configs(): return []
@app.get("/api/v1/alerts")
async def alerts(): return []
@app.get("/api/v1/agent-ops/vigilance")
async def vigilance(): return []
@app.get("/api/v1/agent-ops/governance/analytics/roi")
async def roi(): return []
@app.get("/agent-ops/governance/healing/configs")
async def healing_configs(): return [{"id": "default", "auto_healing_enabled": True, "active": True}]
@app.get("/agent-ops/governance/forecast/usage")
async def forecast(): return []
@app.get("/api/v1/compliance/status")
async def compliance_status(): return {"hipaa": "ACTIVE", "sox": "DEGRADED", "gdpr": "ACTIVE"}
@app.get("/api/v1/agent-ops/architecture-defaults")
async def defaults(): return {"temperature": 0.7, "maxTokens": 4000}

# Serve Static Files
DIST_PATH = os.path.abspath("dist/public")
if os.path.exists(DIST_PATH):
    app.mount("/", StaticFiles(directory=DIST_PATH, html=True), name="static")

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    # Fallback to index.html for SPA routing
    return FileResponse(os.path.join(DIST_PATH, "index.html"))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
