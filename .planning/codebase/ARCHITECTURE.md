# Architecture

**Analysis Date:** 2026-04-08

## Pattern Overview

**Overall:** Single Page Application (SPA) with Microservices Backend

**Key Characteristics:**

- Frontend SPA built with React and TypeScript
- API Gateway pattern using Express.js proxy
- Backend split into Go (core APIs) and Python (ML/AI services)
- Real-time communication via WebSockets
- Containerized deployment with Docker

## Layers

**Presentation Layer:**

- Purpose: User interface and client-side logic
- Location: `client/src/`
- Contains: React components, pages, hooks, contexts
- Depends on: API Layer, UI libraries
- Used by: End users via web browser

**API Gateway Layer:**

- Purpose: Request routing and middleware
- Location: `server/index.ts`
- Contains: Express server, proxy configuration, WebSocket handling
- Depends on: Backend services
- Used by: Frontend application

**Core Services Layer:**

- Purpose: Business logic, authentication, data persistence
- Location: `server/go/`
- Contains: REST APIs, database operations, authentication
- Depends on: Database, external APIs
- Used by: API Gateway

**AI/ML Services Layer:**

- Purpose: Machine learning inference, compliance analysis
- Location: `server/python/`
- Contains: ML models, compliance checks, deepfake detection
- Depends on: Core services, external ML APIs
- Used by: API Gateway, Core services

## Data Flow

**User Authentication Flow:**

1. User submits credentials via login form
2. Frontend calls `authApi.login()`
3. Request proxied to Go backend `/api/v1/auth/login`
4. Go service validates credentials against database
5. JWT token returned and stored in localStorage
6. Subsequent requests include Authorization header

**API Request Flow:**

1. Frontend makes request via centralized API layer (`lib/api.ts`)
2. Request routed through Express proxy to appropriate backend
3. Backend processes request and returns data
4. Response cached via React Query for state management

**Real-time Updates:**

1. WebSocket connection established via Socket.IO
2. Backend services emit events to subscribed clients
3. Frontend updates UI reactively via event handlers

**State Management:**

- Local component state for UI interactions
- React contexts for global app state (auth, theme, perspective)
- React Query for server state caching and synchronization
- localStorage for persistent client-side data

## Key Abstractions

**API Layer:**

- Purpose: Centralized HTTP client with error handling and fallbacks
- Examples: `client/src/lib/api.ts`
- Pattern: Modular API objects (authApi, agentsApi, etc.) with TypeScript interfaces

**Component Architecture:**

- Purpose: Reusable UI components with consistent styling
- Examples: `client/src/components/ui/`, `client/src/components/`
- Pattern: Shadcn/ui components with Tailwind CSS, feature-based organization

**Context Providers:**

- Purpose: Global state management without prop drilling
- Examples: `client/src/contexts/AuthContext.tsx`, `client/src/contexts/PerspectiveContext.tsx`
- Pattern: React Context API with custom hooks

## Entry Points

**Frontend Entry Point:**

- Location: `client/src/main.tsx`
- Triggers: Browser navigation to application URL
- Responsibilities: Bootstrap React app, render root component

**Server Entry Point:**

- Location: `server/index.ts`
- Triggers: Node.js process start
- Responsibilities: Start Express server, configure middleware, establish WebSocket connections

**Build Entry Points:**

- Frontend: `vite.config.ts` - Vite build configuration
- Backend: `server/index.ts` - esbuild bundles for production

## Error Handling

**Strategy:** Multi-layer error handling with fallbacks

**Patterns:**

- Frontend: Error boundaries for React component errors
- API Layer: try/catch with fallback data for resilience
- Server: Express error middleware for 500 responses
- Backend: Structured error responses with status codes

## Cross-Cutting Concerns

**Logging:** Console-based logging with structured output, file logging in server directories

**Validation:** Zod schemas for runtime type validation, API request/response validation

**Authentication:** JWT tokens with localStorage persistence, automatic logout on 401 responses

**Security:** Helmet for security headers, CORS configuration, rate limiting

---

_Architecture analysis: 2026-04-08_
