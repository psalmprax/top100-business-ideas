# Testing Patterns

**Analysis Date:** 2026-04-08

## Test Framework

**Runner:**

- Vitest for unit/integration tests
- Playwright for E2E tests
- Config: playwright.config.ts in root

**Assertion Library:**

- Vitest expect
- Playwright expect

**Run Commands:**

```bash
npm run test              # Run Vitest tests
npm run test:ui           # Run Vitest with UI
npm run test:e2e          # Run Playwright E2E tests
npm run test:coverage     # Run Vitest with coverage
```

## Test File Organization

**Location:**

- E2E tests: `client/src/tests/` (e.g., `login.spec.ts`)
- Unit tests: `client/src/test/` (e.g., `e2e.test.ts` - misnamed)
- Python tests: `tests/` (e.g., `verify_agent_ops.py`)

**Naming:**

- E2E: `*.spec.ts`
- Unit: `*.test.ts`

**Structure:**

- Root tests/ for Python
- Client src/tests/ for Playwright
- Client src/test/ for Vitest

## Test Structure

**Suite Organization:**

```typescript
describe("Suite Name", () => {
  test("should do something", async () => {
    // test code
  });
});
```

**Patterns:**

- beforeAll/afterAll for setup/teardown
- Async tests with await
- Page object pattern in E2E

## Mocking

**Framework:** Not extensively used in observed tests

**Patterns:**

- Browser context mocking in E2E tests
- Manual stub creation

**What to Mock:**

- External APIs
- Browser APIs in unit tests

**What NOT to Mock:**

- Core business logic

## Fixtures and Factories

**Test Data:**

- Hardcoded test data in E2E tests
- Demo user objects for auth testing

**Location:**

- Inline in test files
- No dedicated fixtures directory

## Coverage

**Requirements:** No explicit target enforced

**View Coverage:**

```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**

- Limited, mainly E2E focused

**Integration Tests:**

- API proxy testing via E2E

**E2E Tests:**

- Playwright for full browser automation
- Covers navigation, form submission, page loads

## Common Patterns

**Async Testing:**

```typescript
test("async test", async () => {
  await page.goto(url);
  await expect(page.locator(selector)).toBeVisible();
});
```

**Error Testing:**

- Console error checking
- Network failure handling

---

_Testing analysis: 2026-04-08_
