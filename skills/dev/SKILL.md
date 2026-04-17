---
name: dev
description: Implements features, fixes bugs, and writes code following Catalyst monorepo conventions.
user_invocable: true
---

# Dev

You implement features, fix bugs, and write code in the Catalyst monorepo.

## Pre-flight Checks

```bash
# Verify environment is ready
docker compose ps                        # MongoDB running on 27018
git status                               # Clean working tree
turbo build                              # All packages build
```

## Architecture

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

## Package Dependency Graph

```
@catalyst/web ──→ @catalyst/ui, @catalyst/auth/client, @catalyst/validation, @catalyst/i18n
@catalyst/server ──→ @catalyst/auth/server, @catalyst/db, @catalyst/validation, @catalyst/logger
@catalyst/auth ──→ @catalyst/db
```

---

## Runbook: Add a New Feature

### Step 1 — Branch

```bash
git checkout -b feat/<feature-name>
```

### Step 2 — Add translation keys

Every user-visible string must use `t()`. **Never hardcode text in JSX.**

```bash
# Edit packages/i18n/src/locales/en.ts — add flat keys
# Edit packages/i18n/src/locales/he.ts — add matching Hebrew translations
```

Rules:

- Keys are flat (no nesting): `featureTitle`, not `feature.title`
- English file uses `as const satisfies Record<string, string>` to enforce flat structure
- Hebrew file uses `Translations` type from English — TypeScript errors on missing keys
- Use camelCase descriptive names

```tsx
// WRONG — will be caught by lint:i18n
<h1>Welcome</h1>

// RIGHT
const { t } = useTranslation()
<h1>{t('welcome')}</h1>
```

### Step 3 — Add validation schemas (if API changes)

```bash
# Edit packages/validation/src/schemas/<domain>.ts
# Export from packages/validation/src/index.ts
```

```typescript
import { z } from 'zod'

export const mySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export type MyInput = z.infer<typeof mySchema>
```

### Step 4 — Add tRPC procedure (if API changes)

```bash
# Create or edit apps/server/src/routers/<domain>.ts
```

```typescript
import { mySchema } from '@catalyst/validation'
import { protectedProcedure, publicProcedure, router } from '../lib/trpc'

export const myRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    // use ctx.user for auth, prisma for DB
  }),
  create: protectedProcedure
    .input(mySchema)
    .mutation(async ({ ctx, input }) => {
      // ...
    }),
})
```

Then register in `apps/server/src/routers/index.ts`:

```typescript
import { myRouter } from './my'

export const appRouter = router({
  auth: authRouter,
  my: myRouter, // add here
})
```

### Step 5 — Add page (if UI changes)

Create `apps/web/src/routes/<name>.tsx`:

```typescript
import { useTranslation } from '@catalyst/i18n'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@catalyst/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/<name>')({
  component: MyPage,
})

function MyPage() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myPageTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>{t('myAction')}</Button>
      </CardContent>
    </Card>
  )
}
```

For tRPC data fetching in the page:

```typescript
import { useQuery } from '@tanstack/react-query'
import { trpc } from '../lib/trpc'

function MyPage() {
  const query = useQuery(trpc.my.list.queryOptions())
  // ...
}
```

### Step 6 — Add tests

**Unit tests** (packages):

```bash
# Create packages/<name>/tests/<name>.test.ts
```

```typescript
import { describe, expect, it } from 'vitest'

describe('myFeature', () => {
  it('does the thing', () => {
    expect(true).toBe(true)
  })
})
```

**E2E tests** (user flows):

```bash
# Create apps/web/tests/e2e/<name>.spec.ts
```

```typescript
import { expect, test } from '@playwright/test'

test('my feature works', async ({ page }) => {
  await page.goto('/my-page')
  await expect(page.getByRole('heading', { name: 'My Page' })).toBeVisible()
})
```

### Step 7 — Verify

```bash
turbo build                              # All packages build
turbo test                               # All unit tests pass
bun run lint:i18n                        # No hardcoded strings
bun run typecheck                        # No type errors
cd apps/web && bunx playwright test      # All E2E tests pass
```

### Step 8 — Commit

```bash
git add <specific files>
git commit -m "feat: description of what was added"
```

Pre-commit hooks will run automatically:

- oxlint (lint)
- dprint fmt (auto-format)
- tsc --noEmit (typecheck)
- lint:i18n (no hardcoded strings)

### Rollback

If the feature breaks something:

```bash
git log --oneline -5                     # Find the commit
git revert <commit-sha>                  # Revert it cleanly
turbo build && turbo test                # Verify revert is clean
```

---

## Runbook: Fix a Bug

### Step 1 — Reproduce

```bash
# Start the stack
bun run dev

# Or run specific E2E test that demonstrates the bug
cd apps/web && bunx playwright test --grep "test name"
```

### Step 2 — Investigate

- Check server logs (Pino output in terminal, structured JSON with traceId)
- Check browser console for client-side errors
- Trace the request: client → tRPC → server → DB

### Step 3 — Fix

Apply the minimal change. Follow the same conventions as a feature.

### Step 4 — Add regression test

Write a test that would have caught this bug:

```typescript
// E2E test that reproduces the bug scenario
test('the bug scenario no longer occurs', async ({ page }) => {
  // steps that used to trigger the bug
  // assertion that it's now fixed
})
```

### Step 5 — Verify

```bash
turbo build && turbo test && bun run lint:i18n
cd apps/web && bunx playwright test
```

### Step 6 — Commit

```bash
git commit -m "fix: description of what was fixed"
```

---

## Quick Reference

| Task             | Command                                 |
| ---------------- | --------------------------------------- |
| Start everything | `docker compose up -d && bun run dev`   |
| Build all        | `turbo build`                           |
| Test all         | `turbo test`                            |
| E2E tests        | `cd apps/web && bunx playwright test`   |
| Lint             | `turbo lint`                            |
| Format           | `dprint fmt`                            |
| Typecheck        | `turbo typecheck`                       |
| i18n check       | `bun run lint:i18n`                     |
| Seed DB          | `cd packages/db && bun run seed`        |
| Push schema      | `cd packages/db && bun run db:push`     |
| Generate Prisma  | `cd packages/db && bun run db:generate` |
