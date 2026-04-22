# AlphaHecta Hardening & Quality Standard Prompt

Use this prompt to audit and upgrade any repository to "Top-Notch" production standards.

---

## 🚀 The Prompt

> **Task**: Perform a "Real-First" production hardening audit of this repository. Evaluate and implement the following architecture-grade patterns to transition the project from a prototype to a reliable enterprise system.
>
> ### 1. Backend Hardening (Go/Node/Python)
> - **Fail-Fast Configuration**: Remove all development defaults for critical secrets (JWT_SECRET, DATABASE_URL). The application must crash at startup if these are missing.
> - **End-to-End Tracing**: Implement a global `RequestID` middleware. Ensure the `X-Request-ID` header is propagated to all downstream services and logged in every structured log entry.
> - **Resilience Orchestration**: Wrap all external API/Proxy calls in a **Circuit Breaker** with an Exponential Backoff retry policy.
> - **High-Performance Async**: Complete the migration of all blocking I/O to a fully asynchronous architecture (e.g., `AsyncSession` in Python, goroutines in Go). Await all database commits and refreshes.
> - **Database Integrity**: Enforce connection pooling (e.g., pgxpool) and use DSN injection for all repository layers.
>
> ### 2. Observability & Security
> - **Gateway-Synced Auth**: Enforce mandatory JWT verification on all downstream internal services. Routers must not be wide open behind the proxy.
> - **Fault Persistence**: Create a global exception handler that doesn't just log to stderr, but persists catastrophic faults to a `SelfHealingAudit` table (storing path, method, and traceback).
> - **Dependency Inventory**: At startup, verify the existence of mission-critical libraries (e.g., ML models, payment SDKs) and log their status to a health dashboard.
> - **Structured Logging**: Replace all `fmt.Println` or `print()` with structured JSON logging (e.g., zerolog, pino, structlog).
>
> ### 3. Frontend & UX Wiring
> - **Recovery-First UX**: Wire the API client to a global listener. If a service drops, trigger a reactive "Autonomous Mode" or "Sandbox Mode" in the UI to manage user expectations.
> - **Optimistic Interactivity**: Implement optimistic updates for chat/messaging and `toast.promise` for long-running deployments.
> - **Premium Aesthetics**: Use **OKLCH** color spaces for uniform gradients, implement **Glassmorphism** with backdrop blurs, and add a subtle **SVG Noise Overlay** for high-end organic texture.
>
> ### 4. Security Posture
> - **Strict Headers**: Globally inject HSTS (1 year), Content-Security-Policy (strict), X-Content-Type-Options (nosniff), and X-Frame-Options (DENY).
> - **Normalize Normalization**: Centralize endpoint prefixing (e.g., `/api/v1`) in the API client layer rather than hardcoding it in components.
