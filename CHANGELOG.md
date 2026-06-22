# Changelog

All notable changes to the Alpha Hecta platform are documented in this file.

Generated from git commit history (200 commits, 2026-03-21 → 2026-04-24).

---

## [2026-04-24]

### Fixed
- `fix(middleware)`: Restore missing `fmt` import in redis_ratelimit.go

---

## [2026-04-23]

### Features
- `feat(intelligence)`: Use hermes3 model and update Ollama base URL for production
- `feat`: Integrate Ollama provider and switch Paperclip/Hermes to local-first AI
- `feat`: Upgrade AlphaHecta UI to Elite v1.1 (Neural Flow, Hyper-Glass, Noise Texture)
- `feat`: Implement AlphaHecta Design System v1.0 (Iridescent Borders, Frosted Header, 3D Hero)
- `feat`: Upgrade Login page to Elite Obsidian v1.1 aesthetic

### Fixed
- `fix(go)`: Register intelligence research/strategy routes and sync interface
- `fix`: Increase rate limits to prevent 429 errors on dashboard
- `fix`: Disable CSP to resolve ERR_SSL_PROTOCOL_ERROR on HTTP-only server
- `fix`: Add missing SelfHealingEvent model to compliance_models
- `fix`: Align docker-compose context for python-backend
- `fix`: Omit empty product_id in login payload to prevent 400 error
- `fix(proxy)`: Use pathFilter to prevent path stripping in proxy middleware
- `fix(middleware)`: Add missing `fmt` import and configure trusted proxies
- `fix(proxy)`: Mount proxy middleware directly to prevent path stripping
- `fix(middleware)`: Exclude `/api/v1/auth/` routes from rate limiting to prevent dev blockers and loops

### Style
- `style`: Harden GlassCard and inject btn-elite utility for top-notch aesthetic
- `style`: Align frontend with elite design spec (Image 1)
- `style`: Reduce hero headline thickness for better readability

### Chore
- `chore(deps)`: Update lockfile after adding `@types/helmet`
- `chore(deps)`: Add `@types/helmet` to resolve TypeScript editor errors
- `chore(middleware)`: Cleanup debug logs and unused imports

### Refactor
- `refactor(proxy)`: Unify all proxy configurations and cleanup redundant logic

### Debug
- `debug(middleware)`: Add path logging to troubleshoot rate limit bypass
- `debug`: Enhance API error reporting and client-side validation

---

## [2026-04-22]

### Fixed
- Fix: Correct invalid import in vendors API
- Fix: Add missing attributes to dummy torch class
- Fix: Provide dummy torch and nn fallbacks for environments without PyTorch
- Fix: Add missing Vendor and SystemConnection imports in compliance API
- `fix`: Comprehensive semantic realignment and missing route registration across compliance and shadow-ai modules
- `fix`: Resolve python-backend build issues by expanding context
- `fix`: Restore missing go.sum

### Features
- `feat`: Hardening AlphaHecta Semantic Architecture and UI/UX Remediation

### Refactor
- `refactor`: Complete Shadow AI routing — add handler to router

### Hardening
- Consolidate Go interfaces and fix compliance routing
- Full AlphaHecta semantic alignment, API routing consolidation, and branding purge

---

## [2026-04-19]

### Fixed
- `fix`: Align semantic types between frontend and backend

---

## [2026-04-17]

### Features
- `feat(api)`: Implement Shadow AI detection endpoints

### Fixed
- `fix(go)`: Complete Shadow AI routing — add handler to router

### Hardening
- Finalized Workforce Optimization & Compliance integration

### Tests
- `test(e2e)`: Fix Shadow AI API tests and skip flaky component tests
- `test(phase-06)`: Complete E2E test fix, add plan summaries

### Documentation
- `docs(phase-06)`: Update 06-03 summary with test fixes status

---

## [2026-04-14]

### Features
- `feat`: Phase 2 ultra-hardening — resilience and debt retirement
- `feat`: Finalize backend modularization and harden gateway architecture
- `feat`: Refactor Go API Gateway to eliminate blind proxying and add proper domain-specific handlers
- `feat`: Comprehensive E2E testing for AgentOps, Compliance, and Workforce

