# Codebase Concerns

**Analysis Date:** 2026-04-08

## Tech Debt

**Server proxy configuration:**

- Issue: All proxy routes defined in a single large file with repetitive code
- Files: `server/index.ts`
- Impact: Difficult to maintain, add new routes, or modify existing ones
- Fix approach: Extract proxy configurations into separate modules or configuration files

**Mixed backend languages:**

- Issue: Node.js proxy, Go backend (binary only), Python backend (binary only)
- Files: `server/index.ts`, `server/go/main`, `server/python/app`
- Impact: Inconsistent development experience, harder debugging
- Fix approach: Standardize on one backend language or provide source code for all backends

## Known Bugs

**No known bugs identified in current codebase**

## Security Considerations

**CORS configuration:**

- Risk: Wildcard CORS origin allows any domain to make requests
- Files: `server/index.ts`
- Current mitigation: Can be overridden with env var, but defaults to insecure
- Recommendations: Set specific allowed origins in production, validate env var

**Rate limiting:**

- Risk: Low limits (100 req/15min for API, 20 for ML) may not protect against abuse
- Files: `server/index.ts`
- Current mitigation: Basic rate limiting implemented
- Recommendations: Implement more granular limits, add IP-based blocking

**No authentication on proxy:**

- Risk: All routes proxy without checking authentication
- Files: `server/index.ts`
- Current mitigation: Assumes backends handle auth
- Recommendations: Add JWT validation or API key checks at proxy level

## Performance Bottlenecks

**Proxy overhead:**

- Problem: Every API request goes through Node.js proxy to Go/Python backends
- Files: `server/index.ts`
- Cause: Architecture requires all traffic to route through proxy
- Improvement path: Direct client-to-backend communication where possible, or optimize proxy

**No caching:**

- Problem: No response caching for API calls
- Files: `server/index.ts`
- Cause: All requests proxied without caching layer
- Improvement path: Add Redis or in-memory caching for frequently accessed data

**Static file serving:**

- Problem: Static files served from Express without optimization
- Files: `server/index.ts`
- Cause: Basic static middleware without CDN or advanced caching
- Improvement path: Use CDN for static assets, implement proper cache headers

## Fragile Areas

**Backend dependency:**

- Files: `server/index.ts`
- Why fragile: Server fails if Go/Python backends are down
- Safe modification: Add health checks, circuit breakers
- Test coverage: No health check tests visible

**Environment configuration:**

- Files: `.env`, `client/.env`, `server/python/.env`, `server/go/.env`
- Why fragile: Multiple env files, complex setup
- Safe modification: Use single config management system
- Test coverage: No config validation tests

**Venture directories:**

- Files: `ventures/*/`
- Why fragile: Empty directories, no code - may indicate incomplete implementation
- Safe modification: Implement ventures or remove stubs
- Test coverage: None

## Scaling Limits

**Single Node.js process:**

- Current capacity: Single threaded, limited by hardware
- Limit: ~1000 concurrent connections
- Scaling path: Use PM2 clustering or container orchestration

**Memory usage:**

- Current capacity: No monitoring visible
- Limit: Node.js heap limits
- Scaling path: Add memory monitoring, optimize large data handling

**Database connections:**

- Current capacity: Not visible in code
- Limit: Depends on backend configs
- Scaling path: Connection pooling, read replicas

## Dependencies at Risk

**Axios versions mismatch:**

- Risk: Main package.json uses ^1.12.0, SDK uses ^1.6.0
- Impact: Inconsistent behavior, potential conflicts
- Migration plan: Update SDK to match main version

**React 19:**

- Risk: Using React 19.2.1 which is cutting-edge
- Impact: Potential breaking changes, fewer resources
- Migration plan: Monitor stability, have rollback plan

**Multiple package managers:**

- Risk: pnpm specified but may conflict with other tools
- Impact: Dependency resolution issues
- Migration plan: Standardize on one package manager

## Missing Critical Features

**Error monitoring:**

- Problem: Basic console.error, no error tracking service
- Blocks: Production debugging, issue tracking

**Logging system:**

- Problem: Console logs only, no structured logging
- Blocks: Log aggregation, analysis

**Health checks:**

- Problem: Basic /api/status, no detailed health endpoints
- Blocks: Load balancer health checks, monitoring

## Test Coverage Gaps

**Unit tests:**

- What's not tested: Business logic in hooks, utils, API functions
- Files: `client/src/hooks/`, `client/src/lib/`
- Risk: Logic bugs undetected
- Priority: High

**Integration tests:**

- What's not tested: API integrations, backend communication
- Files: `client/src/lib/api.ts`
- Risk: Integration failures in production
- Priority: Medium

**Backend tests:**

- What's not tested: Proxy logic, error handling
- Files: `server/index.ts`
- Risk: Server failures undetected
- Priority: High

---

_Concerns audit: 2026-04-08_
