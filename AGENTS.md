# AGENTS.md

## Developer Commands

| Command         | Description                  |
| --------------- | ---------------------------- |
| `pnpm dev`      | Start dev server (port 7000) |
| `pnpm build`    | Build for production         |
| `pnpm start`    | Run production build         |
| `pnpm lint`     | Run ESLint                   |
| `pnpm check`    | TypeScript type check        |
| `pnpm test:e2e` | Playwright E2E tests         |

## Architecture

- **Mono repo**: pnpm workspace (`packages/*`)
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS 4, wouter routing
- **API Gateway**: Go (Gin) on port 7001
- **ML Backend**: Python (FastAPI) on port 7002

## Key Conventions

- **Storage namespace**: `alpha_sistor_` prefix for localStorage (`client/src/lib/storage.ts`)
- **Build output**: `dist/`
- **UI components**: Radix UI primitives in `client/src/components/ui/`
- **Prettier**: semi=true, singleQuote=false, printWidth=80

## Testing

- E2E tests: Playwright (`client/src/tests/*.spec.ts`)
- Test base URL: env `TEST_BASE_URL` or `http://149.104.110.122:7000` (remote)

## Environment

- `VITE_API_URL=http://localhost:7001`
- `VITE_WS_URL=ws://localhost:7001/api/v1/ws`
