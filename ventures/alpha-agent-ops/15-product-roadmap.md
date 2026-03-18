# Product Feature Roadmap: Agent Ops Sentinel

## 🎯 Feature Prioritization Framework

### RICE Scoring Example
| Feature | Reach | Impact | Confidence | Effort (Wks) | Score |
|--------|--------|-------------|-----------|-------|-------|
| Loop Breaker Proxy | 100% | 3.0 | 90% | 4 | **67.5** |
| Slack Pausing Integration | 60%| 2.5 | 80% | 2 | **60.0** |
| Semantic Caching | 40% | 2.0 | 70% | 4 | **14.0** |

---

## 📅 Feature Roadmap

### Q1: MVP (The "Loop Breaker")
**Focus**: Proving we can stop runaway costs without breaking the app.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Rust Proxy Core** | 🔄 In Progress | CTO | Basic pass-through router injecting OpenAI keys. |
| **Heuristics Engine** | 🟡 Planned | AI/Eng | Detect exact string repetition over window of 10 requests. |
| **Hard Budget Caps** | 🟡 Planned | Backend | Terminate connection with 429 if $5/day limit hit. |
| **Basic Dashboard** | ⚪ Planned | Frontend | Next.js dashboard showing token burn per agent. |

### Q2: Growth (The "Human in the Loop")
**Focus**: Graceful degradation and developer experience.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Slack Alerts** | ⚪ Backlog | Eng | Send interactive Slack block when loop detected. |
| **Session Resume** | ⚪ Backlog | Eng | Allow human to inject prompt via Slack and unfreeze agent. |
| **SDKs (Python/Ts)** | ⚪ Backlog | DevRel | 2-line drop-in replacements for standard OpenAI clients. |
| **Semantic Caching** | ⚪ Backlog | Backend | Redis vector cache for identical intent queries. |

### Q3: Scale (Enterprise Compliance)
**Focus**: The "Decision Ledger" for mid-market compliance.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Intent Summarization** | ⚪ Backlog | AI Eng | Async pipeline summarizing Chain of Thought blocks. |
| **SOC2 Dashboarding** | ⚪ Backlog | Frontend | Exportable PDF logs for auditors. |
| **PII Edge Masking** | ⚪ Backlog | Eng | Regex/NER anonymization before payload hits OpenAI. |

### Q4: Enterprise Operations
**Focus**: Deployment flexibility for massive clients.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **VPC Docker Image** | ⚪ Backlog | DevOps | Self-hosted data plane that syncs with cloud control plane. |
| **Multi-Agent Swarms** | ⚪ Backlog | Eng | Complex routing rules between specialized agents. |
| **SSO / SAML** | ⚪ Backlog | Security | Azure AD/Okta integration. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature | Description | Why |
|---------|-------------|-----|
| Reverse Proxy | Accepts standard OpenAI formatted HTTP requests. | Lowest friction onboarding for developers. |
| Token Counter | Accurately calculates tiktoken numbers. | Core billing requirement. |
| Dashboard Graph | Visualizes "Tokens Blocked/Saved". | Proves ROI instantly to the user. |
