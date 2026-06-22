# Testing Strategy

**Analysis Date:** 2026-04-11

## Overview

The `top100-business-ideas` project employs a multi-tiered testing strategy encompassing unit, integration, and end-to-end (E2E) tests across its polyglot codebase.

## Frontend Testing (TypeScript)

**Unit & Integration:**

- **Framework**: Vitest.
- **Location**: Co-located with code or in `client/src/tests/`.
- **Command**: `pnpm test`.
- **Scope**: Utility functions, React hooks, and isolated component logic.

**End-to-End (E2E):**

- **Framework**: Playwright.
- **Location**: `client/src/tests/`.
- **Config**: `playwright.config.ts`.
- **Command**: `pnpm test:e2e`.
- **Base URL**: `http://149.104.110.122:7000` (Remote) or `http://localhost:7000` (Local).
- **Scope**: Critical user journeys (Login, Compliance Assessment, Deepfake Upload, Agent Orchestration).

## Backend Testing (Go)

- **Framework**: Standard `testing` package with `testify`.
- **Command**: `go test ./...` in `server/go/`.
- **Scope**: Auth handlers, billing logic, and internal SDK integrations.

## Backend Testing (Python)

- **Framework**: `pytest`.
- **Command**: `pytest` in `server/python/`.
- **Scope**: ML inference service verification, deepfake detection accuracy, and FastAPI route integrity.

## Static Analysis & Quality

- **Linting**: ESLint (`pnpm lint`) for TypeScript.
- **Formatting**: Prettier (`pnpm format`).
- **Type Checking**: TypeScript `tsc --noEmit` (`pnpm check`).

## CI/CD Integration

- **GitHub Actions**: `.github/workflows/ci-cd.yml` runs linting, type checks, and Vitest on every push.
- **Jenkins**: `jenkins-docker-compose.yml` used for full infrastructure integration tests.
- **E2E Environment**: `docker-compose.e2e.yml` spins up the entire stack including Postgres and Redis for isolated Playwright runs.

## Manual Verification

- **Local Discovery**: `pnpm dev` for rapid UI iteration.
- **Inference Verification**: Specific scripts like `tests/test-inference.py` are used to calibrate ML models without running the full web stack.

---

_Testing analysis: 2026-04-11_
