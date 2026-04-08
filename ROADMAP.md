# Roadmap: AlphaAI Real-First Transition

## Milestone 1: Platform Hardening (Current)
Finalize the transition to backend-backed state across all core products.

### Phase 1: GSD Initialization (Complete)
- [x] Create PROJECT.md
- [x] Create ROADMAP.md
- [x] Initialize GSD state (.planning/STATE.md)

### Phase 2: AlphaWorkforce Hardening (Complete)
- [x] Replace mock agent roster with PostgreSQL-backed state.
- [x] Implement fiscal governance persistence.
- [x] Audit `AlphaWorkforce.tsx` for simulation fallbacks.

### Phase 3: AlphaAgentOps & Sentinel Hardening (Complete)
- [x] Align Go/Python models for snake_case/camelCase consistency.
- [x] Finalize the Sentinel Guard real-time monitoring persistence.
- [x] Implement robust error handling for API Gateway proxies.

### Phase 4: AI Compliance Hub Hardening (Complete)
- [x] Migrate static risk assessment checklists to database.
- [x] Harden the automated documentation generation logic.
- [x] Verify through compliance audit dashboard.

### Phase 5: DenialDefense & Marketplace Hardening
- [ ] Implement the "Phase 8" items for the Claims Engine.
- [ ] Finalize the gated Marketplace enrollment logic with database validation.

### Phase 6: Global Security & Performance Audit
- [ ] Validate subagent performance (latencies < 500ms).
- [ ] Final verify Cancellable Biometrics & Panic Word flow.
- [ ] E2E Test Suite Pass (100% success).

### Phase 7: Production Deployment
- [ ] Deploy to production infrastructure (149.104.110.122).
- [ ] Final health check and smoke tests.
