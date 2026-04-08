# Codebase Structure

**Analysis Date:** 2026-04-08

## Directory Layout

```
.
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # Base UI components (buttons, forms, etc.)
│   │   │   ├── agents/               # Agent-specific components
│   │   │   ├── layouts/              # Layout components
│   │   │   └── skeletons/            # Loading skeleton components
│   │   ├── pages/                    # Page-level components/routes
│   │   │   ├── Compliance/           # Compliance feature pages
│   │   │   ├── AlphaAI.tsx           # Landing/marketing page
│   │   │   └── *.tsx                 # Individual page components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utility libraries and APIs
│   │   │   ├── api.ts                # Centralized API client
│   │   │   ├── types.ts              # TypeScript type definitions
│   │   │   ├── utils.ts              # Utility functions
│   │   │   └── storage.ts            # Local storage helpers
│   │   ├── contexts/                 # React context providers
│   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   ├── ThemeContext.tsx      # Theme management
│   │   │   └── PerspectiveContext.tsx # UI perspective switching
│   │   ├── const.ts                  # Application constants
│   │   └── main.tsx                  # Application entry point
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.ts               # Vite build configuration
├── server/                          # Backend services
│   ├── index.ts                     # Express API gateway
│   ├── go/                          # Go backend services
│   │   ├── cmd/api/main.go          # Go API entry point
│   │   ├── internal/
│   │   │   ├── handlers/            # HTTP request handlers
│   │   │   ├── services/            # Business logic services
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── middleware/          # HTTP middleware
│   │   │   ├── database/            # Database connections
│   │   │   └── config/              # Configuration management
│   │   └── go.mod                   # Go dependencies
│   └── python/                      # Python ML services
│       ├── app/
│       │   ├── main.py              # FastAPI app entry point
│       │   ├── api/                 # API route handlers
│       │   └── __init__.py
│       ├── requirements.txt          # Python dependencies
│       └── alembic/                 # Database migrations
├── shared/                          # Shared utilities/types
├── ventures/                        # Business venture definitions
├── packages/                        # Shared packages (SDKs)
│   ├── agentops-sdk/                # Agent operations SDK
│   └── livenesslink-sdk/            # Liveness detection SDK
├── .planning/                       # Development planning docs
├── tests/                           # Test files
├── dist/                            # Build output
└── docs/                            # Documentation
```

## Directory Purposes

**client/src/components/ui/:**

- Purpose: Base UI components from shadcn/ui library
- Contains: Button, Input, Card, Dialog, etc. components
- Key files: `button.tsx`, `input.tsx`, `card.tsx`

**client/src/pages/:**

- Purpose: Route-level page components
- Contains: Login, Dashboard, Settings, feature pages
- Key files: `Home.tsx`, `Login.tsx`, `AlphaAgentOps.tsx`

**client/src/lib/:**

- Purpose: Utility functions and external service integrations
- Contains: API client, type definitions, helpers
- Key files: `api.ts`, `types.ts`, `utils.ts`

**server/go/internal/handlers/:**

- Purpose: HTTP request handlers for REST API endpoints
- Contains: User management, agent operations, billing
- Key files: `auth.go`, `user.go`, `billing.go`

**server/python/app/api/:**

- Purpose: ML and compliance API endpoints
- Contains: Deepfake detection, compliance checks, ML inference
- Key files: `compliance.py`, `deepfake.py`, `ml_endpoints.py`

## Key File Locations

**Entry Points:**

- `client/src/main.tsx`: React application bootstrap
- `server/index.ts`: Express server startup
- `server/go/cmd/api/main.go`: Go API service startup
- `server/python/app/main.py`: Python ML service startup

**Configuration:**

- `client/vite.config.ts`: Frontend build configuration
- `server/go/internal/config/config.go`: Backend configuration
- `package.json`: Project dependencies and scripts

**Core Logic:**

- `client/src/lib/api.ts`: Centralized API communication
- `client/src/contexts/AuthContext.tsx`: Authentication state management
- `server/go/internal/services/auth.go`: Authentication business logic

**Testing:**

- `client/src/tests/`: Frontend unit tests
- `playwright.config.ts`: E2E test configuration

## Naming Conventions

**Files:**

- React components: PascalCase.tsx (Button.tsx, LoginPage.tsx)
- Utility files: camelCase.ts (api.ts, utils.ts)
- Test files: _.spec.ts or _.test.ts

**Directories:**

- kebab-case for features (alpha-agent-ops, deepfake-defense)
- camelCase for technical layers (components, contexts)
- PascalCase for component subdirectories (Compliance, AlphaAI)

## Where to Add New Code

**New Feature:**

- Primary code: `client/src/pages/` for page component
- Tests: `client/src/tests/` or `tests/` directory
- API integration: Add to `client/src/lib/api.ts`

**New Component/Module:**

- UI component: `client/src/components/ui/` if base, `client/src/components/` if feature-specific
- Custom hook: `client/src/hooks/`
- Context provider: `client/src/contexts/`

**Utilities:**

- Shared helpers: `client/src/lib/utils.ts`
- Type definitions: `client/src/lib/types.ts`
- Business logic: `shared/` for cross-platform utilities

## Special Directories

**ventures/:**

- Purpose: Contains individual business venture definitions and templates
- Generated: No, manually curated
- Committed: Yes
- Note: Each venture is a potential business idea with implementation details

**packages/:**

- Purpose: Shared SDK packages for external consumption
- Generated: No, developed as part of project
- Committed: Yes
- Note: agentops-sdk and livenesslink-sdk for third-party integration

**.planning/:**

- Purpose: Development planning and documentation
- Generated: Yes, by planning tools
- Committed: Yes
- Note: Contains phase plans, codebase analysis, etc.

---

_Structure analysis: 2026-04-08_
