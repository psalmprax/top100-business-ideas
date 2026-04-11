# Technology Stack

**Analysis Date:** 2026-04-11

## Languages

**Primary:**

- **TypeScript** 5.6.3 - Frontend client (React 19), SDK packages, Vite configuration
- **Go** 1.25.1 - API Gateway (Gin framework)
- **Python** 3.10+ - AI/ML Backend, ML inference services

**Secondary:**

- **PHP** - AgentOps SDK packages (`packages/agentops-sdk-php`)
- **Java/C#/Ruby** - Other AgentOps SDK variants in `packages/`
- **JavaScript ES Modules** - Build tooling and config

## Runtime

**Environment:**

- **Node.js** 22.10.5 - Frontend development server and proxy
- **Go** 1.25.1 - API backend runtime
- **Python** 3.10+ - ML and compliance services (FastAPI)

**Package Manager:**

- **pnpm** 10.4.1 - Primary package manager (lockfile: `pnpm-lock.yaml`)
- **Go modules** - Go dependencies (`go.mod`)
- **pip** - Python dependencies (`requirements.txt`)

## Frameworks

**Frontend:**

- **React** 19.2.1 - UI framework
- **Vite** 7.1.7 - Build tool
- **wouter** 3.3.5 - Client-side routing (patched at 3.7.1)
- **Tailwind CSS** 4.1.14 - Styling (Vite plugin version)
- **@tanstack/react-query** 5.72.0 - Server state management

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
- **Playwright** 1.58.2 - E2E testing (Playwright core 1.49.1 also referenced)

## Key Dependencies

**Frontend:**

- `@radix-ui/*` - UI component library
- `socket.io-client` 4.8.1 - Real-time communication
- `axios` 1.12.0 - HTTP client
- `framer-motion` 12.23.22 - Animations
- `recharts` 2.15.2 - Charts
- `lucide-react` 0.453.0 - Icons
- `jspdf` 4.2.0 - PDF generation

**Backend (Go):**

- `github.com/gin-gonic/gin` v1.9.1
- `github.com/jackc/pgx/v5` v5.8.0 - PostgreSQL driver
- `github.com/redis/go-redis/v9` v9.18.0 - Redis client
- `github.com/stripe/stripe-go/v76` v76.25.0 - Stripe SDK
- `github.com/plutov/paypal/v4` v4.17.0 - PayPal SDK

**Backend (Python):**

- `fastapi` 0.109.0
- `sqlmodel` 0.0.14
- `psycopg2-binary` 2.9.9 (sync), `asyncpg` 0.29.0 (async)
- `torch` 2.2.0 - ML framework
- `transformers** 4.36.2 - Hugging Face transformers
- `librosa` 0.10.0 - Audio analysis
- `numpy` 1.26.3
- `opencv-python-headless` 4.9.0.80

## Internal SDKs

- **@agentops/sdk** - AI agent monitoring/observability (multiple language bindings)
- **@livenesslink/sdk** - Deepfake/biometric authentication
- **@regulens/sdk** - EU AI Act compliance checking

## Configuration

**Development:**

- `pnpm dev` - Starts Vite dev server (port 7000)
- `server/go/cmd/server` - Starts Go backend (port 7001)
- `server/python/app/main.py` - Starts Python backend (port 7002)

**Production:**

- `docker-compose.yml` - Orchestrates all services (ports 7000-7004)
- Mixed Go/Python backends serving frontend via proxy.

---

_Stack analysis: 2026-04-11_