### Fixed
- `fix(go)`: Corrected endpoint mismatch for live compliance metrics
- `fix`: Remove unused imports from governance.go
- `fix`: Temporarily skip Go database migrations to avoid schema conflicts with Python backend
- `fix`: Use correct container name for Go API Gateway database connection
- `fix`: Use correct container names in docker-compose for DB and Redis
- `fix`: Use correct container name for database connection

---

## [2026-04-13]

### Fixed
- `fix(02)`: WR-05 safe type assertion for LLM
- `fix(02)`: WR-04 replace confirm with AlertDialog
- `fix(02)`: WR-01 proper error handling in proxy body binding
- `fix(02)`: CR-02 add recursion guard in AuthContext login
- `fix(02)`: CR-01 add null check before claims access in Logout
- `fix`: Proxy port from 8080 → 7001, hardcode remote backend target

---

## [2026-04-12]

### Features
- Implement missing compliance endpoints (bias scan, enterprise audits, live metrics)

### Fixed
- `fix`: Final duplicate compliance key removal
- `fix`: Remove duplicate compliance API keys

---

## [2026-04-11]

### Features
- `feat`: Complete real implementation of all endpoints, remove mock/stub data
- `feat`: Sync backend-frontend implementations
- `feat`: Harden database initialization and improve API gateway error reporting
- `feat`: Implement per-agent LLM keys and fix Intelligence Hub tab duplication

### Fixed
- `fix(python)`: Make database initialization resilient to DuplicateTable errors
- `fix(python)`: Correct workforce model imports to resolve backend crash
- `fix(workforce)`: Resolve broken relative section imports
- `fix(deploy)`: Force Vite to bind to 0.0.0.0 for external connectivity
- `fix(ui)`: Resolve tab collisions in IntelligenceHub and Deepfake Defense
- Fix: Duplicate key in api.ts

### Chore
- `chore`: Massive sync of AgentOps, Workforce, and Compliance modules with production hardening

---

## [2026-04-10]

### Features
- `feat`: Phase 7 — Production Hardening, Multi-stage Docker Architecture, and Deployment Orchestration

### Fixed
- Fix: Duplicate key in api.ts

---

## [2026-04-09]

### Documentation
- `docs(phase-6)`: Add plans for biometrics and E2E testing
- `docs(06-01)`: Add phase 6 plan 1 summary
- `docs(phase-6)`: Add research and plan for Global Security & Performance Audit

### Features
- `feat(06-01)`: Add performance benchmark script

---

## [2026-04-08]

### Hardening
- Hardened AlphaWorkforce and AgentOps modules: Persistent state, SQLModel fixes, Go/Python alignment
- Hardened workforce and compliance 'real-first' transition

### Fixed
- Fix deployment issues: add cairo system deps and simplify requirements to avoid conflicts
- Fix pydantic-settings version conflict for langchain compatibility
- Fix pydantic version conflict for hermes-agent compatibility
- Fix httpx version conflict for hermes-agent compatibility
- Fix dependency conflicts and update workforce UI
- Fix frontend errors: add QueryClientProvider and correct getEarningsData method call
- `fix`: Update hermes-agent to valid release tag v2026.4.8

---

## [2026-04-07]

### Features
- `feat`: Tri-Variant Products Frontend Redesign with 3-Perspective Switcher

### Fixed
- Fix: streamConfig ReferenceError in AlphaAgentOps and general UI/Auth updates
- `fix`: Add debug logging for user state changes and fix context duplicates
- `fix`: Use useEffect to watch auth state changes and auto-redirect
- `fix`: Add auth state checking before redirect and better debugging
- `fix`: Add form validation bypass and debug logging for login form
- `fix`: Add more debugging to handleLogin function
- `fix`: Handle snake_case auth response fields from backend
- `fix`: Add detailed auth logging for debugging login flow
- `fix`: Only fetch platform stats when authenticated
- `fix`: Add logging to login handler for debugging
- `fix`: Add git to python Dockerfile for hermes-agent install
- `fix`: Auth login — properly parse JSONB allowed_products in Go backend

---

## [2026-04-04]

### Hardening
- Hardening Alpha Platform: Fixed missing agent list route and explicitly defined SSO scopes
- Hardening Alpha Platform: Added required OAuth2 scopes to SSO providers to fix login error
- Hardening Alpha Platform: Fixed AttributeError in SSO redirect by correctly extracting Location header
- Hardening Alpha Platform: Adding SSO debug logs to investigate redirect failure
- Hardening Alpha Platform: Coupled administrative ops to backend, removed simulated tags, and replaced random data with stable state

