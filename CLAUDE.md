# Fitness OS - Claude Code Instructions

## Protocol
Always read /docs/README.md, /docs/architecture.md, /docs/database-schema.md, /docs/api-design.md, /docs/security.md, /docs/testing-strategy.md before implementing any feature.

## Tech Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma ORM
- Auth.js v5 (next-auth@beta)
- Anthropic Claude API (claude-sonnet-4-6)
- PostHog analytics
- Vitest + Playwright
- Sentry for error tracking
- Zod for validation

## Architecture
- `src/app/` — Next.js App Router pages and layouts
- `src/app/api/` — API route handlers (Route Handlers)
- `src/app/(auth)/` — Authentication pages (login, register)
- `src/app/(dashboard)/` — Protected dashboard pages
- `src/components/` — Reusable UI components
- `src/components/ui/` — shadcn/ui base components
- `src/lib/` — Utilities, configs, helpers
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — Auth.js config
- `src/lib/ai/` — AI provider abstraction layer
- `src/lib/analytics.ts` — PostHog client
- `src/lib/validations/` — Zod schemas
- `src/services/` — Business logic services (server-only)
- `src/types/` — TypeScript type definitions
- `prisma/` — Database schema and migrations
- `docs/` — All documentation

## Key Files
- `prisma/schema.prisma` — Database schema (all models)
- `src/lib/db.ts` — Prisma singleton
- `src/lib/auth.ts` — Auth.js configuration
- `src/lib/ai/client.ts` — Claude API client
- `src/lib/analytics.ts` — PostHog client

## Git Workflow
- Branches: `main`, `feature/*`, `bugfix/*`, `hotfix/*`
- Commit prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
- PRs require tests and lint passing

## Coding Standards
- No hardcoded secrets — always use environment variables
- Zod validation on ALL API inputs
- All API routes require authentication unless explicitly public
- Tests required for all new features (unit + integration)
- Use `db` from `@/lib/db` for all database access
- Use server actions for form mutations where possible
- Always handle errors with proper HTTP status codes
- Log errors to Sentry in production

## API Design
- REST endpoints in `src/app/api/`
- Authentication via Auth.js session
- Request validation with Zod
- Standard response format: `{ data, error, meta }`
- Rate limiting on all endpoints

## Database Rules
- Never query the database from client components
- Always use transactions for multi-table writes
- Index all foreign keys and frequently queried fields
- Soft-delete sensitive data where applicable

## Testing
- Unit tests: Vitest + React Testing Library
- E2E tests: Playwright
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`
- Run tests: `npm test`
- Run E2E: `npm run test:e2e`

## Model Reference
- AI model: `claude-sonnet-4-6` (Anthropic)
- Always use streaming for long AI responses
- Store conversation history in `AIConversation` + `AIMessage` models
