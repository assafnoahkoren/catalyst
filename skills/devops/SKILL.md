---
name: devops
description: Manages CI/CD, deployments, and infrastructure using gh CLI and Render MCP.
user_invocable: true
---

# DevOps

You manage CI/CD, Docker builds, GHCR, and Render deployments.

## Pre-flight Checks

```bash
# Verify tools
gh auth status                           # GitHub CLI authenticated
docker --version                         # Docker available

# Verify environment
cat .env | grep RENDER_API_KEY           # Render API key set
```

## Infrastructure Map

```
Local:  docker compose (MongoDB:27018) + turbo dev (server:3001, web:5173)
Dev:    Render (catalyst-server-dev + catalyst-web-dev) + MongoDB Atlas
Prod:   Render (catalyst-server-prod + catalyst-web-prod) + MongoDB Atlas
Images: GHCR (ghcr.io/<org>/catalyst/server, ghcr.io/<org>/catalyst/web)
```

## Deployment Flow

```
PR merge → main → GitHub Actions → Docker build → GHCR → Render dev
Release tag (v*) → GitHub Actions → Docker build → GHCR → Render prod
```

---

## Runbook: Create GitHub Repo and Push

### Step 1 — Create repo

```bash
gh repo create <org>/catalyst --private --source=. --remote=origin
```

### Step 2 — Push all code

```bash
git push -u origin main
```

### Step 3 — Set repo secrets

```bash
gh secret set RENDER_API_KEY --body "<value>"
gh secret set RENDER_SERVER_DEV_ID --body "<value>"
gh secret set RENDER_SERVER_PROD_ID --body "<value>"
```

### Verification

```bash
gh repo view --web                       # Opens in browser
gh secret list                           # Shows configured secrets
```

---

## Runbook: Deploy to Dev

### Step 1 — Ensure CI passes

```bash
gh run list --branch main --limit 5
# Wait for latest run to complete
gh run watch                             # Watch the latest run
```

### Step 2 — Check image in GHCR

```bash
gh api /user/packages/container/server/versions --jq '.[0].metadata.container.tags'
```

### Step 3 — Deploy via Render MCP

Use Render MCP tools:

- `list_services` — find catalyst-server-dev service ID
- `list_deploys` — check current deploy status
- `create_deploy` or `update_web_service` — trigger new deploy with latest image

### Step 4 — Monitor deploy

Use Render MCP:

- `list_deploys` — watch deploy progress
- `list_logs` — check for startup errors

### Step 5 — Verify health

```bash
curl -s https://catalyst-server-dev.onrender.com/health
# Expected: {"status":"ok"}
```

### Rollback

```bash
# Find previous working image tag
gh api /user/packages/container/server/versions --jq '.[1].metadata.container.tags'

# Update Render service to previous image via Render MCP
# Use update_web_service with the previous image URL
```

---

## Runbook: Deploy to Prod

### Step 1 — Create release tag

```bash
# Check current version
git tag --sort=-v:refname | head -5

# Create new release
gh release create v<X.Y.Z> --generate-notes --target main
```

### Step 2 — Wait for CI

```bash
gh run watch                             # Watch the release workflow
```

### Step 3 — Monitor prod deploy

Same as dev deploy but target prod service IDs.

### Step 4 — Verify health

```bash
curl -s https://catalyst-server.onrender.com/health
# Expected: {"status":"ok"}
```

### Rollback

```bash
# Find previous release
gh release list --limit 5

# Deploy previous image via Render MCP
# Use the image tag from the previous release's SHA
```

---

## Runbook: Create a PR

```bash
# From a feature branch
gh pr create --title "feat: short description" --body "$(cat <<'EOF'
## Summary
- What was changed and why

## Test plan
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing done
EOF
)"
```

### Verification

```bash
gh pr view --web                         # Opens PR in browser
gh pr checks                             # Watch CI status
```

---

## Runbook: Manage Environment Variables

### View current env vars (via Render MCP)

Use `get_service` with the service ID to see current environment.

### Update env vars (via Render MCP)

Use `update_environment_variables` with:

- Service ID
- Array of `{key, value}` pairs

### Common env vars to manage

| Variable           | Dev                       | Prod                       |
| ------------------ | ------------------------- | -------------------------- |
| DATABASE_URL       | MongoDB Atlas dev cluster | MongoDB Atlas prod cluster |
| BETTER_AUTH_SECRET | Generated                 | Generated                  |
| LOG_TRANSPORT      | axiom                     | axiom                      |
| AXIOM_DATASET      | catalyst-dev              | catalyst-prod              |
| AXIOM_TOKEN        | Same token                | Same token                 |
| CORS_ORIGIN        | dev web URL               | prod web URL               |

---

## Runbook: Monitor CI

```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# View logs of failed run
gh run view <run-id> --log-failed

# Re-run failed jobs
gh run rerun <run-id> --failed
```

---

## Runbook: Docker Build (Local)

### Build server image

```bash
docker build -f apps/server/Dockerfile -t catalyst-server .
```

### Build web image

```bash
docker build -f apps/web/Dockerfile -t catalyst-web .
```

### Test locally

```bash
docker run -p 3001:3001 --env-file .env catalyst-server
```

### Verification

```bash
curl -s http://localhost:3001/health     # {"status":"ok"}
```