### Fixed
- `fix`: Add itsdangerous dependency for SessionMiddleware
- `fix`: Add SessionMiddleware for SSO and fix invalid UUIDs in seed data
- `fix`: Restore missing imports in main.py
- `fix`: Resolve critical Python backend startup crashes
- `fix`: Add missing typing imports in billing service
- `fix`: Add missing logging import in billing service

### Features
- `feat`: Production-grade hardening of Alpha Platform (Real-First Architecture)

---

## [2026-04-03]

### Fixed
- Fix: Add missing AgentSettingsDialog component
- Fix duplicate handleSyncNow declaration in AlphaAgentOps

### Features
- Add VentureUniversalTemplate page and update AlphaWorkforce/AlphaAIActCompliance/AlphaAgentOps

---

## [2026-04-02]

### Fixed
- Fix AlphaAI linting and add compliance stats API/route
- Fix missing getInvoices on workforce API and deepfake SaveFile error
- Fix SSO NameError and register Apple provider
- Eliminated remaining router collisions in agent-ops group
- Fix API Gateway route collision and SSO login auth lockout
- Fix AlphaDeepfakeDefense error and refine typography

### Hardening
- Hardening: Full audit for mock data and production readiness check

---

## [2026-04-01]

### Fixed
- `fix`: Remove duplicate handleProvisionClient function
- `fix`: Remove duplicate isProvisioningClient state declaration
- `fix`: Guard llmConfigs state to always be an array
- `fix`: Wrap adjacent JSX buttons in fragment for conditional rendering
- `fix`: Stop streaming metrics polling after 3 consecutive failures

### Features
- `feat`: Implement real backend APIs replacing all mock/stub/dummy implementations
- `feat`: Hardened AgentOps Sentinel UI with Real-First production architecture

---

## [2026-03-31]

### Style
- `style`: SaaS-grade typography modernization and Inter + JetBrains Mono integration
- `style`: Apply premium high-visual text design typography

### Features
- `feat`: Complete Real-First hardening of AgentOps Sentinel and AI Compliance Hub
- `feat`: Implement Real-First architecture for AI Compliance Hub gaps
- `feat`: Implement dynamic governance and advanced analytics UI gaps

### Fixed
- `fix(compliance)`: Harden AI Compliance Hub and AgentOps Sentinel dashboards with Real-First architecture
- `fix(sentinel)`: Resolve E2E pipeline failures by fixing backend path, runtime errors, and test locators
- `fix(ci)`: Update Go version to 1.25.1 to match go.mod
- Fix: Add missing AgentSettingsDialog component
- Fix gap analysis

---

## [2026-03-30]

### Fixed
- `fix`: Align AgentOps Sentinel and AI Compliance Hub to 100% Real-First architecture
- `fix(agent-ops)`: Align frontend and gateway routing for Phase 5 stabilization
- `fix`: Finalize alertconfig database schema migration for action/priority
- `fix`: Resolve Go routing panic and Python database schema mismatch
- `fix`: Resolve production 404/500/502 routing errors by aligning backends with Phase 5 frontend
- `fix`: Resolve api-gateway route panic and add missing billing env vars

### Features
- `feat`: Phase 5 REAL-FIRST production hardening — 100% backend connectivity
- `feat`: Complete Real-First hardening of AgentOps Sentinel and AI Compliance Hub

---

## [2026-03-27]

### Fixed
- `fix`: Replace dummy/simulation/placeholder content with production-ready implementations
- Fix: resolve 404 after login by redirecting /dashboard to /products/agent-ops
- `fix`: Add redirects for legacy and common product paths to resolve 404s
- `fix`: Add missing BaseModel and datetime imports in extended.py
- `fix`: Add missing Session import in extended.py
- `fix`: Use modern 'docker compose' in Jenkinsfile
- `fix`: Resolve budget-rules-tab test timeout and align with current UI

### Features
- `feat`: Implement product-level access control and fix Jenkinsfile branch
- `feat`: Complete backend integration for Alpha products
- `feat`: Complete real implementation of all Alpha products
- `feat`: Complete AlphaAI platform transformation — 100% real implementations

### CI
- `ci`: Add Deploy to Production stage to Jenkinsfile

---

