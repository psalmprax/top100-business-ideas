# Codebase Structure

**Analysis Date:** 2026-04-09

## Directory Layout

```
top100-business-ideas/
├── client/                          # Frontend React application
│   └── src/
│       ├── components/              # Reusable UI components
│       │   ├── ui/                  # shadcn/ui base components (60+)
│       │   ├── agents/              # Agent-specific components
│       │   ├── layouts/             # Layout components (V1-V3)
│       │   └── skeletons/           # Loading skeleton components
│       ├── pages/                   # Page-level route components (25+)
│       │   ├── Compliance/           # EU AI Act compliance pages
│       │   ├── AlphaAgentOps.tsx   # Agent operations dashboard
│       │   ├── AlphaDeepfakeDefense.tsx # Deepfake defense
│       │   ├── AlphaWorkforce.tsx    # Workforce automation
│       │   └── *.tsx               # Feature pages
│       ├── hooks/                   # Custom React hooks (6)
│       ├── lib/                     # Core utilities
│       │   ├── api.ts              # Centralized API client
│       │   ├── types.ts            # TypeScript type definitions
│       │   ├── utils.ts           # Utility functions
│       │   ├── storage.ts        # Local storage helpers
│       │   └── exportUtils.ts   # Export functionality
│       ├── contexts/                # React context providers (3)
│       │   ├── AuthContext.tsx    # Authentication state
│       │   ├── ThemeContext.tsx   # Theme (dark/light)
│       │   └── PerspectiveContext.tsx # UI perspective switcher
│       ├── utils/                 # Additional utilities
│       ├── test/                  # Playwright E2E tests
│       ├── tests/                 # Test utilities
│       ├── const.ts              # App constants
│       ├── App.tsx               # Main app with routing
│       ├── main.tsx              # React entry point
│       └── index.css             # Global styles (Tailwind)
├── server/                        # Backend services
│   ├── index.ts                   # Express API gateway (399 lines)
│   ├── go/                       # Go backend
│   │   ├── main                 # Compiled binary
│   │   ├── cmd/                 # Entry points
│   │   ├── internal/            # Business logic
│   │   │   ├── handlers/       # HTTP handlers
│   │   │   ├── services/       # Business services
│   │   │   ├── repository/     # Data access
│   │   │   ├── middleware/    # HTTP middleware
│   │   │   └── database/      # DB connections
│   │   ├── go.mod              # Go dependencies
│   │   └── .env               # Go config
│   └── python/                 # Python ML services
│       ├── app/
│       │   ├── main.py         # FastAPI entry
│       │   ├── api/           # API route modules (15 files)
│       │   ├── core/          # Core modules
│       │   │   ├── config.py  # Settings
│       │   │   ├── database.py # DB connection
│       │   │   └── models/   # SQLModel definitions
│       │   ├── services/      # Business services (35+)
│       │   └── connectors/    # External connectors
│       ├── venv/              # Python virtual env
│       ├── requirements.txt   # Python deps
│       ├── alembic/            # DB migrations
│       └── .env               # Python config
├── packages/                     # Shared SDK packages
│   ├── agentops-sdk/         # Agent operations SDK
│   ├── livenesslink-sdk/     # Liveness detection SDK
│   └── regulens-sdk/         # Compliance SDK
├── shared/                     # Shared utilities
│   └── const.ts             # Shared constants
├── ventures/                # Business venture definitions (30+)
├── tests/                   # Test files
├── dist/                   # Build output
└── .planning/             # Development planning docs
```

## Directory Purposes

**client/src/components/ui/:**

