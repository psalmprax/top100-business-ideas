# Coding Conventions

**Analysis Date:** 2026-04-08

## Naming Patterns

**Files:**

- Components: PascalCase (e.g., `ErrorBoundary.tsx`, `AuthContext.tsx`)
- Utilities: camelCase (e.g., `const.ts`)
- Tests: camelCase with .spec.ts or .test.ts

**Functions:**

- camelCase for regular functions and hooks (e.g., `checkAuth`, `useAuth`)

**Variables:**

- camelCase for state and variables (e.g., `user`, `isLoading`)

**Types:**

- PascalCase for interfaces and types (e.g., `AuthContextType`, `User`)

## Code Style

**Formatting:**

- Prettier used with custom config
- Semi-colons: true
- Single quotes: false
- Trailing comma: es5
- Print width: 80
- Tab width: 2 spaces
- Bracket spacing: true

**Linting:**

- ESLint with plugins: react-hooks, react-refresh
- No explicit config file found - using default rules
- Script: `eslint src --ext .ts,.tsx` (note: src path may be incorrect)

## Import Organization

**Order:**

1. React imports
2. Third-party libraries
3. Local imports with @/ alias
4. Relative imports

**Path Aliases:**

- `@/*`: resolves to `./client/src/*`
- `@shared/*`: resolves to `./shared/*`

## Error Handling

**Patterns:**

- Try/catch blocks in async functions
- Console.error for logging errors
- Error boundaries for React components
- Express error middleware

## Logging

**Framework:** console (console.log, console.error)

**Patterns:**

- Prefixed messages (e.g., `[Auth] checkAuth failed:`)
- Component stack logging in ErrorBoundary

## Comments

**When to Comment:**

- Complex logic or business rules
- TODO/FIXME not observed
- Configuration comments

**JSDoc/TSDoc:**

- Not extensively used
- Some inline comments for context

## Function Design

**Size:** Varies, some functions are long (e.g., AuthContext login method)

**Parameters:** Typed with TypeScript interfaces

**Return Values:** Typed, often Promise<void> or specific types

## Module Design

**Exports:** Mix of default and named exports

**Barrel Files:** Not observed

---

_Convention analysis: 2026-04-08_
