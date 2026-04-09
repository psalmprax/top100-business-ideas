# AlphaAI Requirements - Milestone 1: Platform Hardening

**Generated:** 2026-04-09  
**Source:** GSD Workflow - New Project Initialization (Auto Mode)

---

## Critical Requirements (Blocking Issues)

### R1: Fix Frontend Build Failure

- **Priority:** CRITICAL
- **Issue:** Duplicate `Copy` import in AlphaAgentOps.tsx causes build failure
- **Verification:** `npm run build` completes successfully

### R2: Fix CORS Security Vulnerability

- **Priority:** CRITICAL
- **Issue:** Python backend uses wildcard CORS (`allow_origins=["*"]`)
- **Verification:** CORS restricted to known origins

---

## Phase Requirements

### Phase 2: AlphaWorkforce Hardening

- R2.1: Replace mock agent roster with PostgreSQL-backed state
- R2.2: Implement fiscal governance persistence
- R2.3: Audit AlphaWorkforce.tsx for simulation fallbacks

### Phase 3: AlphaAgentOps & Sentinel Hardening

- R3.1: Align Go/Python models for snake_case/camelCase consistency
- R3.2: Finalize Sentinel Guard real-time monitoring persistence
- R3.3: Implement robust error handling for API Gateway proxies

### Phase 4: AI Compliance Hub Hardening

- R4.1: Migrate static risk assessment checklists to database
- R4.2: Finalize document generation with real backend storage

### Phase 5: DenialDefense & Marketplace Hardening

- R5.1: Implement "Phase 8" items for Claims Engine
- R5.2: Finalize gated Marketplace enrollment logic with database validation

### Phase 6: Global Security & Performance Audit

- R6.1: Validate subagent performance (latencies < 500ms)
- R6.2: Final verify Cancellable Biometrics & Panic Word flow
- R6.3: E2E Test Suite Pass (100% success)

### Phase 7: Production Deployment

- R7.1: Deploy to production infrastructure
- R7.2: Final health check and smoke tests

---

## Non-Functional Requirements

- **Security:** No hardcoded secrets, CORS properly configured
- **Performance:** API responses < 500ms for subagent calls
- **Reliability:** Fallback to localStorage only when backend unreachable
- **Testing:** E2E tests must pass before production deployment

---

## Out of Scope

- New feature development beyond platform hardening
- AI model training or fine-tuning
- Mobile applications
