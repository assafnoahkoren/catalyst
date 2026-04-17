---
name: manual-testing
description: Runs E2E tests, validates user flows, and reports bugs with reproduction steps.
user_invocable: true
---

# Manual Testing

You validate features and fixes by running tests and checking user flows.

## Pre-flight Checks

```bash
# Verify infrastructure
docker compose ps                              # MongoDB running
curl -s http://localhost:3001/health            # Server responds {"status":"ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/  # Web responds 200

# If either is down, start the stack:
docker compose up -d
bun run dev
```

---

## Runbook: Validate a Feature

### Step 1 — Run existing E2E tests

```bash
cd apps/web && bunx playwright test
```

Expected: all tests pass. If any fail, stop and report — the feature may have broken something.

### Step 2 — Write new E2E tests for the feature

Create `apps/web/tests/e2e/<feature>.spec.ts`:

```typescript
import { expect, test } from '@playwright/test'

test.describe('<feature name>', () => {
  test('happy path', async ({ page }) => {
    await page.goto('/<route>')
    // Test the main user flow
    await expect(page.getByRole('heading', { name: 'Expected Title' })).toBeVisible()
  })

  test('error state', async ({ page }) => {
    await page.goto('/<route>')
    // Test what happens with bad input
  })

  test('unauthorized access', async ({ page }) => {
    // Test protected routes without session
  })
})
```

### Step 3 — Run the new tests

```bash
# Run just the new test file
cd apps/web && bunx playwright test tests/e2e/<feature>.spec.ts

# Run all tests to catch regressions
cd apps/web && bunx playwright test
```

### Step 4 — Report results

Format:

```
## Test Results: <feature name>
- Total: X tests
- Passed: X
- Failed: X

### Failed tests (if any):
- test name: description of failure
  - Expected: ...
  - Actual: ...
  - Steps to reproduce: ...
```

---

## Runbook: Validate Auth Flows

### Registration

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"new@test.com","password":"password123"}'

# Expected: 200 with user object
```

### Login

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"password123"}'

# Expected: 200 with session token
```

### Session check

```bash
# Via tRPC (should return UNAUTHORIZED without cookie)
curl -s http://localhost:3001/trpc/auth.me

# Expected: {"error":{"message":"UNAUTHORIZED",...}}
```

### Protected routes

```bash
# Web app should redirect to login
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/protected-route
```

---

## Runbook: Test the API Directly

### Health check

```bash
curl -s http://localhost:3001/health
# Expected: {"status":"ok"}
```

### tRPC endpoints

```bash
# List available procedures (will error but shows the router structure)
curl -s http://localhost:3001/trpc/<router>.<procedure>

# With input
curl -s "http://localhost:3001/trpc/<router>.<procedure>?input=%7B%22key%22%3A%22value%22%7D"
```

---

## Runbook: Report a Bug

Include all of these:

```
## Bug Report: <title>

### Severity: critical | high | medium | low

### Steps to Reproduce
1. Go to ...
2. Click on ...
3. Enter ...

### Expected Behavior
What should happen.

### Actual Behavior
What actually happens.

### Evidence
- Error message: "..."
- Server log (traceId): "..."
- HTTP status: ...
- Screenshot: (if applicable)

### Environment
- Browser: chromium (Playwright)
- Server: localhost:3001
- MongoDB: localhost:27018
```

---

## Runbook: Debug a Failing E2E Test

### Step 1 — Run with UI mode

```bash
cd apps/web && bunx playwright test --ui
```

### Step 2 — Run with trace

```bash
cd apps/web && bunx playwright test --trace on
```

Then open the trace viewer:

```bash
bunx playwright show-trace test-results/<test-name>/trace.zip
```

### Step 3 — Run headed (visible browser)

```bash
cd apps/web && bunx playwright test --headed
```

### Step 4 — Check server logs

Look at the terminal running `bun run dev` for:

- Request traceId
- Error stack traces
- Database query failures

---

## Verification Checklist

After any testing session, confirm:

```bash
# All E2E tests pass
cd apps/web && bunx playwright test

# All unit tests pass
turbo test

# Build is clean
turbo build

# No i18n violations
bun run lint:i18n
```
