# Coding Conventions

**Analysis Date:** 2026-04-11

## General Principles

1. **Polyglot Monorepo**: Maintain consistency across TypeScript, Go, and Python.
2. **Unified Entry**: All external traffic must pass through the Express Gateway (`server/index.ts`).
3. **Hardened Resilience**: Implement "Real-First" failure handling (fallbacks/mocks) for all external service dependencies.
4. **Agent-Centric**: Use the standard AgentOps SDK for all AI agent activities.

## TypeScript / Frontend (React 19)

**Naming:**

- **Components**: PascalCase (e.g., `AlphaDeepfakeDefense.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`).
- **Types/Interfaces**: PascalCase (e.g., `interface UserData {}`).
- **Variables/Constants**: camelCase for variables, SCREAMING_SNAKE_CASE for constants.

**Patterns:**

- **Component Structure**: Functional components with Type definitions at the top.
- **Styling**: Tailwind CSS 4 utility classes (avoid ad-hoc CSS).
- **State**: TanStack Query for server state, React Context for global UI state.
- **API**: Centralized in `client/src/lib/api.ts` with gated `apiRequest` helpers.

## Go Backend

**Naming:**

- **Packages**: lowercase, single word.
- **Functions/Structs**: PascalCase for exported (public), camelCase for unexported (private).
- **Receivers**: Short (1-3 letters) related to the type (e.g., `(h *AuthHandler)`).

**Patterns:**

- **Errors**: Return errors as the last value; never ignore them.
- **Handlers**: Structured as `Handler -> Service -> Repository`.
- **Concurrency**: Use Goroutines for non-blocking tasks (like background billing audits).

## Python Backend (FastAPI)

**Naming:**

- **Modules/Files**: snake_case (e.g., `deepfake_detector.py`).
- **Functions/Variables**: snake_case.
- **Classes**: PascalCase (e.g., `class DeepfakeResult(SQLModel):`).

**Patterns:**

- **Validation**: Use Pydantic/SQLModel for all request/response schemas.
- **Dependency Injection**: Use FastAPI `Depends()` for DB sessions and auth verification.
- **Type Hinting**: Mandatory for all function signatures and complex variables.

## Documentation & Planning

- **Codebase Mapping**: Living documents in `.planning/codebase/`.
- **Phase Mapping**: Incremental updates in `.planning/phases/`.
- **Git Commits**: Prefixed with task or phase (e.g., `phase-06: correct lbp bit ordering`).

## Testing Conventions

- **Frontend**: Vitest for utility logic; Playwright for user flows.
- **Backend (Go)**: Go's standard `testing` package with `stretchr/testify`.
- **Backend (Python)**: `pytest` with `httpx` for async API testing.

---

_Conventions analysis: 2026-04-11_
