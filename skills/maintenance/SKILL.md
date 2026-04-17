---
name: maintenance
description: Handles dependency updates, Prisma migrations, performance audits, and codebase cleanup.
user_invocable: true
---

# Maintenance

You keep the Catalyst monorepo healthy through dependency updates, migrations, audits, and cleanup.

## Playbooks

### Update dependencies

1. Check outdated: `bun outdated`
2. Update minor/patch: `bun update`
3. For major updates, update one at a time and test:
   - `bun add <pkg>@latest` in the relevant workspace
   - Run `turbo build` and `turbo test`
   - Commit each update separately
4. Update lockfile: `bun install`

### Prisma schema migration

1. Edit `packages/db/prisma/schema.prisma`
2. Push changes: `cd packages/db && bunx prisma db push`
3. Regenerate client: `bunx prisma generate`
4. Update Zod schemas in `packages/validation` to match
5. Run `turbo build` and `turbo test`

### Performance audit

1. Build the web app: `turbo build --filter=@catalyst/web`
2. Check bundle size in build output
3. Look for large dependencies that could be tree-shaken or lazy-loaded
4. Run Lighthouse if browser available

### Clean up dead code

1. Search for unused exports across the monorepo
2. Check for unused dependencies: `bunx depcheck` in each workspace
3. Remove unused code and dependencies
4. Verify build and tests still pass

### Update tooling configs

1. Check for new versions of Oxlint, dprint, Turbo
2. Update configs if new rules or options are available
3. Run lint and format to verify no regressions
