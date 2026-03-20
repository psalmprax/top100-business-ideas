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

## 🤖 Multi-Provider LLM Router

### Supported Providers
| Provider | Model | Status | Priority |
|----------|-------|--------|----------|
| OpenAI | GPT-4o, GPT-4o-mini | Default | 1 |
| Anthropic | Claude 3.5 Sonnet | Secondary | 2 |
| DeepSeek | DeepSeek V3 | Testing | 3 |
| Google Gemini | Gemini 1.5 Pro | Testing | 4 |
| Cohere | Command R+ | Beta | 5 |
| Mistral | Mistral Large | Beta | 6 |

### Failover Configuration
```yaml
llm_providers:
  primary: openai
  failover_chain:
    - provider: anthropic
      trigger: "openai_error OR rate_limit"
    - provider: deepseek
      trigger: "cost_optimization OR anthropic_error"
    - provider: google
      trigger: "multimodal_request"
```

### Performance Testing Mode
```yaml
performance_testing:
  enabled: true
  round_robin: true
  metrics: [latency, accuracy, cost, tokens]
  auto_select_best: true
  update_interval: hourly
```

### Provider Selection API
```
GET  /api/v1/providers              # List all providers and status
POST /api/v1/providers/:id/test   # Run benchmark test
GET  /api/v1/providers/recommend   # Get best provider for task
POST /api/v1/providers/failover    # Trigger manual failover
```

---

## 📈 Scaling Strategy

### Low-Latency Guarantee
| Target | Strategy |
|--------|----------|
| < 15ms Overhead | The Rust proxy runs globally via AWS Global Accelerator. It pulls compiled rule-sets into local memory so evaluation requires no DB lookups. |
| 10k RPS | Auto-scaling Rust containers (ECS/Fargate) connected to managed Redis clusters. |
