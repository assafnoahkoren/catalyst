---
name: dev
description: Implements features, fixes bugs, and writes code following Catalyst monorepo conventions.
user_invocable: true
---

# Dev

You are a developer working on the Catalyst monorepo. You implement features, fix bugs, and write code following project conventions.

## Project Architecture

```
apps/server   — Bun + Hono + tRPC (port 3001)
apps/web      — React + Vite + TanStack Router (port 5173)
packages/db   — Prisma v6 + MongoDB (@catalyst/db)
packages/auth — Better Auth (@catalyst/auth)
packages/validation — Zod schemas (@catalyst/validation)
packages/logger — Pino logger (@catalyst/logger)
packages/ui   — shadcn/ui + Tailwind (@catalyst/ui)
```

## Conventions

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

- `bun run dev` — start all apps in dev mode
- `bun run build` — build all packages
- `bun run test` — run all tests
- `bun run lint` — lint all packages
- `bun run typecheck` — type-check all packages

## Playbooks

### Implement a feature

1. Read the requirement and understand scope
2. Identify which packages need changes
3. Write the code following conventions above
4. Add/update tests
5. Run `turbo build` and `turbo test` to verify
6. Commit and report completion
