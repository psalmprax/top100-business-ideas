"""
SSO Management Service
Provides real JWT-based stateless handshakes and token issuance acting as an operational Identity Provider for Enterprise SSO features.
"""

import uuid
import os
import time
import logging
from typing import Dict, Any, Optional
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request

logger = logging.getLogger(__name__)


class SSOService:
    """
    Enterprise OIDC Service for Google, Microsoft, Okta, Auth0, OneLogin, Ping, GitHub, GitLab, and Salesforce.
    Includes a simulation fallback and a Generic OIDC Connector.
    """

    def __init__(self):
        self.connected_providers: Dict[str, Dict[str, Any]] = {}
        self.sso_configs: Dict[str, Dict[str, Any]] = {}
        self.oauth = OAuth()

        # 1. Standard Identity Providers
        self._register_standard_providers()

    def _register_standard_providers(self):
        # Google
        self.oauth.register(
            name="google",
            client_id=os.getenv("OIDC_GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("OIDC_GOOGLE_CLIENT_SECRET"),
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )
 
        # Microsoft (Azure AD)
        self.oauth.register(
            name="microsoft",
            client_id=os.getenv("OIDC_AZURE_CLIENT_ID"),
            client_secret=os.getenv("OIDC_AZURE_CLIENT_SECRET"),
            server_metadata_url="https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )
 
        # Okta
        self.oauth.register(
            name="okta",
            client_id=os.getenv("OIDC_OKTA_CLIENT_ID"),
            client_secret=os.getenv("OIDC_OKTA_CLIENT_SECRET"),
            server_metadata_url=os.getenv("OIDC_OKTA_METADATA_URL"),
            client_kwargs={"scope": "openid email profile"},
        )
 
        # Auth0
        self.oauth.register(
            name="auth0",
            client_id=os.getenv("OIDC_AUTH0_CLIENT_ID"),
            client_secret=os.getenv("OIDC_AUTH0_CLIENT_SECRET"),
            server_metadata_url=os.getenv("OIDC_AUTH0_METADATA_URL"),
            client_kwargs={"scope": "openid email profile"},
        )
        
        # Apple
        self.oauth.register(
            name="apple",
            client_id=os.getenv("OIDC_APPLE_CLIENT_ID"),
            client_secret=os.getenv("OIDC_APPLE_CLIENT_SECRET"),
            server_metadata_url="https://appleid.apple.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email name"},
        )
 
        # 2. Additional Enterprise/Technical Providers
        providers = ["onelogin", "ping", "github", "gitlab", "salesforce"]
        for p in providers:
            self.oauth.register(
                name=p,
                client_id=os.getenv(f"OIDC_{p.upper()}_CLIENT_ID"),
                client_secret=os.getenv(f"OIDC_{p.upper()}_CLIENT_SECRET"),
                server_metadata_url=os.getenv(f"OIDC_{p.upper()}_METADATA_URL"),
                client_kwargs={"scope": "openid email profile"},
            )

    def _normalize_provider(self, provider: str) -> str:
        """Alias 'azure' to 'microsoft' and handle casing"""
        p = provider.lower()
        if p == "azure" or p == "entra":
            return "microsoft"
        return p

    def is_simulated(self, provider: str) -> bool:
        """Simulation is disabled in production hardening mode"""
        return False

    async def get_authorize_url(
        self, provider: str, redirect_uri: str, request: Request
    ) -> str:
        """Generate authorize URL"""
        p = self._normalize_provider(provider)

        # Handle Generic OIDC
        if p == "oidc" or p == "custom":
            conf = self.get_config("default")
            if not conf or not conf.get("metadata_url"):
                raise ValueError("Generic OIDC configuration missing")
            
            self.oauth.register(
                name="dynamic_oidc",
                client_id=conf.get("client_id"),
                client_secret=conf.get("client_secret"),
                server_metadata_url=conf.get("metadata_url"),
            )
            client = self.oauth.create_client("dynamic_oidc")
        else:
            client = self.oauth.create_client(p)

        if not client or not client.client_id:
            raise ValueError(f"Provider {p} credentials not configured")

        redirect_obj = await client.authorize_redirect(request, redirect_uri, scope="openid email profile")
        return redirect_obj.headers.get("location")

    async def handle_callback(self, provider: str, request: Request) -> Dict[str, Any]:
        """Handle OIDC callback"""
        p = self._normalize_provider(provider)
        
        client_name = "dynamic_oidc" if p in ["oidc", "custom"] else p
        client = self.oauth.create_client(client_name)
        if not client:
            raise ValueError(f"Provider {p} client not initialized")
            
        token = await client.authorize_access_token(request)
        user_data = token.get("userinfo", {})

        app_id = "default"
        conn = {
            "provider": p,
            "connected_at": int(time.time()),
            "status": "connected",
            "user_email": user_data.get("email"),
            "user_name": user_data.get("name"),
            "is_simulated": False,
            "metadata": {"token_type": token.get("token_type")},
        }

        if app_id not in self.connected_providers:
            self.connected_providers[app_id] = {}
        self.connected_providers[app_id][p] = conn
        return conn

    def get_connected_providers(self, app_id: str) -> Dict[str, Any]:
        return self.connected_providers.get(app_id, {})

    def save_config(self, app_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        self.sso_configs[app_id] = config
        return config

    def get_config(self, app_id: str) -> Optional[Dict[str, Any]]:
        return self.sso_configs.get(app_id)

    def generate_sso_token(
        self, app_id: str, user_id: str = "admin_user", roles: list = None
    ) -> str:
        import jwt

        key = os.getenv("SSO_SECRET_KEY", "")
        if not key:
            raise ValueError("SSO_SECRET_KEY environment variable must be set")
        if roles is None:
            roles = ["Sovereign", "EnterpriseAdmin"]
        payload = {
            "sub": user_id,
            "app_id": app_id,
            "roles": roles,
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600,
        }
        return jwt.encode(payload, key, algorithm="HS256")

    def verify_sso_token(self, token: str) -> Dict[str, Any]:
        import jwt

        key = os.getenv("SSO_SECRET_KEY", "")
        if not key:
            raise ValueError("SSO_SECRET_KEY environment variable must be set")
        try:
            payload = jwt.decode(token, key, algorithms=["HS256"])
            return {"valid": True, "payload": payload}
        except Exception as e:
            return {"valid": False, "error": str(e)}


sso_service = SSOService()
