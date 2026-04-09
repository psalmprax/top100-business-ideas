# External Integrations

**Analysis Date:** 2026-04-09

## Payment Gateways

**Stripe:**

- SDK (Go): `github.com/stripe/stripe-go/v76` v76.25.0
- SDK (Python): `stripe` 11.4.0
- Purpose: Subscription billing, checkout sessions, invoicing, customer management
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLIC_KEY`
- Used by: Billing service, webhook handlers

**PayPal:**

- SDK: `github.com/plutov/paypal/v4` v4.17.0
- Purpose: Alternative payment method for subscriptions
- Env vars: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`

## Data Storage

**PostgreSQL:**

- Client (Go): `github.com/jackc/pgx/v5` v5.8.0
- Client (Python): `psycopg2-binary` 2.9.9 (sync), `asyncpg` 0.29.0 (async)
- Connection: `DATABASE_URL` env var (Go), individual `DB_*` vars (Python)
- Schema: SQLModel, Alembic migrations
- Tables: users, subscriptions, usage_metrics, business_ideas, workforce, compliance, etc.

**Redis:**

- Client: `github.com/redis/go-redis/v9` v9.18.0
- Connection: `REDIS_URL` or `REDIS_HOST:REDIS_PORT` env vars
- Purpose: Session caching, WebSocket connection tracking, pub/sub, rate limiting

**File Storage:**

- Local filesystem for uploaded artifacts (configurable via `UPLOAD_DIR`)
- Models persisted to `/models` volume in Python container

## Authentication & Identity

**Custom JWT:**

- Library (Go): `github.com/golang-jwt/jwt/v5` v5.2.0
- Library (Python): `python-jose[cryptography]` 3.3.0
- Implementation: Go backend generates tokens; middleware validates
- Token types: access (short-lived), refresh (long-lived)
- Expiry: Configurable (default 24h)

**OAuth2/OIDC:**

- Middleware: `server/go/internal/middleware/oauth2.go`
- Provider support: Google (OIDC)
- Flows: Login, callback, token refresh, revocation
- Scopes: openid, profile, email
- Env vars: `OIDC_GOOGLE_CLIENT_ID`, `OIDC_GOOGLE_CLIENT_SECRET`

**SMTP Email:**

- Service: Custom Go email service (`server/go/internal/services/email.go`)
- SMTP Host: Configurable (smtp.gmail.com:587 common)
- Env vars: `SMTP_USERNAME`, `SMTP_PASSWORD`, `FROM_EMAIL`

**Session Management:**

- Starlette SessionMiddleware for OAuth state
- Redis-backed sessions for production

## AI/ML Integrations

**LivenessLink SDK:**

- Package: `@livenesslink/sdk` (internal)
- Purpose: Deepfake detection, biometric authentication
- Location: `packages/livenesslink-sdk/`, `packages/livenesslink-sdk-python/`

**Regulens SDK:**

- Package: `@regulens/sdk` (internal)
- Purpose: EU AI Act compliance checking
- Location: `packages/regulens-sdk/`, `packages/regulens-sdk-python/`

**AgentOps SDK:**

- Package: `@agentops/sdk` / `@agentops/sdk-go` / `@agentops/sdk-php`
- Purpose: AI agent monitoring and observability
- Location: `packages/agentops-sdk/`, `packages/agentops-sdk-go/`, `packages/agentops-sdk-php/`

**Deepfake Detection:**

- OpenCV (`opencv-python-headless` 4.9.0.80)
- PyTorch (`torch` 2.2.0)
- Custom ML endpoint: `/ml/deepfake/detect`

**Compliance Analysis:**

- Transformers (`transformers` 4.36.2)
- Custom ML endpoint: `/ml/ai-compliance/check`

## Real-time Communication

**WebSocket:**

- Server (Go): `github.com/gorilla/websocket` v1.5.1
- Client: `socket.io-client` 4.8.1 / `socket.io` 4.8.1
- Hub: `server/go/internal/services/websocket.go`
- Endpoint: `/api/v1/ws`
- Broadcast: Compliance live metrics (10s interval)

## Search & External Data

**DuckDuckGo Search:**

- Package: `duckduckgo-search` 6.3.3
- Purpose: Market intelligence, lead sourcing
- Usage: Workforce service autosearch

## Monitoring & Logging

**Logging (Go):**

- Library: `github.com/rs/zerolog` v1.31.0
- Console logging with structured output

**Logging (Python):**

- Standard `logging` module
- Configured via `logging.basicConfig()`

**Debug Collector:**

- Custom Vite plugin for browser log collection
- Logs written to `.manus-logs/` directory
- Sources: browser console, network requests, session replay

## Third-Party Services

**Environment Configuration:**

| Variable                                        | Purpose                      |
| ----------------------------------------------- | ---------------------------- |
| DATABASE_URL                                    | PostgreSQL connection string |
| DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME | PostgreSQL credentials       |
| REDIS_URL                                       | Redis connection string      |
| REDIS_HOST, REDIS_PORT                          | Redis credentials            |
| STRIPE_SECRET_KEY                               | Stripe API authentication    |
| STRIPE_WEBHOOK_SECRET                           | Stripe webhook verification  |
| STRIPE_PUBLIC_KEY                               | Stripe public key (frontend) |
| PAYPAL_CLIENT_ID                                | PayPal OAuth client ID       |
| PAYPAL_SECRET                                   | PayPal OAuth secret          |
| JWT_SECRET                                      | Token signing key            |
| ADMIN_SECRET                                    | Admin operations key         |
| SESSION_SECRET_KEY                              | Session encryption           |
| OIDC_GOOGLE_CLIENT_ID                           | Google OAuth client ID       |
| OIDC_GOOGLE_CLIENT_SECRET                       | Google OAuth secret          |
| OPENAI_API_KEY                                  | OpenAI API (optional)        |
| PYTHON_BACKEND_URL                              | Python service URL           |

**Secrets Location:**

- Environment files (`.env`) - not committed to git
- Docker environment variables in `docker-compose.yml`
- Deployment pipeline environment

## CI/CD & Deployment

**Hosting:**

- Docker containers via `docker-compose.yml`
- Services: Go API Gateway (port 7001), Python ML Backend (port 7002), Frontend (port 7000), PostgreSQL (port 7003), Redis (port 7004)

**CI Pipeline:**

- GitHub Actions: `.github/workflows/ci-cd.yml`
- Jenkins: `jenkins-docker-compose.yml`
- E2E Testing: `docker-compose.e2e.yml` with Playwright
- Automated tests: Vitest (unit), Playwright (E2E)

---

_Integration audit: 2026-04-09_
