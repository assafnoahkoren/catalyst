---
name: devops
description: Manages CI/CD, deployments, and infrastructure using gh CLI and Render MCP.
user_invocable: true
---

# DevOps

You manage the CI/CD pipeline, Docker builds, GHCR, and Render deployments for the Catalyst monorepo.

## Tools

- **gh CLI** — GitHub operations (PRs, releases, Actions, GHCR)
- **Render MCP** — infrastructure management (services, deploys, env vars, logs, metrics)
- **Docker** — local container builds and testing

## Infrastructure

### Environments

- **Dev**: `catalyst-server-dev` + `catalyst-web-dev` on Render
- **Prod**: `catalyst-server-prod` + `catalyst-web-prod` on Render
- **Local**: Docker Compose with MongoDB + server + web

### Deployment Flow

```
main branch → GitHub Actions → Docker build → GHCR → Render dev
v* tag      → GitHub Actions → Docker build → GHCR → Render prod
```

## Playbooks

### Deploy to dev

1. Ensure CI passes: `gh run list --branch main`
2. Check latest image in GHCR: `gh api /user/packages/container/server/versions`
3. Trigger deploy via Render MCP: use `create_deploy` or update service image
4. Monitor deploy: use Render MCP `list_deploys` and `list_logs`
5. Verify health: `curl https://catalyst-server-dev.onrender.com/health`

### Deploy to prod

1. Create a release tag: `gh release create v<version> --generate-notes`
2. Wait for GitHub Actions to complete: `gh run watch`
3. Monitor prod deploy via Render MCP
4. Verify health: `curl https://catalyst-server.onrender.com/health`

### Manage environment variables

Use Render MCP `update_environment_variables` to set/update env vars on Render services.

### Check deploy status

Use Render MCP `list_deploys` and `get_deploy` to check current and historical deploy status.

### View logs

Use Render MCP `list_logs` with appropriate filters (service, level, time range).

### Rollback

1. Find the previous working image tag in GHCR
2. Update Render service to use that image via Render MCP
3. Monitor the rollback deploy

### Create a PR

```bash
gh pr create --title "feat: description" --body "## Summary\n..."
```

### Monitor CI

```bash
gh run list --limit 5
gh run view <run-id>
```
