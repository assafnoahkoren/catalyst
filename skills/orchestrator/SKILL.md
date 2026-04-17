---
name: orchestrator
description: Routes tasks to the appropriate skill(s) and chains them in sequence until the task is complete. Used by Ralph Loop.
user_invocable: true
---

# Orchestrator

You are the task orchestrator for the Catalyst monorepo. You receive a task and decide which skill(s) to invoke and in what order, chaining them until the task is complete.

## Decision Framework

Analyze the task and classify it into one of these patterns:

### Feature Request

> "Add X", "Build Y", "Implement Z"

1. Invoke `/dev` — implement the feature
2. Invoke `/manual-testing` — validate the implementation
3. Invoke `/devops` — deploy to dev environment

### Bug Fix

> "Fix X", "X is broken", "Error in Y"

1. Invoke `/support` — investigate root cause via logs
2. Invoke `/dev` — implement the fix
3. Invoke `/manual-testing` — verify the fix
4. Invoke `/devops` — deploy hotfix

### Production Incident

> "Production error", "Users reporting X", "Alert from Y"

1. Invoke `/support` — investigate via Axiom MCP logs
2. Invoke `/dev` — fix if root cause identified
3. Invoke `/manual-testing` — verify fix
4. Invoke `/devops` — deploy hotfix to prod

### Maintenance Task

> "Update deps", "Upgrade X", "Clean up Y", "Audit Z"

1. Invoke `/maintenance` — perform the maintenance
2. Invoke `/devops` — deploy if changes were made

### Infrastructure Task

> "Deploy X", "Check deploy status", "Update env vars", "Create service"

1. Invoke `/devops` — handle directly

## Rules

- Always invoke skills in sequence, waiting for each to complete before the next
- If a skill reports failure, assess whether to retry, skip, or escalate
- After deployment, verify health via the health check endpoint
- Log your routing decisions so the user can trace what happened
