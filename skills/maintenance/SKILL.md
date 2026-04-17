---
name: maintenance
description: Handles dependency updates, Prisma migrations, performance audits, and codebase cleanup.
user_invocable: true
---

# Maintenance

You keep the Catalyst monorepo healthy through dependency updates, migrations, audits, and cleanup.

## Pre-flight Checks

```bash
git status                               # Clean working tree
turbo build                              # Everything builds
turbo test                               # All tests pass
cd apps/web && bunx playwright test      # E2E passes
```

**Always verify the full suite before AND after any maintenance task.**

---

## Runbook: Update Dependencies

### Step 1 — Check outdated

```bash
bun outdated
```

### Step 2 — Branch

```bash
git checkout -b chore/update-deps
```

### Step 3 — Update (minor/patch)

```bash
bun update
```

### Step 4 — Update (major — one at a time)

```bash
# In the specific workspace
cd packages/<name>
bun add <pkg>@latest

# Verify after each major update
cd ../..
turbo build && turbo test
```

### Step 5 — Verify

```bash
turbo build                              # All packages build
turbo test                               # All unit tests pass
bun run lint:i18n                        # i18n still clean
bun run typecheck                        # Types still valid
cd apps/web && bunx playwright test      # E2E still passes
```

### Step 6 — Commit

```bash
git add bun.lock packages/*/package.json apps/*/package.json
git commit -m "chore: update dependencies"
```

### Rollback

```bash
git checkout main -- bun.lock packages/*/package.json apps/*/package.json
bun install
```

---

## Runbook: Prisma Schema Migration

### Step 1 — Branch

```bash
git checkout -b chore/db-migration-<description>
```

### Step 2 — Edit schema

```bash
# Edit packages/db/prisma/schema.prisma
```

### Step 3 — Push to MongoDB

```bash
cd packages/db && bun run db:push
```

### Step 4 — Regenerate client

```bash
cd packages/db && bun run db:generate
```

### Step 5 — Update Zod schemas

If the model changed, update the matching Zod schema in `packages/validation/src/schemas/`.

### Step 6 — Update i18n (if new user-facing fields)

Add translation keys for any new labels/messages in:

- `packages/i18n/src/locales/en.ts`
- `packages/i18n/src/locales/he.ts`

### Step 7 — Verify

```bash
turbo build && turbo test
bun run lint:i18n
cd apps/web && bunx playwright test
```

### Step 8 — Commit

```bash
git add packages/db/prisma/schema.prisma packages/db/src/generated/ packages/validation/
git commit -m "chore: update schema - <description>"
```

### Rollback

```bash
# Revert the schema change
git checkout main -- packages/db/prisma/schema.prisma
cd packages/db && bun run db:push && bun run db:generate
```

---

## Runbook: Performance Audit

### Bundle size

```bash
turbo build --filter=@catalyst/web --force
# Check output — look for chunks > 100KB gzipped
```

### Identify large deps

```bash
# Build with analysis
cd apps/web && bunx vite-bundle-visualizer
```

### Actions to take

1. **Large chunk** → lazy import with `React.lazy()` or TanStack Router's code splitting
2. **Unused dep** → remove from package.json
3. **Duplicate dep** → check `bun.lock` for multiple versions, align versions

---

## Runbook: Clean Up Dead Code

### Step 1 — Find unused exports

```bash
# Check for unused exports in each package
cd packages/<name> && bunx knip
```

### Step 2 — Find unused dependencies

```bash
cd packages/<name> && bunx depcheck
cd apps/<name> && bunx depcheck
```

### Step 3 — Remove

Delete the unused code/dependencies.

### Step 4 — Verify

```bash
turbo build && turbo test
cd apps/web && bunx playwright test
```

---

## Runbook: Update Tooling Configs

### Oxlint

```bash
# Check latest version
bun outdated oxlint

# Update
bun add -d oxlint@latest

# Run lint to check for new warnings
turbo lint
```

### dprint

```bash
bun outdated dprint

bun add -d dprint@latest

# Update plugin URLs in dprint.json and packages/lint-config/dprint.json
# Check https://plugins.dprint.dev for latest versions

dprint fmt                               # Reformat with new version
```

### Turborepo

```bash
bun outdated turbo
bun add -d turbo@latest
turbo build                              # Verify it works
```

---

## Verification Checklist (after ANY maintenance)

```bash
turbo build                              # ✓ All packages build
turbo test                               # ✓ All unit tests pass
bun run typecheck                        # ✓ No type errors
bun run lint:i18n                        # ✓ No hardcoded strings
cd apps/web && bunx playwright test      # ✓ All E2E tests pass
```

If any check fails, fix it before committing. If you can't fix it, revert and report.
