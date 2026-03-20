import asyncio
import httpx
from app.services.self_healing_manager import self_healing_manager

async def register_initial_nodes():
    print("Registering Initial Service Nodes for Sentinel...")
    
    # Register Python Backend
    self_healing_manager.register_node(
        node_id="python-backend-primary",
        url="http://localhost:8000/health",
        provider="local-cluster",
        metadata={"region": "us-east-1", "type": "api"}
    )
    
    # Register Go Gateway (assuming it has a health check)
    self_healing_manager.register_node(
        node_id="go-gateway-primary",
        url="http://localhost:8080/health",
        provider="local-cluster",
        metadata={"region": "us-east-1", "type": "gateway"}
    )
    
    # Mock some history for the dashboard
    self_healing_manager.recovery_history.append({
        "node_id": "go-gateway-primary",
        "timestamp": "2026-03-20T10:00:00Z",
        "failure_count": 3,
        "action": "failover",
        "target_node": "go-gateway-standby"
    })
    
    print("Done.")

if __name__ == "__main__":
    asyncio.run(register_initial_nodes())