- Purpose: shadcn/ui base component library
- Contains: 60+ components (Button, Input, Card, Dialog, Table, Select, etc.)
- Key files: `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `table.tsx`, `select.tsx`
- Pattern: Radix UI primitives with Tailwind styling

**client/src/pages/:**

- Purpose: Route-level page components
- Contains: 25+ page components for different features
- Key files:
  - `AlphaAgentOps.tsx` - Agent operations dashboard
  - `AlphaDeepfakeDefense.tsx` - Deepfake detection interface
  - `AlphaWorkforce.tsx` - Workforce automation
  - `Home.tsx` - Market intelligence landing
  - `Compliance/index.tsx` - EU AI Act compliance
- Routing: wouter with protected routes via `ProtectedRoute` wrapper

**client/src/lib/:**

- Purpose: Core utility libraries and API integration
- Contains: API client, types, helpers, storage
- Key files:
  - `api.ts` - Centralized API layer with authApi, agentsApi, complianceApi, extendedApi
  - `types.ts` - TypeScript interfaces
  - `utils.ts` - Helper functions

**client/src/hooks/:**

- Purpose: Custom React hooks for reusable logic
- Contains: `useAuth`, `useApi`, `useBusinessIdeas`, `useShortlist`, `usePersistFn`, `useComposition`

**client/src/contexts/:**

- Purpose: Global state management
- Contains: AuthContext, ThemeContext, PerspectiveContext

**server/index.ts:**

- Purpose: Express API gateway
- Responsibilities: JWT auth, rate limiting, proxy to backends, Socket.io, system lock

**server/go/:**

- Purpose: Core backend API (Go)
- Contains: Auth, agents, billing, workforce, webhooks handlers
- Structure: cmd (entry), internal (handlers, services, repository, middleware, database)

**server/python/app/:**

- Purpose: ML/AI backend services (Python/FastAPI)
- Structure: app (main, api routes, core config/models, services), alembic (migrations)
- Contains 15 API route modules and 35+ service modules

## Key File Locations

**Entry Points:**

- `client/src/main.tsx` - React application bootstrap
- `client/src/App.tsx` - Main app with router, providers, routes
- `server/index.ts` - Express gateway with proxy, auth, rate limiting
- `server/go/main` - Compiled Go binary
- `server/python/app/main.py` - FastAPI application

**Configuration:**

- `package.json` - Root project with pnpm, scripts, dependencies
- `vite.config.ts` - Frontend build with Tailwind, React plugins
- `playwright.config.ts` - E2E test configuration
- `tsconfig.json` - TypeScript configuration
- `docker-compose.yml` - Container orchestration

**Core Logic:**

- `client/src/lib/api.ts` - Centralized API communication layer
- `client/src/contexts/AuthContext.tsx` - Authentication state management
- `server/index.ts` - Gateway with proxy, auth, rate limiting

**Testing:**

- `client/src/test/` - Playwright E2E tests
- `client/src/tests/` - Test utilities
- `tests/` - Root-level test files

## Naming Conventions

**Files:**

- React components: PascalCase.tsx (Login.tsx, AlphaAgentOps.tsx)
- Utility files: camelCase.ts (api.ts, utils.ts, storage.ts)
- Test files: camelCase.spec.ts or camelCase.test.ts
- Config: kebab-case (vite.config.ts, playwright.config.ts)

**Directories:**

- Feature pages: PascalCase (Compliance, AlphaAgentOps)
- UI components: kebab-case (error-boundary, perspective-switcher)
- Technical layers: camelCase (components, hooks, contexts, lib)
- Backends: lowercase (go, python)

**Functions/Variables:**

- React components: PascalCase
- Hooks: camelCase with use prefix (useAuth, useApi)
- Utilities: camelCase
- Constants: SCREAMING_SNAKE_CASE

## Where to Add New Code

**New Feature Page:**

- Implementation: `client/src/pages/FeatureName.tsx`
- API integration: Add to `client/src/lib/api.ts` (new API object or extend extendedApi)
- Routing: Add to `client/src/App.tsx` Router component
- Tests: `client/src/test/feature.spec.ts`

**New API Endpoint:**

- Backend (Go): `server/go/internal/handlers/` or `server/go/internal/services/`
- Backend (Python): `server/python/app/api/` or `server/python/app/services/`
- Frontend: Add method to appropriate API object in `client/src/lib/api.ts`

**New UI Component:**

- Base component: `client/src/components/ui/` (shadcn/ui style)
- Feature component: `client/src/components/feature/`
- Tests: Co-located or `client/src/test/`

**New Custom Hook:**

- Location: `client/src/hooks/hookName.ts` or `hookName.tsx`

**New Context:**

- Location: `client/src/contexts/ContextName.tsx`
- Usage: Add Provider to `client/src/App.tsx`

## Special Directories

**packages/:**

- Purpose: SDK packages for external consumption
- Generated: No, maintained as part of project
- Committed: Yes

**ventures/:**

- Purpose: Business venture definitions and documentation
- Contains: 30+ venture directories with specs
- Generated: No
- Committed: Yes

**.planning/:**

- Purpose: Development planning and analysis
- Contains: Phase plans, codebase docs, project state
- Generated: Yes, by planning tools
- Committed: Yes (to git, not deployed)

**dist/:**

- Purpose: Build output (frontend + bundled backend)
- Generated: Yes, during build
- Committed: No (in .gitignore)

---

_Structure analysis: 2026-04-09_
