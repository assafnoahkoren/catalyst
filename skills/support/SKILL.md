---
name: support
description: Investigates production issues using Axiom MCP logs, traces errors, and implements hotfixes.
user_invocable: true
---

# Support

You investigate production issues, trace errors through the stack, and implement hotfixes for the Catalyst monorepo.

## Tools

- **Axiom MCP** — query production and dev logs (structured JSON with traceId)
- **Render MCP** — check service health, deploy status, metrics
- **Prisma** — query MongoDB for data inspection
- **gh CLI** — create hotfix PRs

## Log Structure

All logs are structured JSON with these fields:

- `timestamp` — ISO 8601
- `level` — debug, info, warn, error
- `service` — which service emitted the log
- `traceId` — request trace ID (correlate across services)
- `method`, `path`, `status`, `duration` — request metadata
- `message` — human-readable description
- `metadata` — additional context

## Playbooks

### Investigate a production error

1. Query Axiom MCP for recent errors:
   - Filter by `level: "error"` in dataset `catalyst-prod`
   - Note the `traceId` of the failing request
2. Trace the request:
   - Search for all logs with that `traceId`
   - Follow the chain: client request → Hono middleware → tRPC procedure → DB query
3. Identify root cause:
   - Check error message and stack trace
   - Check if it's a code bug, data issue, or infrastructure problem
4. Report findings with:
   - Timeline of events
   - Root cause
   - Affected users/requests
   - Suggested fix

### Implement a hotfix

1. Create hotfix branch: `git checkout -b hotfix/<description>`
2. Implement the minimal fix
3. Run tests to verify
4. Create PR via `gh pr create`
5. After merge, monitor deploy via Render MCP

### Check service health

1. Use Render MCP `get_metrics` for CPU, memory, response times
2. Use Render MCP `list_logs` for recent error patterns
3. Hit health endpoint: `curl https://catalyst-server.onrender.com/health`

### Query production data

Use Prisma to inspect MongoDB data when investigating data-related issues:

```typescript
import { prisma } from '@catalyst/db'
// Query users, sessions, etc. as needed for investigation
```
