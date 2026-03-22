"""
SSO Management Service
Provides real JWT-based stateless handshakes and token issuance acting as an operational Identity Provider for Enterprise SSO features.
"""

import uuid
import time
import logging
from typing import Dict, Any, Optional
import jwt # Note: Requires PyJWT

logger = logging.getLogger(__name__)

# Fixed internal secret for the operational SSO stub
SSO_SECRET_KEY = "alpha-sentinel-sso-secret-base64"
ALGORITHM = "HS256"

class SSOService:
    def __init__(self):
        # In-memory store for connected SSO app configurations
        self.sso_configs: Dict[str, Dict[str, Any]] = {}
        # Track connected third-party providers
        self.connected_providers: Dict[str, Dict[str, Any]] = {}

    def connect_provider(self, app_id: str, provider: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Simulate connecting an external IDP provider (Azure, Google, Okta)"""
        if app_id not in self.connected_providers:
            self.connected_providers[app_id] = {}
        
        connection_info = {
            "provider": provider,
            "connected_at": int(time.time()),
            "status": "connected",
            "metadata": metadata or {}
        }
        self.connected_providers[app_id][provider] = connection_info
        logger.info(f"Connected {provider} SSO for {app_id}")
        return connection_info

    def get_connected_providers(self, app_id: str) -> Dict[str, Any]:
        """Return all connected providers for an app"""
        return self.connected_providers.get(app_id, {})


    def save_config(self, app_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Save structural SSO configuration like SAML/OIDC URLs"""
        self.sso_configs[app_id] = config
        logger.info(f"Saved SSO configuration for {app_id}")
        return config

    def get_config(self, app_id: str) -> Optional[Dict[str, Any]]:
        return self.sso_configs.get(app_id)

    def generate_sso_token(self, app_id: str, user_id: str = "admin_user", roles: list = None) -> str:
        """Issue a real cryptographic JWT acting as the Identity Provider."""
        if roles is None:
            roles = ["Sovereign", "EnterpriseAdmin"]
            
        payload = {
            "sub": user_id,
            "app_id": app_id,
            "roles": roles,
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600 # 1 hour expiration
        }
        token = jwt.encode(payload, SSO_SECRET_KEY, algorithm=ALGORITHM)
        return token

    def verify_sso_token(self, token: str) -> Dict[str, Any]:
        """Verify the signature and expiration of an SSO token."""
        try:
            payload = jwt.decode(token, SSO_SECRET_KEY, algorithms=[ALGORITHM])
            return {"valid": True, "payload": payload}
        except jwt.ExpiredSignatureError:
            return {"valid": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"valid": False, "error": "Invalid token signature"}

# Singleton
sso_service = SSOService()
