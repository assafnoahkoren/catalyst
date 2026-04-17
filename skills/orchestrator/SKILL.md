---
name: orchestrator
description: Routes tasks to the appropriate skill(s) and chains them in sequence until the task is complete. Used by Ralph Loop.
user_invocable: true
---

# Orchestrator

You receive a task and decide which skill(s) to invoke and in what order, chaining them until complete.

## Pre-flight Checks

Before routing any task:

```bash
# 1. Verify the stack is healthy
docker compose ps                        # MongoDB should be running
curl -s http://localhost:3001/health      # Server responds (if running)
git status                               # Clean working tree
```

## Task Classification

Read the task and match it to a pattern below. If unclear, ask the user.

### Pattern: Feature Request

> Triggers: "Add X", "Build Y", "Implement Z", "Create a page for..."

```
1. /dev          — implement the feature
2. /manual-testing — validate it works
3. /devops       — deploy to dev (if GitHub repo exists)
```

**Verification after chain:**

```bash
turbo build                              # All packages build
turbo test                               # All unit tests pass
cd apps/web && bunx playwright test      # All E2E tests pass
bun run lint:i18n                        # No hardcoded strings
```

### Pattern: Bug Fix

> Triggers: "Fix X", "X is broken", "Error when Y", "Bug in Z"

```
1. /support       — investigate root cause (logs, traces)
2. /dev           — implement the fix
3. /manual-testing — verify the fix, add regression test
4. /devops        — deploy hotfix
```

### Pattern: Production Incident

> Triggers: "Production error", "Users can't X", "500 on Y", "Alert from Z"

```
1. /support       — investigate via Axiom MCP logs (catalyst-prod dataset)
2. /dev           — fix if root cause identified
3. /manual-testing — verify fix
4. /devops        — deploy hotfix to prod (v* tag)
```

**Escalation:** If root cause is unclear after log investigation, report findings and ask the user before proceeding.

### Pattern: Maintenance

> Triggers: "Update deps", "Upgrade X", "Clean up Y", "Audit Z", "Migrate schema"

```
1. /maintenance   — perform the maintenance
2. /manual-testing — verify nothing broke
3. /devops        — deploy if changes were made
```

### Pattern: Infrastructure

> Triggers: "Deploy X", "Check deploy", "Update env vars", "Create service", "Check logs"

```
1. /devops        — handle directly
```

### Pattern: Investigation Only

> Triggers: "Why is X slow", "Check logs for Y", "What's the error rate"

```
1. /support       — investigate and report
```

## Chaining Rules

1. **Sequential only** — wait for each skill to complete before the next
2. **Fail fast** — if a skill reports failure, do NOT proceed to the next. Assess:
   - Can I retry? (transient error like network timeout)
   - Can I fix it? (missing i18n key, lint error)
   - Should I escalate? (unclear root cause, destructive action needed)
3. **Always verify** — after the last skill in the chain, run the full verification:
   ```bash
   turbo build && turbo test && bun run lint:i18n
   cd apps/web && bunx playwright test
   ```
4. **Report** — summarize what was done, what was verified, and any remaining concerns

## Rollback

If a deployed change causes issues:

```
1. /support       — confirm the issue via logs
2. /devops        — rollback to previous image
3. /support       — verify the rollback resolved it
```
