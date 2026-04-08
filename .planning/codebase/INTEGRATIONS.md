# External Integrations

**Analysis Date:** 2026-04-08

## APIs & External Services

**Authentication & Identity:**

- Stripe - Payment processing and subscriptions
  - SDK/Client: Direct API calls via billingApi
  - Auth: API key in environment
  - Purpose: Billing and subscription management

**Database & Storage:**

- PostgreSQL - Primary database
  - Connection: Via Go backend configuration
  - Client: Database/sql with pgx driver
  - Purpose: User data, business logic persistence

- Redis - Caching and session storage
  - Connection: Via Go backend
  - Purpose: Session management, caching

**AI/ML Services:**

- Various LLM providers (OpenAI, Anthropic, Google, etc.)
  - SDK/Client: Direct API calls via agentsApi
  - Auth: API keys per provider
  - Purpose: AI agent operations, inference

**Real-time Communication:**

- Socket.IO - WebSocket connections
  - SDK/Client: socket.io-client and socket.io
  - Purpose: Real-time agent monitoring, notifications

## Data Storage

**Databases:**

- PostgreSQL
  - Connection: Environment variables in Go backend
  - Client: Go database/sql with pgx

**File Storage:**

- Local filesystem for uploaded artifacts
- S3-compatible storage for media files (deepfake analysis)

**Caching:**

- Redis
  - Connection: Via Go backend configuration
  - Purpose: Session storage, API response caching

## Authentication & Identity

**Auth Provider:**

- Custom JWT-based authentication
  - Implementation: Go backend handles login/register
  - Token storage: localStorage in browser
  - Session management: Redis-backed

## Monitoring & Observability

**Error Tracking:**

- Console logging with structured output
- Custom error handling in API layer

**Logs:**

- File-based logging in server directories
- Structured JSON logging for debugging

## CI/CD & Deployment

**Hosting:**

- Docker containers for each service
- Express server serves static frontend
- Go and Python backends as separate containers

**CI Pipeline:**

- GitHub Actions workflows
- Automated testing with Vitest and Playwright
- Build and deployment scripts

## Environment Configuration

**Required env vars:**

- VITE_API_URL - Frontend API endpoint
- GO_BACKEND_URL - Go services URL
- PYTHON_BACKEND_URL - Python ML services URL
- DATABASE_URL - PostgreSQL connection string
- REDIS_URL - Redis connection string
- STRIPE_SECRET_KEY - Stripe API key
- JWT_SECRET - Authentication secret

**Secrets location:**

- Environment variables (not committed to git)
- Local .env files for development
- Docker secrets or external secret management in production

## Webhooks & Callbacks

**Incoming:**

- Webhook endpoints for external integrations
  - Configured via webhooksApi
  - Events: Agent status, compliance alerts, billing events

**Outgoing:**

- Webhook deliveries for configured integrations
  - Support for Slack, email, custom URLs
  - Events: Agent completions, system alerts, user actions

---

_Integration audit: 2026-04-08_
