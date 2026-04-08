# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**

- TypeScript 5.6.3 - Frontend client application and server
- Python 3.x - ML and compliance backend services
- Go 1.x - Core API services

**Secondary:**

- JavaScript (ES modules) - Configuration and build scripts

## Runtime

**Environment:**

- Node.js 22.10.5 - Frontend build and server runtime
- Python 3.x - ML inference and compliance services
- Go runtime - API gateway and core services

**Package Manager:**

- pnpm 10.4.1 - Primary package manager
- pip - Python dependencies
- Go modules - Go dependencies

## Frameworks

**Core:**

- React 19.2.1 - Frontend SPA framework
- Express 4.21.2 - API proxy server
- Vite 7.1.7 - Frontend build tool

**Testing:**

- Vitest 2.1.4 - Unit testing framework
- Playwright 1.58.2 - E2E testing framework

**Build/Dev:**

- esbuild 0.25.0 - Backend bundling
- TypeScript 5.6.3 - Type checking and compilation

## Key Dependencies

**Critical:**

- @tanstack/react-query 5.72.0 - Server state management
- wouter 3.3.5 - Client-side routing
- socket.io 4.8.1 - Real-time communication
- axios 1.12.0 - HTTP client (fallback)
- zod 4.1.12 - Runtime type validation

**Infrastructure:**

- helmet 8.0.0 - Security headers
- cors 2.8.5 - Cross-origin resource sharing
- express-rate-limit 7.5.0 - API rate limiting
- compression 1.7.5 - Response compression

## Configuration

**Environment:**

- VITE_API_URL - Frontend API endpoint
- GO_BACKEND_URL - Go services endpoint
- PYTHON_BACKEND_URL - Python services endpoint
- CORS_ORIGIN - Allowed origins
- NODE_ENV - Runtime environment

**Build:**

- Vite config with React plugin
- TypeScript config with strict mode
- ESLint configuration for code quality
- Tailwind CSS 4.1.14 for styling

## Platform Requirements

**Development:**

- Node.js 22+
- pnpm package manager
- Python 3.8+ for ML services
- Go 1.19+ for API services

**Production:**

- Docker containers for each service
- Nginx or similar reverse proxy
- PostgreSQL database
- Redis for caching and sessions

---

_Stack analysis: 2026-04-08_
