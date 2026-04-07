"""
SSO Management Service
Provides real JWT-based stateless handshakes and token issuance acting as an operational Identity Provider for Enterprise SSO features.
"""

import uuid
import os
import time
import logging
import secrets
import hashlib
import base64
from typing import Dict, Any, Optional, Tuple
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

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
        self.client_cache: Dict[str, Any] = {}  # Cache for registered clients
        self.refresh_tokens: Dict[str, Dict[str, Any]] = {}  # Store refresh tokens
        self.csrf_states: Dict[str, str] = {}  # Store CSRF states

        # Generate RSA keys for RS256 JWT signing
        self.private_key, self.public_key = self._generate_rsa_keys()

        # 1. Standard Identity Providers
        self._register_standard_providers()

    def _generate_rsa_keys(self) -> Tuple[str, str]:
        """Generate RSA key pair for RS256 JWT signing"""
        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048, backend=default_backend()
        )

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("utf-8")

        public_pem = (
            private_key.public_key()
            .public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
            .decode("utf-8")
        )

        return private_pem, public_pem

    def _generate_pkce_pair(self) -> Tuple[str, str]:
        """Generate PKCE code_verifier and code_challenge"""
        code_verifier = secrets.token_urlsafe(32)
        code_challenge = (
            base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode()).digest())
            .decode()
            .rstrip("=")
        )
        return code_verifier, code_challenge

    def _generate_state(self) -> str:
        """Generate CSRF state parameter"""
        state = secrets.token_urlsafe(32)
        state_id = str(uuid.uuid4())
        self.csrf_states[state_id] = state
        return state_id

    def _validate_state(self, state_id: str, state: str) -> bool:
        """Validate CSRF state parameter"""
        stored_state = self.csrf_states.pop(state_id, None)
        return stored_state == state

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
    ) -> Tuple[str, str, str]:
        """Generate authorize URL with PKCE and state validation"""
        p = self._normalize_provider(provider)

        # Check cache first, register if not cached
        if p not in self.client_cache:
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
                self.client_cache[p] = "dynamic_oidc"
            else:
                # Standard providers are already registered
                self.client_cache[p] = p

        client_name = self.client_cache[p]
        client = self.oauth.create_client(client_name)

        if not client or not client.client_id:
            raise ValueError(f"Provider {p} credentials not configured")

        # Generate PKCE pair
        code_verifier, code_challenge = self._generate_pkce_pair()

        # Generate CSRF state
        state_id = self._generate_state()

        # Store PKCE verifier for callback validation
        if p not in self.connected_providers:
            self.connected_providers[p] = {}
        self.connected_providers[p]["_pkce_verifier"] = code_verifier
        self.connected_providers[p]["_state_id"] = state_id

        # Add PKCE and state to authorization request
        redirect_obj = await client.authorize_redirect(
            request,
            redirect_uri,
            scope="openid email profile",
            code_challenge=code_challenge,
            code_challenge_method="S256",
            state=state_id,
        )

        return redirect_obj.headers.get("location"), code_verifier, state_id

    async def handle_callback(self, provider: str, request: Request) -> Dict[str, Any]:
        """Handle OIDC callback with PKCE and state validation"""
        p = self._normalize_provider(provider)

        # Validate state parameter
        state_id = request.query_params.get("state")
        if not state_id:
            raise ValueError("Missing state parameter")

        # Get stored state and validate
        stored_state = self.csrf_states.get(state_id)
        if not stored_state:
            raise ValueError("Invalid or expired state parameter")

        # Clean up used state
        del self.csrf_states[state_id]

        client_name = self.client_cache.get(p, p)
        client = self.oauth.create_client(client_name)
        if not client:
            raise ValueError(f"Provider {p} client not initialized")

        # Get PKCE verifier for token exchange
        pkce_verifier = self.connected_providers.get(p, {}).get("_pkce_verifier")
        if not pkce_verifier:
            raise ValueError("PKCE verifier not found")

        # Exchange code for token with PKCE
        token = await client.authorize_access_token(
            request, code_verifier=pkce_verifier
        )

        user_data = token.get("userinfo", {})

        # Generate our own JWT tokens
        access_token, refresh_token = self.generate_sso_token(
            "default",
            user_data.get("sub", user_data.get("email")),
            ["AuthenticatedUser"],
        )

        app_id = "default"
        conn = {
            "provider": p,
            "connected_at": int(time.time()),
            "status": "connected",
            "user_email": user_data.get("email"),
            "user_name": user_data.get("name"),
            "is_simulated": False,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "metadata": {
                "token_type": token.get("token_type"),
                "pkce_validated": True,
                "state_validated": True,
            },
        }

        if app_id not in self.connected_providers:
            self.connected_providers[app_id] = {}
        self.connected_providers[app_id][p] = conn

        # Clean up PKCE data
        if "_pkce_verifier" in self.connected_providers[app_id][p]:
            del self.connected_providers[app_id][p]["_pkce_verifier"]
        if "_state_id" in self.connected_providers[app_id][p]:
            del self.connected_providers[app_id][p]["_state_id"]

        return conn

    def get_connected_providers(self, app_id: str) -> Dict[str, Any]:
        return self.connected_providers.get(app_id, {})

    def save_config(self, app_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        self.sso_configs[app_id] = config
        return config

    def get_config(self, app_id: str) -> Optional[Dict[str, Any]]:
        return self.sso_configs.get(app_id)

    def generate_sso_token(
        self, app_id: str, user_id: str = "admin_user", roles: Optional[list] = None
    ) -> Tuple[str, str]:
        """Generate access token (RS256) and refresh token pair"""
        if roles is None:
            roles = ["Sovereign", "EnterpriseAdmin"]

        # Generate access token
        access_payload = {
            "sub": user_id,
            "app_id": app_id,
            "roles": roles,
            "type": "access",
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600,  # 1 hour
        }
        access_token = jwt.encode(access_payload, self.private_key, algorithm="RS256")

        # Generate refresh token
        refresh_token_id = str(uuid.uuid4())
        refresh_payload = {
            "sub": user_id,
            "app_id": app_id,
            "type": "refresh",
            "token_id": refresh_token_id,
            "iat": int(time.time()),
            "exp": int(time.time()) + 604800,  # 7 days
        }
        refresh_token = jwt.encode(refresh_payload, self.private_key, algorithm="RS256")

        # Store refresh token
        self.refresh_tokens[refresh_token_id] = {
            "user_id": user_id,
            "app_id": app_id,
            "roles": roles,
            "created_at": int(time.time()),
            "used": False,
        }

        return access_token, refresh_token

    def verify_sso_token(self, token: str) -> Dict[str, Any]:
        """Verify RS256 JWT token"""
        try:
            payload = jwt.decode(token, self.public_key, algorithms=["RS256"])
            return {"valid": True, "payload": payload}
        except jwt.ExpiredSignatureError:
            return {"valid": False, "error": "Token expired"}
        except jwt.InvalidSignatureError:
            return {"valid": False, "error": "Invalid signature"}
        except Exception as e:
            return {"valid": False, "error": str(e)}

    def refresh_access_token(self, refresh_token: str) -> Optional[Tuple[str, str]]:
        """Generate new access token using refresh token"""
        try:
            payload = jwt.decode(refresh_token, self.public_key, algorithms=["RS256"])

            if payload.get("type") != "refresh":
                return None

            token_id = payload.get("token_id")
            if not token_id or token_id not in self.refresh_tokens:
                return None

            refresh_data = self.refresh_tokens[token_id]
            if refresh_data["used"]:
                # Token has been used, invalidate all refresh tokens for this user
                self._invalidate_user_refresh_tokens(refresh_data["user_id"])
                return None

            # Mark this refresh token as used
            refresh_data["used"] = True

            # Generate new token pair
            return self.generate_sso_token(
                refresh_data["app_id"], refresh_data["user_id"], refresh_data["roles"]
            )

        except Exception as e:
            logger.error(f"Refresh token validation failed: {e}")
            return None

    def _invalidate_user_refresh_tokens(self, user_id: str):
        """Invalidate all refresh tokens for a user (security measure)"""
        tokens_to_remove = []
        for token_id, data in self.refresh_tokens.items():
            if data["user_id"] == user_id:
                tokens_to_remove.append(token_id)

        for token_id in tokens_to_remove:
            del self.refresh_tokens[token_id]


sso_service = SSOService()
