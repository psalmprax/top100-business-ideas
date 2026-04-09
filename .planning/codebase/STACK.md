# Technology Stack

**Analysis Date:** 2026-04-09

## Languages

**Primary:**

- **TypeScript** 5.6.3 - Frontend client (React 19), SDK packages, Vite configuration
- **Go** 1.25.1 - API Gateway (Gin framework)
- **Python** 3.x - AI/ML Backend, ML inference services

**Secondary:**

- **PHP** - AgentOps SDK packages (`packages/agentops-sdk-php`)
- **JavaScript ES Modules** - Build tooling and config

## Runtime

**Environment:**

- **Node.js** 22.10.5 - Frontend development server and proxy
- **Go** 1.25.1 - API backend runtime
- **Python** - ML and compliance services (FastAPI)

**Package Manager:**

- **pnpm** 10.4.1 - Primary package manager (lockfile: `pnpm-lock.yaml`)
- **Go modules** - Go dependencies (`go.mod`)
- **pip** - Python dependencies (`requirements.txt`)
- **Composer** - PHP dependencies

## Frameworks

**Frontend:**

- **React** 19.2.1 - UI framework
- **Vite** 7.1.7 - Build tool
- **wouter** 3.3.5 - Client-side routing
- **Tailwind CSS** 4.1.14 - Styling
- **@tanstack/react-query** 5.72.0 - Server state management
- **react-hook-form** 7.64.0 - Form handling
- **@hookform/resolvers** 5.2.2 - Form validation resolvers
- **Zod** 4.1.12 - Runtime type validation

**Backend (Go):**

- **Gin** 1.9.1 - HTTP web framework
- **Gorilla WebSocket** 1.5.1 - WebSocket support

**Backend (Python):**

- **FastAPI** 0.109.0 - Async web framework
- **Uvicorn** 0.27.0 - ASGI server
- **Pydantic** >=2.12.5 - Data validation
- **SQLModel** 0.0.14 - ORM
- **Alembic** 1.13.1 - Database migrations

**Testing:**

- **Vitest** 2.1.4 - Unit and integration tests
- **Playwright** 1.49.1 - E2E testing

## Key Dependencies

**Frontend:**

- `@radix-ui/*` (40+ components) - UI component library
- `socket.io-client` 4.8.1 - Real-time communication
- `axios` 1.12.0 - HTTP client
- `framer-motion` 12.23.22 - Animations
- `recharts` 2.15.2 - Charts
- `lucide-react` 0.453.0 - Icons
- `jspdf` 4.2.0 - PDF generation

**Backend (Go):**

- `github.com/gin-gonic/gin` v1.9.1 - HTTP framework
- `github.com/jackc/pgx/v5` v5.8.0 - PostgreSQL driver
- `github.com/redis/go-redis/v9` v9.18.0 - Redis client
- `github.com/stripe/stripe-go/v76` v76.25.0 - Stripe SDK
- `github.com/plutov/paypal/v4` v4.17.0 - PayPal SDK
- `github.com/golang-jwt/jwt/v5` v5.2.0 - JWT handling
- `github.com/rs/zerolog` v1.31.0 - Logging

**Backend (Python):**

- `fastapi` 0.109.0 - Web framework
- `sqlmodel` 0.0.14 - ORM
- `psycopg2-binary` 2.9.9 - PostgreSQL driver (sync)
- `asyncpg` 0.29.0 - PostgreSQL driver (async)
- `stripe` 11.4.0 - Stripe SDK
- `torch` 2.2.0 - ML framework
- `transformers` 4.36.2 - Hugging Face transformers
- `numpy` 1.26.3 - Numerical computing
- `pillow` 10.2.0 - Image processing
- `opencv-python-headless` 4.9.0.80 - Computer vision
- `python-jose[cryptography]` 3.3.0 - JWT handling
- `httpx` >=0.28.1 - HTTP client
- `duckduckgo-search` 6.3.3 - Search integration

**Internal SDKs:**

- `@livenesslink/sdk` - Deepfake/biometric authentication
- `@regulens/sdk` - EU AI Act compliance
- `@agentops/sdk` - AI agent monitoring/observability

## Configuration

**Environment Variables (Go Backend):**

- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE` - PayPal integration
- `JWT_SECRET` - Token signing
- `ADMIN_SECRET` - Admin operations
- `PYTHON_BACKEND_URL` - Python service URL

**Frontend Build:**

- `vite.config.ts` with React, Tailwind, JSX plugins
- TypeScript strict mode enabled
- Path aliases: `@/`, `@shared/`, `@assets/`
- Server proxy: `/api/v1` → Go backend, `/ml` → Go backend

**Python Backend:**

- `settings.py` - Configuration via `pydantic-settings`
- Database migrations via Alembic

## Platform Requirements

**Development:**

- Node.js 22+
- Go 1.25+
- Python 3.8+
- PostgreSQL 15+
- Redis 7+

**Production:**

- Docker containers via `docker-compose.yml`
- Services: Go API Gateway (port 7001), Python ML Backend (port 7002), Frontend (port 7000), PostgreSQL (port 7003), Redis (port 7004)
- PostgreSQL + Redis infrastructure

---

_Stack analysis: 2026-04-09_
