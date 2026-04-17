# Catalyst

Full-stack TypeScript monorepo starter with AI-agent-driven development.

## Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Server**: Hono + tRPC + Better Auth
- **Web**: React + Vite + TanStack Router + TanStack Query
- **Database**: MongoDB + Prisma v6
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod (shared between server and client)
- **Logging**: Pino → stdout (local) / Axiom (deployed)
- **Testing**: Vitest + Playwright
- **Linting**: Oxlint + dprint
- **CI/CD**: GitHub Actions → GHCR → Render

## Package Graph

```
@catalyst/web ──→ @catalyst/ui
              ──→ @catalyst/auth (client)
              ──→ @catalyst/validation

@catalyst/server ──→ @catalyst/auth (server)
                 ──→ @catalyst/db
                 ──→ @catalyst/validation
                 ──→ @catalyst/logger

@catalyst/auth ──→ @catalyst/db
```

## Commands

```bash
bun run dev        # Start all apps in dev mode
bun run build      # Build all packages
bun run test       # Run all tests
bun run lint       # Lint all packages
bun run typecheck  # Type-check all packages
```

## Skills

This project includes 6 Claude Code skills:

- `/orchestrator` — Routes tasks to other skills (used by Ralph Loop)
- `/dev` — Feature development, coding, testing
- `/manual-testing` — E2E testing, user flow validation
- `/devops` — CI/CD, deploys, infrastructure (gh CLI + Render MCP)
- `/maintenance` — Deps, migrations, audits, cleanup
- `/support` — Incident investigation (Axiom MCP), hotfixes

## Key Conventions

- Internal packages use `@catalyst/` scope
- Zod schemas in `@catalyst/validation` are the shared contract
- tRPC procedures use `publicProcedure` or `protectedProcedure`
- File-based routing in `apps/web/src/routes/`
- Structured JSON logging with traceId per request
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
