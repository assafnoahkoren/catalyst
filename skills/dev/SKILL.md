---
name: dev
description: Implements features, fixes bugs, and writes code following Catalyst monorepo conventions.
user_invocable: true
---

# Dev

You are a developer working on the Catalyst monorepo. You implement features, fix bugs, and write code following project conventions.

## Project Architecture

```
apps/server      — Bun + Hono + tRPC (port 3001)
apps/web         — React + Vite + TanStack Router (port 5173)
packages/db      — Prisma v6 + MongoDB (@catalyst/db)
packages/auth    — Better Auth (@catalyst/auth)
packages/validation — Zod schemas (@catalyst/validation)
packages/logger  — Pino logger (@catalyst/logger)
packages/ui      — shadcn/ui + Tailwind (@catalyst/ui)
packages/i18n    — i18next translations (@catalyst/i18n)
```

## Conventions

### i18n — NO hardcoded text in JSX

**Every user-visible string must use `t()` from `@catalyst/i18n`.**

```tsx
// WRONG
<h1>Welcome</h1>

// RIGHT
const { t } = useTranslation()
<h1>{t('welcome')}</h1>
```

When adding new text:

1. Add the English key to `packages/i18n/src/locales/en.ts`
2. Add the Hebrew translation to `packages/i18n/src/locales/he.ts`
3. TypeScript will error if Hebrew is missing a key (enforced by `Translations` type)
4. Keys are flat (no nesting) — use camelCase descriptive names
5. Run `bun run lint:i18n` to verify no hardcoded strings remain

### Adding a new tRPC procedure

1. Define Zod input/output schemas in `packages/validation/src/schemas/`
2. Create or extend a router in `apps/server/src/routers/`
3. Use `publicProcedure` or `protectedProcedure` from `apps/server/src/lib/trpc.ts`
4. Import and add the router to `apps/server/src/routers/index.ts`
5. On the client, use `trpc.routerName.procedureName.queryOptions()` with `useQuery`

### Adding a new page

1. Create a route file in `apps/web/src/routes/` (file-based routing via TanStack Router)
2. Use `createFileRoute` from `@tanstack/react-router`
3. For protected pages, check session in the route's `beforeLoad`
4. Use `useTranslation()` from `@catalyst/i18n` for all text
5. Use components from `@catalyst/ui` (Button, Input, Label, Card, etc.)

### Using UI components

```tsx
import { Button } from '@catalyst/ui'
import { Input } from '@catalyst/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@catalyst/ui'
```

### Adding a new shared package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Use `@catalyst/<name>` as the package name
3. Add `"@catalyst/<name>": "workspace:*"` to consuming packages
4. Run `bun install` at root

### Git workflow

1. Create a feature branch: `git checkout -b feat/<name>`
2. Make changes, ensure `turbo build` and `turbo test` pass
3. Commit with conventional commit messages
4. Push and create PR via `gh pr create`

## Commands

- `bun run dev` — start all apps in dev mode (server + web via Turbo)
- `bun run build` — build all packages
- `bun run test` — run all unit tests
- `bun run lint` — lint all packages
- `bun run typecheck` — type-check all packages
- `bun run lint:i18n` — check for hardcoded JSX strings
- `cd apps/web && bun run test:e2e` — run Playwright E2E tests
- `cd packages/db && bun run seed` — seed the database
- `cd packages/db && bun run db:push` — push Prisma schema to MongoDB

## Playbooks

### Implement a feature

1. Read the requirement and understand scope
2. Identify which packages need changes
3. Add translation keys to `packages/i18n/src/locales/en.ts` and `he.ts`
4. Write the code following conventions above
5. Add/update unit tests (vitest) and E2E tests (playwright) as needed
6. Run `turbo build`, `turbo test`, and `bun run lint:i18n` to verify
7. Commit and report completion
