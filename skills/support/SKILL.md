---
name: support
description: Investigates production issues using Axiom MCP logs, traces errors, and implements hotfixes.
user_invocable: true
---

# Support

You investigate production issues, trace errors through the stack, and provide root cause analysis.

## Pre-flight Checks

```bash
# Verify Axiom access
cat .env | grep AXIOM_TOKEN              # Token is set
cat .env | grep AXIOM_DATASET            # Dataset is set

# Verify Render access
cat .env | grep RENDER_API_KEY           # API key is set
```

## Tools

- **Axiom MCP** — query logs from `catalyst-dev` and `catalyst-prod` datasets
- **Render MCP** — check service health, deploy status, metrics, logs
- **Local DB** — query MongoDB via Prisma for data inspection
- **gh CLI** — create hotfix PRs

## Log Structure

All logs are structured JSON:

```json
{
  "level": "info|warn|error",
  "service": "server",
  "traceId": "uuid",
  "method": "GET|POST",
  "path": "/trpc/auth.me",
  "status": 200,
  "duration": 42,
  "message": "request completed"
}
```

Key fields for investigation:

- `traceId` — correlates all logs for a single request
- `level: "error"` — find failures
- `status: 500` — server errors
- `duration` — find slow requests

---

## Runbook: Investigate a Production Error

### Step 1 — Find recent errors

Use Axiom MCP to query the `catalyst-prod` dataset:

```
Filter: level == "error"
Time range: last 1 hour
Sort: timestamp desc
Limit: 20
```

### Step 2 — Pick an error and get the traceId

From the error log entry, note the `traceId`.

### Step 3 — Trace the full request

Query Axiom for all logs with that traceId:

```
Filter: traceId == "<the-trace-id>"
Sort: timestamp asc
```

This shows the full lifecycle:

1. `request started` — method, path
2. Middleware logs — session check, auth
3. tRPC procedure — business logic
4. `request completed` — status, duration
5. Error details — stack trace, message

### Step 4 — Classify the issue

| Symptom            | Likely cause                         |
| ------------------ | ------------------------------------ |
| 401 Unauthorized   | Session expired, auth misconfigured  |
| 500 Internal       | Code bug, unhandled exception        |
| Timeout / slow     | DB query slow, external service down |
| Connection refused | Service not running, wrong URL       |
| Prisma error       | Schema mismatch, DB connection issue |

### Step 5 — Check service health

Use Render MCP:

- `get_metrics` — CPU, memory, response times
- `list_deploys` — when was the last deploy? Did it correlate with the error?
- `get_service` — is the service running?

### Step 6 — Report findings

```
## Investigation Report: <issue title>

### Timeline
- HH:MM — First error occurrence
- HH:MM — Error rate increased
- HH:MM — Investigation started

### Root Cause
<description of what went wrong and why>

### Evidence
- TraceId: <uuid>
- Error: "<message>"
- Affected endpoint: <path>
- Error count: <N> in last <time>

### Impact
- Affected users: estimated <N>
- Affected endpoints: <list>
- Duration: <start> to <end|ongoing>

### Recommended Fix
<description of the fix>

### Severity: critical | high | medium | low
```

---

## Runbook: Investigate Slow Performance

### Step 1 — Find slow requests

Query Axiom:

```
Filter: duration > 1000
Time range: last 24 hours
Sort: duration desc
```

### Step 2 — Identify patterns

- Same endpoint? → endpoint-specific issue
- Same time window? → load spike or deployment
- Same query pattern? → missing DB index

### Step 3 — Check Render metrics

Use Render MCP `get_metrics`:

- CPU spikes → compute bottleneck
- Memory growth → memory leak
- Response time increase → correlate with deploys

---

## Runbook: Query Production Data

For data-related investigations, use Prisma locally pointed at the production DB:

```bash
# CAUTION: read-only queries only
cd packages/db

# Start a Prisma studio session
DATABASE_URL="<prod-connection-string>" bunx prisma studio
```

Or write a one-off script:

```typescript
// packages/db/src/investigate.ts
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function investigate() {
  // Example: find users created in the last hour
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 3600000) } },
    orderBy: { createdAt: 'desc' },
  })
  console.log(recentUsers)
}

investigate().finally(() => prisma.$disconnect())
```

```bash
DATABASE_URL="<connection-string>" bun run src/investigate.ts
```

**Never run write operations against production without explicit approval.**

---

## Runbook: Implement a Hotfix

### Step 1 — Branch from main

```bash
git checkout main && git pull
git checkout -b hotfix/<description>
```

### Step 2 — Implement minimal fix

Apply the smallest change that resolves the issue. Follow dev conventions.

### Step 3 — Verify

```bash
turbo build && turbo test
bun run lint:i18n
cd apps/web && bunx playwright test
```

### Step 4 — Create PR

```bash
gh pr create --title "fix: <description>" --body "$(cat <<'EOF'
## Root Cause
<what caused the issue>

## Fix
<what this PR changes>

## Test Plan
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Tested against reproduction scenario
EOF
)"
```

### Step 5 — After merge, monitor deploy

```bash
gh run watch                             # Watch CI
# Then use Render MCP to monitor the deploy
# Then verify via health check and Axiom logs
```

---

## Runbook: Check Service Health (Quick)

```bash
# Dev
curl -s https://catalyst-server-dev.onrender.com/health

# Prod
curl -s https://catalyst-server.onrender.com/health

# Local
curl -s http://localhost:3001/health
```

All should return `{"status":"ok"}`.

Use Render MCP `list_logs` if health check fails — look for startup errors, crash loops, or OOM kills.

---

## Escalation Criteria

Escalate to the user (do NOT proceed autonomously) when:

- Production data loss suspected
- Root cause is unclear after log investigation
- Fix requires a breaking schema change
- Multiple services are affected simultaneously
- Error rate exceeds 10% of requests
