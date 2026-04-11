# Risks & Concerns

**Analysis Date:** 2026-04-11

## Architecture Risks

- **Unified Proxy Bottleneck**: The Express Gateway (`server/index.ts`) is a single point of failure for the entire platform. If it crashes, all microservices (Go/Python) become inaccessible from the frontend.
- **Global Lock Latency**: The "Lockdown" mechanism relies on every proxied request passing through a single middleware. High traffic could increase latency for this critical security check.
- **WebSocket Fragmentation**: Using both native WebSockets (Go) and Socket.io (Node) increases client-side complexity and can leads to race conditions in UI state updates.

## Technical Debt

- **ML Dependency Issues**: Several mission-critical ML libraries (Torch, Transformers) are marked as "MISSING" or "MOCKED" in some environments to speed up container booting. This creates a drift between dev and production capabilities.
- **Manual Schema Sync**: There is no automated synchronization between Go/Python database models and TypeScript interfaces. This has already led to `affected_systems` vs `affectedSystems` naming discrepancies in `api.ts`.
- **Audio Truncation**: The deepfake detector silently truncates audio at 30 seconds. While warnings have been added, this remains a significant detection GAP for longer-form media.

## Security Concerns

- **JWT Secret Reliance**: Both the Go backend and Express Gateway must share the same `JWT_SECRET`. Improper rotation could invalidate all sessions or create authentication bypasses if secrets drift.
- **Admin Secret Exposure**: The Panic Word reset mechanism depends on a plaintext `adminSecret` check. This should be moved to a more robust RBAC or TOTP-based system.
- **LBP Sensitivity**: The CV fallback for deepfake detection (LBP texture analysis) is sensitive to bit-ordering and noise. Recent corrections have improved accuracy, but it remains a "heuristic" compared to deep model inference.

## Operational Concerns

- **SDK Versioning**: The internal SDKs in `packages/` are linked via pnpm workspaces. Changes to these packages affect multiple products simultaneously, requiring high-discipline regression testing.
- **Multi-Cloud Complexity**: Environment variables for Stripe, PayPal, and Google OIDC are spread across three different runtimes (Node, Go, Python), making configuration auditing difficult.

---

_Concerns audit: 2026-04-11_