## [2026-03-26]

### Features
- `feat(sso)`: Expanded OIDC provider support with OneLogin, Ping, GitHub, GitLab, Salesforce, and Custom OIDC Connector with simulation fallback
- `feat`: Complete global sim-to-real transition across all modules (SSO, CashClaw, Compliance, Deepfake)

### Fixed
- `fix(sso)`: Remove redundant `/api/v1` prefix in main.py to align with Gateway proxying
- `fix(sso)`: Move SSO routes to v1 group to resolve 401 errors in demo mode
- `fix(sso)`: Correct indentation of SSOService and add `__init__`
- `fix(sso)`: Refactor to use extendedApi for SSO provider connections

---

## [2026-03-25]

### Features
- `feat(sso)`: Implement functional multi-provider connection for Azure, Google, and Okta
- `feat`: Implement HIPAA/SOX audits and On-Prem manifest logic

### Fixed
- `fix(api-gateway)`: Add POST route for SSO configuration
- `fix(go)`: Implement ProxyToPython and add io import for generic forwarding
- `fix(api)`: Bridge missing routes and add frontend auth guards to eliminate 404/401 errors
- `fix`: Align AgentStatus with DB enum and update billing_service
- `fix(web)`: Prevent protocol-relative URLs by setting empty base API_URL
- `fix(web)`: Standardize relative api routing and refactor biometric verify
- `fix(web)`: Add defensive guards and missing mock data for deepfake challenge
- `fix(web)`: Set up vite proxy and refactor api calls for remote connectivity
- `fix(gateway)`: Update Go version to 1.24 in Dockerfile
- `fix(client)`: Switched to node:20-bookworm-slim for remote build stability
- `fix(client)`: Include patches in Dockerfile for pnpm install
- `fix(client)`: Corrected Dockerfile base image to official Playwright Ubuntu

---

## [2026-03-24]

### Features
- `feat`: Implement tiered LLM and optimized Dockerfile
- `feat`: Phase 5 & 6 — Real Backend Operational Layer & AI Feature Integration (SSO, CashClaw, Compliance Hub, Deepfake Defense)
- `feat`: Complete Phase 5 Backend Real Implementations
- `feat`: Implement Real API to Mock Failover fallback in api.ts
- `feat`: Complete UI/UX expansion mock integrations and fix TS compilation errors

### Fixed
- `fix`: Remove duplicate Budget tab in AlphaAgentOps
- `fix`: Add ddgs to python backend requirements

---

## [2026-03-23]

### Features
- `feat(sentinel)`: Implement real-world functionality for AI Act Compliance and AgentOps
- `feat`: Refactor Alpha Deepfake Defense to use real backend data and persistent threat models

### Fixed
- Fix NameError in deepfake.py: add missing typing imports (Dict, Any)
- Implement database connection retry logic in Go and Python backends for better Docker resilience

---

## [2026-03-22]

### Fixed
- `fix`: Align AgentOps Sentinel and AI Compliance Hub to 100% Real-First architecture
- `fix(sentinel)`: Resolve E2E pipeline failures by fixing backend path, runtime errors, and test locators
- Fix: Add missing AgentSettingsDialog component

### Features
- `feat`: Complete AlphaAI platform transformation — 100% real implementations
- `feat`: Implement real-world functionality for AI Act Compliance and AgentOps
- `feat`: Implement dynamic governance and advanced analytics UI gaps

---

## [2026-03-21]

### Features
- Initial platform architecture and Real-First hardening
- SSO integration foundations
- Docker multi-stage architecture setup

---

## Summary

| Category | Total Commits |
|----------|:---:|
| Features | ~65 |
| Bug Fixes | ~95 |
| Style/UI | ~8 |
| Refactors | ~6 |
| Hardening | ~12 |
| Documentation | ~6 |
| CI/Deploy | ~5 |
| Tests | ~3 |
| **Total** | **200** |

### Key Milestones

1. **Real-First Architecture** (Mar 21–31): Replaced all mock/stub data with real backend implementations
2. **Phase 5–7 Hardening** (Apr 1–14): Production-grade Docker, routing, and E2E testing
3. **Elite Design System** (Apr 22–23): AlphaHecta v1.0 → v1.1 UI overhaul
4. **Local-First AI** (Apr 23): Ollama integration for Paperclip/Hermes intelligence modules
