# Coding Conventions

**Analysis Date:** 2026-04-09

## Naming Patterns

**Files:**

- Components: PascalCase (e.g., `ErrorBoundary.tsx`, `AuthContext.tsx`)
- Utilities: camelCase (e.g., `utils.ts`, `const.ts`)
- Tests: camelCase with `.spec.ts` or `.test.ts` suffix
- UI Components: PascalCase in `client/src/components/ui/` (e.g., `button.tsx`, `dialog.tsx`)

**Functions:**

- camelCase for regular functions and React hooks (e.g., `checkAuth`, `useAuth`)
- Custom hooks MUST start with `use` prefix (e.g., `useApi`, `useMobile`)

**Variables:**

- camelCase for state and variables (e.g., `user`, `isLoading`, `currentTab`)
- Boolean variables use `is`, `has`, `should` prefixes (e.g., `isAuthenticated`, `hasError`)

**Types:**

- PascalCase for interfaces, types, and enums (e.g., `AuthContextType`, `User`, `ProductCategory`)
- Type files colocated with usage or in `lib/types.ts`

**Constants:**

- PascalCase for exportable constants (e.g., `API_BASE_URL`)
- camelCase for internal constants

## Code Style

**Formatting:**

- Prettier (v3.6.2) - config in `.prettierrc`
- Semi-colons: `true`
- Single quotes: `false` (double quotes)
- Trailing comma: `es5`
- Print width: `80`
- Tab width: `2` spaces
- Use tabs: `false`
- Bracket spacing: `true`
- Arrow parens: `avoid`
- End of line: `lf`
- Prose wrap: `preserve`

**Linting:**

- ESLint (v9.18.0) - config in `package.json` scripts
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run command: `pnpm lint`
- TypeScript: `pnpm check` (via `tsc --noEmit`)

**TypeScript:**

- Strict mode enabled in `tsconfig.json`
- Module: `ESNext`
- JSX: `preserve`
- Path aliases configured: `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`

## Import Organization

**Order:**

1. React core imports (`react`)
2. Third-party library imports (e.g., `@radix-ui/*`, `lucide-react`, `wouter`)
3. Local imports with `@/` alias
4. Relative imports (e.g., `./components`, `../lib`)

**Path Aliases:**

- `@/*`: resolves to `./client/src/*`
- `@shared/*`: resolves to `./shared/*`
- `@assets/*`: resolves to `./attached_assets`

**Example:**

```typescript
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "./types";
```

## Error Handling

**Patterns:**

- Try/catch blocks in async functions
- `console.error` for logging errors (prefixed with context)
- Error boundaries (`ErrorBoundary.tsx`) for React component trees
- Toast notifications via `sonner` for user feedback
- Zod validation for forms with `@hookform/resolvers`

**Error Boundary Example:**

```typescript
// client/src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }
}
```

## Logging

**Framework:** `console` (dev) + custom Manus debug collector

**Patterns:**

- Prefixed messages with context: `[Auth] login failed:`, `[API] fetch error:`
- Debug collector writes to `.manus-logs/` in development
- Manus plugin: `vite-plugin-manus-runtime`, `vitePluginManusDebugCollector`

**Vite Config Logging:**

```typescript
// vite.config.ts - Manus debug collector plugin
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
```

## Comments

**When to Comment:**

- Complex business logic or validation rules
- Configuration constants with non-obvious values
- TODO/FIXME markers for known issues
- TypeScript JSDoc for exported functions (limited usage)

**Not Commented:**

- Simple component render functions
- Obvious UI structure
- Well-named variables

## Function Design

**Size:** Varies - some functions are long (AuthContext login ~100 lines), but component render functions tend to be smaller

**Parameters:**

- Always typed with TypeScript interfaces
- Optional parameters clearly marked with `?`
- Default values for optional params

**Return Values:**

- Typed explicitly, often `Promise<T>` for async functions
- `void` for side-effect functions
- Custom types for complex returns

## Module Design

**Exports:**

- Named exports preferred for utilities and components
- Default exports for page components and complex modules
- Barrel files NOT used (no `index.ts` re-exports observed)

**React Components:**

- Functional components with TypeScript
- Props interface defined in same file or imported
- Prop drilling minimized via Context API

## Git Conventions

**Branch Naming:**

- Feature: `feature/description`
- Bugfix: `fix/description`
- Hotfix: `hotfix/description`

**Commit Messages:**

- Conventional commits not strictly enforced but encouraged
- Format: `type(scope): description`
- Examples: `feat(auth): add login`, `fix(ui): button alignment`, `chore(deps): update react`

**CI/CD:**

- GitHub Actions workflow: `.github/workflows/ci-cd.yml`
- Pipeline: lint → unit tests → e2e tests → build → deploy

---

_Convention analysis: 2026-04-09_
