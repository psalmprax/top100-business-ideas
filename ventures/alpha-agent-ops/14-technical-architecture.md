# Technical Architecture: Agent Ops Sentinel

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
|                      CLIENT AGENT                           |
|  [ReAct Loop] / [LangChain] / [Custom Python Script]        |
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTPS request to API)
┌─────────────────────────────────────────────────────────────┐
|               SENTINEL PROXY (RUST/TOKIO)                   |
|  [Auth] → [Rate Limit] → [Semantic Cache (Redis)] → [Rules] |
└─────────────────────────────────────────────────────────────┘
  ↓ (Async Audit Log)                       ↓ (Forward if clean)
┌────────────┐                         ┌──────────────────────┐
|   Kafka    |                         |  OpenAI / Anthropic  |
└────────────┘                         └──────────────────────┘
  ↓ (Batch)
┌────────────┐                         ┌──────────────────────┐
| PostgreSQL |  ←  [Control Plane]  →  |   Web Dashboard      |
| (Timestream)|     (Node.js/Next)      |   (Next.js/React)    |
└────────────┘                         └──────────────────────┘
```

---

## 🔧 Tech Stack

### Backend (Data Plane - The Proxy)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Proxy Core | Rust (Axum/Tokio) | Guaranteed memory safety, predictable sub-1ms tail latency. |
| Cache | Redis (ElastiCache) | Semantic vector caching to prevent duplicate LLM calls. |
| Message Bus| Apache Kafka | Fire-and-forget audit logging so the proxy never blocks waiting for DB writes. |

### Backend (Control Plane - The Dashboard)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API | Node.js (NestJS) | Fast iteration for CRUD operations (managing rules, teams). |
| Database | PostgreSQL | Relational data for users, teams, and billing. |
| Metrics | ClickHouse or TimescaleDB| Trillions of proxy log rows for the analytics dashboard. |

### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Web Framework | Next.js 14 | App router, Server components. |
| Styling | Tailwind CSS + Shadcn | Clean, developer-focused aesthetic (like Vercel). |
| Charts | Tremor.so | Beautiful, low-effort dashboard metrics. |

---

## 🔐 Security Architecture

### "Man-in-the-Middle" Safety
| Measure | Implementation |
|---------|---------------|
| Zero Payload Storage | By default, Sentinel hashes the prompt in memory, evaluates heuristics, and drops the payload. Logs only contain metadata (Tokens: 450, Result: Passed). |
| PII Redaction | Opt-in Regex/NLP filtering runs at the edge *before* sending to OpenAI. |
| Key Vaulting | User's provider API keys (OpenAI keys) are encrypted utilizing AWS KMS / Hashicorp Vault. Sentinel proxies the request and injects the key serverside. |

---

## 📊 API Design

### Proxy Endpoint
```
POST   https://proxy.agentops.com/v1/chat/completions
Headers:
  Authorization: Bearer <SENTINEL_API_KEY>
  X-Target-Provider: openai
```

### Control Plane REST
```
POST   /api/v1/rules                # Create a loop-prevention rule
GET    /api/v1/agents/:id/metrics   # Get burn-rate dashboard data
POST   /api/v1/human-in-loop/resume # Inject human feedback and unpause agent
```

---

## 📈 Scaling Strategy

### Low-Latency Guarantee
| Target | Strategy |
|--------|----------|
| < 15ms Overhead | The Rust proxy runs globally via AWS Global Accelerator. It pulls compiled rule-sets into local memory so evaluation requires no DB lookups. |
| 10k RPS | Auto-scaling Rust containers (ECS/Fargate) connected to managed Redis clusters. |
