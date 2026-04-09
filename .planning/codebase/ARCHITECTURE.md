# Architecture

**Analysis Date:** 2026-04-09

## Pattern Overview

**Overall:** Three-tier microservices gateway architecture with Go API gateway and Python ML backend

**Key Characteristics:**

- Express.js API gateway (`server/index.ts`) with proxy middleware routing to backends
- Go backend for core business logic (auth, agents, billing, workforce)
- Python FastAPI backend for ML/AI processing (inference, compliance, deepfake detection)
- JWT-based authentication with middleware chain protection
- Socket.io for real-time communication and channel subscriptions
- React 18 SPA frontend with wouter client-side routing and TanStack Query
- shadcn/ui component library with Tailwind CSS styling

## Layers

**Frontend (Client):**

- Location: `client/src/`
- Contains: React 18 components, pages, hooks, contexts, lib utilities
- Key technologies: wouter routing, TanStack Query, shadcn/ui, Tailwind CSS, Framer Motion
- Depends on: REST API via `lib/api.ts` with resilient fallback patterns
- Used by: Browser users

**API Gateway (Express):**

- Location: `server/index.ts`
- Contains: Express server, HTTP proxy middleware, JWT validation, rate limiting, Socket.io, security middleware
- Depends on: Go backend (port 8080 via `GO_BACKEND_URL`), Python backend (port 8000 via `PYTHON_BACKEND_URL`)
- Key features: System lock middleware, auth middleware, API/ML rate limiters, panic word global lock
- Used by: Frontend clients, external consumers

**Go Backend:**

- Location: `server/go/cmd/api/main.go`
- Contains: API gateway business logic, handlers, services, repository layer
- Key files: `cmd/`, `internal/handlers/`, `internal/services/`
- Exposed routes: `/api/v1/auth/*`, `/api/v1/agents/*`, `/api/v1/billing/*`, `/api/v1/workforce/*`, `/api/v1/webhooks/*`

**Python Backend:**

- Location: `server/python/app/main.py`
- Contains: FastAPI app, ML inference, compliance checks, deepfake detection
- Key files: `app/main.py`, `app/api/`, `alembic/`
- Exposed routes: `/health`, `/agents`, `/compliance`, `/deepfake`, `/auth/verify`, `/governance`, `/venture`, `/security`, `/intelligence`

## Data Flow

**Frontend to Backend:**

1. React app makes HTTP request via `lib/api.ts` API client
2. Request goes to `/api/v1/*` endpoint
3. Express gateway receives at `server/index.ts`
4. Lock middleware checks `IS_SYSTEM_LOCKED` state (allows auth/status endpoints)
5. JWT middleware validates Bearer token (except `/api/v1/auth` and `/api/status`)
6. Rate limiter applies (100 req/15min general, 20 req/15min ML endpoints)
7. Proxy middleware forwards to appropriate backend based on route prefix
8. Backend processes request and returns response
9. Gateway returns response to frontend

**Authentication Flow:**

1. User submits credentials to `/api/v1/auth/login`
2. Request proxied to Go backend
3. Go backend validates credentials, returns JWT with user data
4. Frontend stores token in localStorage via AuthContext
5. Subsequent requests include `Authorization: Bearer <token>` header
6. Gateway validates JWT on each protected request via middleware
7. Invalid/expired token triggers 401 response and login redirect

**Real-time Communication:**

1. Socket.io client connects to `/ws` endpoint
2. Gateway creates SocketServer instance at `server/index.ts`
3. Clients subscribe to channels via `socket.emit("subscribe", channel)`
4. Backend emits events to subscribed clients (e.g., security_alert, agent_status)

## Key Abstractions

**API Client (`client/src/lib/api.ts`):**

- Purpose: Centralized HTTP client with error handling, fallback support, token management
- Examples: `authApi`, `agentsApi`, `complianceApi`, `billingApi`, `extendedApi`
- Pattern: Factory objects with methods for each endpoint, TypeScript interfaces for types
- Features: Automatic retry, timeout handling, fallback data on API failure

**Auth Context (`client/src/contexts/AuthContext.tsx`):**

- Purpose: Global authentication state, login/logout, product access control
- Exports: `useAuth()` hook with user, isAuthenticated, isManagement, login, logout, hasProductAccess

**Protected Route (`client/src/App.tsx`):**

- Purpose: Route-level access control with product and role checks
- Pattern: Higher-order component wrapping Route with auth/product validation

**Query Client (`client/src/App.tsx`):**

- Purpose: Server state caching and synchronization via TanStack Query
- Uses: React Query for data fetching, caching, invalidation

## Entry Points

**Frontend:**

- Location: `client/src/main.tsx`
- Triggers: Browser loads index.html, React hydrates
- Responsibilities: Create React root, render App component

**Backend Gateway:**

- Location: `server/index.ts`
- Triggers: `node dist/index.js` or `npm start`
- Responsibilities: Express app init, middleware chain, proxy config, Socket.io, static file serving

**Go Service:**

- Location: `server/go/main` (compiled binary)
- Entry: `server/go/cmd/api/main.go`
- Responsibilities: REST API for core business logic (auth, agents, billing, workforce)

**Python Service:**

- Location: `server/python/app/main.py`
- Entry: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Responsibilities: ML inference, compliance checking, deepfake detection

## Key API Modules (Python Backend)

**API Routes (`server/python/app/api/`):**

- `agents.py` - Agent CRUD and operational endpoints
- `compliance.py` - EU AI Act compliance checks and reporting
- `deepfake.py` - Media analysis and fake detection
- `auth_verify.py` - Liveness verification (biometric)
- `enterprise.py` - Enterprise features
- `governance.py` - Governance and advanced features
- `venture.py` - Venture management
- `security.py` - Security endpoints
- `intelligence.py` - AI intelligence features
- `alerts.py` - Alert management

**Services (`server/python/app/services/`):**

- 30+ service modules for ML inference, billing, compliance, workforce, SSO, etc.

**Models (`server/python/app/core/models/`):**

- Agent, Compliance, Deepfake, AI, Auth, Workforce models

## Error Handling

**Strategy:** Multi-layer middleware chain with fallback data support

**Patterns:**

- JWT validation: Returns 401 with "Invalid or expired session"
- Lock middleware: Returns 503 with "System Lock Active" message
- Rate limiting: Returns 429 with "Too many requests"
- API client: `withFallback()` wrapper returns shadow data on failure
- Global error middleware: Catches unhandled errors, returns 500
- React ErrorBoundary: Catches component rendering errors

**Fallback Pattern:**

```typescript
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallbackData: T
): Promise<T> {
  try {
    return await apiCall();
  } catch (err) {
    return fallbackData;
  }
}
```

## Cross-Cutting Concerns

**Logging:** Console-based with prefixes (`[API_DEBUG]`, `[Auth]`, `[SECURITY]`, `[Proxy Auth]`)

**Validation:** Zod schemas, React Hook Form for forms, backend Pydantic validation

**Authentication:** JWT tokens in localStorage, Bearer header, role-based access (admin, management, enterprise, user)

**Security Features:**

- Helmet.js: CSP, security headers
- CORS: Environment-aware (production uses specific origin, dev uses `*`)
- Rate limiting: express-rate-limit for API and ML endpoints
- Panic Word: Global lock system via `/api/v1/panic` endpoint
- Admin secret verification for lock reset

---

_Architecture analysis: 2026-04-09_
