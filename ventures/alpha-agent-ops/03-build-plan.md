# Build Plan: Agentic Sentinel Infrastructure

## 🛠️ Tech Stack
- **Proxy Layer**: Rust (Axum) or Go for ultra-low latency. It must not add more than 10ms to the LLM round trip.
- **Database**: Redis for real-time token counting/rate limiting + PostgreSQL for long-term logs.
- **Agent Monitoring**: Sidecar pattern (connecting to the agent orchestrator via hooks).

## 📋 MVP Core Requirements
1.  **API Proxy**: Intercept all outgoing LLM calls from an agent.
2.  **Recursion Guard**: If the last 3 prompt-responses are 95% semantically identical, trigger a "Hard Pause" and alert the human-in-the-loop.
3.  **Cost Dashboard**: Visual breakdown of which specific agent step cost the most.

## 📦 Key Deliverables
- [ ] Lightweight Python SDK (`pip install agent-sentinel`).
- [ ] Central Control Dashboard (Web).
- [ ] Slack/Teams integration for "Budget Alerts."
