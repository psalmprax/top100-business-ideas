# Codebase Structure

**Analysis Date:** 2026-04-11

## Directory Layout

```
top100-business-ideas/
├── client/                          # Frontend React 19 application
│   ├── src/
│   │   ├── components/              # Reusable UI components (shadcn/ui + custom)
│   │   ├── pages/                   # Feature pages (Compliance, AgentOps, etc.)
│   │   ├── hooks/                   # Custom React hooks (useAuth, useApi)
│   │   ├── contexts/                # Global state (Auth, Theme, Perspective)
│   │   ├── lib/                     # API client and core utilities
│   │   └── App.tsx                  # Main router and provider setup
│   ├── public/                      # Static assets
│   └── vite.config.ts               # Vite/Tailwind 4 configuration
├── server/                          # Backend services
│   ├── index.ts                     # Express Gateway / JWT Proxy (Unified Server)
│   ├── go/                          # Go Backend (cmd, internal, go.mod)
│   └── python/                      # Python ML Backend (app, migrations)
├── packages/                        # Internal SDKs (Shared across products)
│   ├── agentops-sdk*/               # Multi-language agent monitoring SDKs
│   ├── livenesslink-sdk*/           # Biometric defense SDKs
│   └── regulens-sdk*/               # AI compliance SDKs
├── ventures/                        # 100+ Business intelligence/venture specs
├── shared/                          # Cross-frontend/backend shared code
├── tests/                           # Global E2E and verification scripts
├── dist/                            # Production build artifacts (gitignored)
├── .planning/                       # GSD workflows, phases, and codebase maps
└── .manus-logs/                     # Development debug logs (network, console)
```

## Directory Purposes

**client/src/**:
- **components/ui/**: 60+ low-level primitives using Radix UI and Tailwind 4.
- **pages/**: Integrated dashboards for specific AlphaHecta products (AgentOps, Sentinel, DeepfakeDefense, ComplianceHub).
- **lib/api.ts**: The "Nexus" for frontend-backend communication, containing clients for all proxied backends.

**server/index.ts**:
- The "Guard" of the system. Handles the **Global Lockdown** logic, CORS enforcement, and auth-gated proxying to the Go and Python microservices.

**server/go/internal/**:
- High-concurrency services for user management, real-time agent orchestration, and payment processing.

**server/python/app/services/**:
- Complex logic for ML inference, deepfake verification, and semantic compliance audits. Contains 35+ specialized service modules.

**packages/**:
- A polyglot SDK repository providing language-specific bindings for the core AlphaHecta platform capabilities (Go, Python, PHP, Java, etc.).

**ventures/**:
- A data-rich repository of "Startup Opportunity Maps", "Gap Analyses", and "customer validation" templates for 100+ business ideas.

## Key File Locations

**Core Entries:**
- `server/index.ts`: The unified gateway.
- `client/src/main.tsx`: React frontend entry.
- `server/go/cmd/server/main.go`: Go API entry.
- `server/python/app/main.py`: Python FastAPI entry.

**Security & Settings:**
- `.env`: Master secrets configuration.
- `vite.config.ts`: Frontend build and proxy rules.
- `docker-compose.yml`: Local infrastructure setup (Postgres/Redis/Apps).

**Hardening/Analysis:**
- `AGENT_DOCUMENTATION.md`: Overview of the agent architecture.
- `biometrics-verification-report.md`: Verification of the liveness detection system.

## Naming Conventions

- **React components**: PascalCase (e.g., `AlphaAgentOpsDashboard.tsx`).
- **Python/Go services**: snake_case for Python, camelCase/TitleCase for Go.
- **SDKs**: kebab-case (e.g., `agentops-sdk-python`).
- **Constants**: SCREAMING_SNAKE_CASE.

---

_Structure analysis: 2026-04-11_
