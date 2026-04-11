# Architecture

**Analysis Date:** 2026-04-11

## Architecture Overview

**Pattern:** Unified Monorepo with Polylithic Backend Services and a Unified Express Gateway.

The system uses a **BFF (Backend for Frontend)** pattern where an Express server acts as a Gateway/Proxy, providing a single entry point for the frontend while delegating specialized tasks to Go and Python microservices.

## Layers

**Express Gateway / Proxy Layer (`server/index.ts`):**
- **Purpose**: Unified entry point, Authentication (JWT), Rate Limiting, CORS, and Global System Lockdown.
- **Responsibilities**:
  - Validates JWT tokens for all `/api/v1` routes.
  - Proxies `/api/v1/auth`, `/api/v1/agents`, `/api/v1/billing`, `/api/v1/workforce` to the **Go Backend**.
  - Proxies `/api/v1/ml`, `/api/v1/deepfake`, `/api/v1/compliance`, `/api/v1/governance`, `/api/v1/venture` to the **Python Backend**.
  - Implements the "Global Lock" protocol to suspend all operations via a "Panic Word".
  - Serves static frontend assets in production.

**Go Backend Layer (`server/go/`):**
- **Purpose**: High-performance core business logic and state management.
- **Framework**: Gin (HTTP), pgx (PostgreSQL), go-redis (Redis).
- **Sub-sections**:
  - **Auth**: User registration, login, and session tracking.
  - **Agents**: AI agent orchestration and lifecycle management.
  - **Workforce**: Autonomous worker coordination.
  - **Billing**: Stripe and PayPal integrations for subscription management.

**Python ML Backend Layer (`server/python/`):**
- **Purpose**: Specialized AI/ML processing, compliance audits, and business intelligence.
- **Framework**: FastAPI (HTTP), SQLModel (ORM), PyTorch/Transformers (ML).
- **Sub-sections**:
  - **Deepfake Defense**: Image/Audio/Video deepfake detection pipeline.
  - **Compliance**: EU AI Act risk assessments and automated documentation.
  - **Governance**: AI policy enforcement and monitoring.
  - **Ventures**: Business intelligence and market gap analysis.

**Frontend Layer (`client/`):**
- **Purpose**: Interactive dashboard for managing AI agents, compliance, and venture discovery.
- **Framework**: React 19, Vite, Tailwind CSS 4, wouter (routing).
- **Pattern**: Perspective-based UI (V1-V3) for different user roles and abstraction levels.

## Data Flow

### Request Flow
1. **Frontend** sends HTTP/WS request to **Express Gateway** (:8080).
2. **Express Gateway** validates JWT (if required) and checks "Global Lock" status.
3. If valid, request is proxied to either **Go Backend** (:7001) or **Python Backend** (:7002).
4. **Target Backend** processes business logic, interacts with **PostgreSQL** or **Redis**.
5. Response is returned back through the Gateway to the Frontend.

### Real-time Flow
- **Express Gateway** hosts a Socket.io server for secondary notifications (e.g., security alerts).
- **Go Backend** handles primary real-time state via native WebSockets (:7001/ws).

## Key Abstractions

- **Global System Lock**: A cross-cutting security protocol managed by the Gateway that can instantly disable all mutation routes.
- **Perspective-Based UI**: A client-side abstraction allowing the same data to be viewed through different lens (AlphaAgentOps v1-v3).
- **Internal SDKs**: Specialized packages (`packages/`) that abstract complex compliance and monitoring logic into reusable libraries for both Go and Python.

## Entry Points

- `server/index.ts`: The "Brain" - orchestrates overall system availability and routing.
- `server/go/cmd/server/main.go`: The "Muscle" - handles heavy business logic and primary data state.
- `server/python/app/main.py`: The "Intelligence" - handles ML inference and complex business audits.

---

_Architecture analysis: 2026-04-11_
