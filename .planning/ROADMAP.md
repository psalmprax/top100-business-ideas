# Roadmap: AlphaAI Real-First Transition

## Milestone 1: Platform Hardening (Current)

Finalize the transition to backend-backed state across all core products.

### Phase 1: GSD Initialization (Complete)

- [x] Create PROJECT.md
- [x] Create ROADMAP.md
- [x] Initialize GSD state (.planning/STATE.md)

### Phase 2: AlphaWorkforce Hardening

- [ ] Replace mock agent roster with PostgreSQL-backed state.
- [ ] Implement fiscal governance persistence.
- [ ] Audit `AlphaWorkforce.tsx` for simulation fallbacks.

### Phase 3: AlphaAgentOps & Sentinel Hardening

- [ ] Align Go/Python models for snake_case/camelCase consistency.
- [ ] Finalize the Sentinel Guard real-time monitoring persistence.
- [ ] Implement robust error handling for API Gateway proxies.

### Phase 4: AI Compliance Hub Hardening

- [ ] Migrate static risk assessment checklists to database.
- [ ] Finalize document generation with real backend storage.

### Phase 5: DenialDefense & Marketplace Hardening (Complete)

- [x] Implement the "Phase 8" items for the Claims Engine.
- [x] Finalize the gated Marketplace enrollment logic with database validation.

### Phase 6: Global Security & Performance Audit

- **Plans:** 3 plans
- [ ] 06-01-PLAN.md — Performance Latency Validation (COMPLETE)
- [ ] 06-02-PLAN.md — Biometrics & Panic Word (NEW)
- [ ] 06-03-PLAN.md — E2E Test Suite Pass (NEW)

**Requirements:**

- R6.1: Validate subagent performance (latencies < 500ms).
- R6.2: Final verify Cancellable Biometrics & Panic Word flow.
- R6.3: E2E Test Suite Pass (100% success).

### Phase 7: Production Deployment

- [ ] Deploy to production infrastructure (149.104.110.122).
- [ ] Final health check and smoke tests.
