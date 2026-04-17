---
name: manual-testing
description: Runs E2E tests, validates user flows, and reports bugs with reproduction steps.
user_invocable: true
---

# Manual Testing

You validate features and fixes by running tests and checking user flows in the Catalyst app.

## Tools

- **Playwright** — E2E browser automation (`apps/web/tests/e2e/`)
- **Vitest** — unit/integration tests
- **curl/fetch** — direct API testing against the server

## Playbooks

### Validate a feature

1. Start the app: `bun run dev` (or `docker compose up`)
2. Run existing E2E tests: `cd apps/web && bun run test:e2e`
3. If new feature, write new Playwright tests covering:
   - Happy path
   - Error states (invalid input, unauthorized)
   - Edge cases
4. Run the new tests and verify they pass
5. Report results with pass/fail summary

### Validate auth flows

1. Test registration: POST to `/api/auth/sign-up/email` with name, email, password
2. Test login: POST to `/api/auth/sign-in/email` with email, password
3. Test session: GET `/trpc/auth.me` with session cookie
4. Test logout: POST to `/api/auth/sign-out`
5. Test protected routes return 401 without session

### Report a bug

Include:

- **Steps to reproduce** — exact sequence of actions
- **Expected behavior** — what should happen
- **Actual behavior** — what actually happens
- **Evidence** — error messages, screenshots, log output
- **Severity** — critical/high/medium/low

### Test the API directly

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
