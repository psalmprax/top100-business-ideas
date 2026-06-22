# External Integrations

**Analysis Date:** 2026-04-11

## Payment Gateways

**Stripe:**

- SDK: `github.com/stripe/stripe-go/v76` (Go), `stripe` (Python).
- Purpose: Usage-based billing for AI agent credits and subscriptions.
- Integration: Go backend handles checkout sessions and webhook verification.

**PayPal:**

- SDK: `github.com/plutov/paypal/v4`.
- Purpose: Alternative subscription payment method.

## Data Storage

**PostgreSQL:**

- Instance: Shared database (port 7003 in Docker).
- Drivers: `pgx/v5` (Go), `psycopg2-binary`/`asyncpg` (Python).
- Schema: Managed via SQLModel and Alembic migrations from the Python backend.
- Critical Tables: `workforce`, `business_ideas`, `subscriptions`, `agent_logs`.

**Redis:**

- Instance: Port 7004 in Docker.
- Client: `go-redis/v9`.
- Purpose: Real-time session caching, rate limiting, and WebSocket subscription tracking.

## Authentication & Identity

**Unified JWT:**

- Strategy: Gateway-enforced JWT verification.
- Flow: Go backend issues tokens; Express Gateway validates tokens for ALL microservice routes.
- Format: HS256 with environment-managed `JWT_SECRET`.

**OAuth2 / OIDC:**

- Provider: Google.
- Implementation: `server/go/internal/middleware/oauth2.go`.
- Flow: Client-side redirect via Go backend handlers.

## Private SDK Ecosystem (Internal)

The project relies on a robust set of internal libraries located in `packages/`:

**AgentOps SDK:**

- Purpose: Standardized logging and observability for AI agents.
- Consumers: Go, Python, Node, and PHP services.

**LivenessLink SDK:**

- Purpose: Real-time biometric verification and deepfake defense.
- consumers: Python ML service for facial liveness detection.

**ReguLens SDK:**

- Purpose: Automated compliance audits against the EU AI Act.
- Consumers: Python compliance service and specialized venture auditors.

## AI/ML Integrations

**Model Pipelines:**

- **Frameworks**: PyTorch, Transformers.
- **Computer Vision**: OpenCV (headless) for deepfake detection.
- **Information Retrieval**: `duckduckgo-search` (DDGS) for workforce market intelligence.

## Communication & Infrastructure

**WebSockets:**

- **Go Hub**: Handles high-performance agent state updates.
- **Express Socket.io**: Handles global security alerts and lockdown notifications.

**Mailing:**

- **SMTP**: Managed via configured `SMTP_USERNAME`/`PASSWORD`.

**Reverse Proxy / Gateway:**

- **Traefik/Nginx**: Used for SSL termination and request routing in production environments.

---

_Integration audit: 2026-04-11_
