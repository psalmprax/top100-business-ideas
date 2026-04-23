import os
from typing import List, Dict, Optional
import json
import yaml


class OnPremService:
    """
    Service for generating on-premise deployment manifests for AlphaHecta.
    Supports Helm charts and Docker Compose for air-gapped environments.
    """

    def generate_docker_compose(self, config: Dict) -> str:
        """Generates a Docker Compose manifest for on-premise deployment."""
        compose = {
            "version": "3.8",
            "services": {
                "agent-ops-proxy": {
                    "image": "antigravity/agent-ops-proxy:latest",
                    "ports": ["8080:8080"],
                    "environment": {
                        "DB_URL": config.get("db_url", "sqlite:///./agent_ops.db"),
                        "ENCRYPTION_KEY": config.get(
                            "encryption_key", os.getenv("ON_PREM_ENCRYPTION_KEY", "")
                        ),
                        "LOG_LEVEL": "info",
                    },
                    "restart": "always",
                },
                "agent-ops-worker": {
                    "image": "antigravity/agent-ops-worker:latest",
                    "depends_on": ["agent-ops-proxy"],
                    "environment": {"PROXY_URL": "http://agent-ops-proxy:8080"},
                },
            },
        }
        return yaml.dump(compose, default_flow_style=False)

    def generate_helm_values(self, cluster_name: str) -> str:
        """Generates Helm values for enterprise K8s deployment."""
        values = {
            "replicaCount": 3,
            "image": {
                "repository": "antigravity/agent-ops-enterprise",
                "tag": "v1.0.0",
            },
            "service": {"type": "LoadBalancer", "port": 443},
            "ingress": {
                "enabled": True,
                "hosts": [{"host": f"{cluster_name}.internal", "paths": ["/"]}],
            },
            "resources": {
                "limits": {"cpu": "2000m", "memory": "4Gi"},
                "requests": {"cpu": "500m", "memory": "1Gi"},
            },
        }
        return yaml.dump(values, default_flow_style=False)

    def get_air_gap_check_list(self) -> List[str]:
        """Returns a checklist for air-gapped environment readiness."""
        return [
            "Local Docker Registry Available",
            "Internal DNS records configured",
            "Persistent Storage Classes defined (PV/PVC)",
            "TLS Certificates for internal domains",
            "Node-to-node connectivity for worker clusters",
        ]


on_prem_service = OnPremService()
