# Catalyst Monorepo — Design Document

**Date:** 2026-04-17
**Status:** Approved

## Purpose

A production-ready full-stack monorepo starter with 6 Claude Code skills that enable fully autonomous AI-agent-driven development, testing, deployment, maintenance, and support — orchestrated via Ralph Loop.

---

## Stack

| Layer                     | Technology                                   |
| ------------------------- | -------------------------------------------- |
| Runtime & Package Manager | Bun                                          |
| Monorepo Orchestration    | Turborepo                                    |
| Server Framework          | Hono                                         |
| API Layer                 | tRPC                                         |
| Frontend                  | React + Vite                                 |
| UI Components             | shadcn/ui + Tailwind CSS                     |
| Client State              | TanStack Query (via tRPC)                    |
| Database                  | MongoDB + Prisma v6                          |
| Auth                      | Better Auth                                  |
| Validation                | Zod (shared)                                 |
| Logging                   | Pino → Axiom (deployed) / stdout (local)     |
| Linting                   | Oxlint                                       |
| Formatting                | dprint                                       |
| Git Hooks                 | Husky + lint-staged                          |
| Testing                   | Vitest (unit/integration) + Playwright (E2E) |
| Containers                | Docker multi-stage + Docker Compose          |
| Registry                  | GHCR                                         |
| CI/CD                     | GitHub Actions                               |
| Hosting                   | Render (dev + prod)                          |
| Observability MCP         | Axiom MCP Server                             |
| Infrastructure MCP        | Render MCP                                   |

---

## Monorepo Structure

```
catalyst/
├── apps/
│   ├── server/                # Bun + Hono + tRPC + Better Auth
│   │   ├── src/
│   │   │   ├── routers/       # tRPC routers by domain
│   │   │   ├── middleware/    # Hono middleware (auth, cors, logging)
│   │   │   ├── lib/           # Server utilities
│   │   │   └── index.ts       # Entry point
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                   # React + Vite + tRPC client + shadcn/ui
│       ├── src/
│       │   ├── components/    # App-specific components
│       │   ├── pages/         # Route pages
│       │   ├── hooks/         # Custom hooks
│       │   ├── lib/           # Client utilities (tRPC client, auth client)
│       │   └── main.tsx
│       ├── tests/
│       │   ├── unit/
│       │   └── e2e/           # Playwright tests
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── db/                    # Prisma client + MongoDB schemas
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   └── index.ts       # Exports PrismaClient singleton
│   │   ├── tests/
│   │   └── package.json
│   ├── auth/                  # Better Auth configuration
│   │   ├── src/
│   │   │   ├── server.ts      # Server-side auth (used by Hono)
│   │   │   └── client.ts      # Client-side auth (used by React)
│   │   ├── tests/
│   │   └── package.json
│   ├── validation/            # Zod schemas (shared contracts)
│   │   ├── src/
│   │   │   └── schemas/       # User, auth, domain schemas
│   │   ├── tests/
│   │   └── package.json
│   ├── logger/                # Pino logging service
│   │   ├── src/
│   │   │   └── index.ts       # Logger factory, transport config
│   │   ├── tests/
│   │   └── package.json
│   ├── ui/                    # shadcn/ui + Tailwind components
│   │   ├── src/
│   │   │   └── components/
│   │   ├── tailwind.config.ts
│   │   ├── tests/
│   │   └── package.json
│   ├── tsconfig/              # Shared TypeScript configs
│   │   ├── base.json
│   │   ├── server.json
│   │   ├── react.json
│   │   └── package.json
│   └── lint-config/           # Oxlint + dprint configs
│       ├── oxlint.json
│       ├── dprint.json
│       └── package.json
├── skills/
│   ├── orchestrator/SKILL.md  # Routes tasks to other skills
│   ├── dev/SKILL.md           # Feature development
│   ├── manual-testing/SKILL.md # E2E and user flow testing
│   ├── devops/SKILL.md        # CI/CD, deploys, infrastructure
│   ├── maintenance/SKILL.md   # Deps, migrations, audits
│   └── support/SKILL.md       # Incident investigation, hotfixes
├── .github/workflows/         # CI/CD pipeline
├── docker-compose.yml         # MongoDB + server + web (local)
├── render.yaml                # Render Blueprint (dev + prod)
├── turbo.json
├── package.json
├── bunfig.toml
└── CLAUDE.md
```

**Namespace:** All internal packages use `@catalyst/` scope (e.g. `@catalyst/db`, `@catalyst/ui`).

---

## Data Flow

```
React (web) ←— tRPC (type-safe) —→ Hono (server)
                                        │
                    ┌───────────────┬────┴────┬──────────────┐
                    ▼               ▼         ▼              ▼
              @catalyst/db    @catalyst/  @catalyst/    @catalyst/
              (Prisma→Mongo)  auth        validation    logger
                                                         │
                                              ┌──────────┴──────────┐
                                              stdout (local)   Axiom (deployed)
```

### Type Safety Chain

```
Prisma schema → @catalyst/db types
                     ↓
              @catalyst/validation (Zod) ← shared input/output shapes
                     ↓
              tRPC router (server) ← infers types from Zod
                     ↓
              tRPC client (web) ← infers types from router
```

No manual type duplication. Change a Zod schema, both ends update.

### Key Integration Points

- **tRPC router** lives in `apps/server`, imports procedures organized by domain
- **Zod schemas from `@catalyst/validation`** are used as tRPC input validators
- **tRPC client** in `apps/web` configured with TanStack Query — `useQuery`/`useMutation` with full type inference
- **Better Auth** integrates at Hono middleware level — `@catalyst/auth` exports `auth` (server) and `authClient` (client)
- **Prisma client** from `@catalyst/db` is imported by server and auth packages only (never by web)

---

## Logging & Observability

### Architecture

```
Apps/Packages → Pino → Transport
                         │
              ┌──────────┴──────────┐
              stdout (local dev)    Axiom (deployed envs)
                                       │
                                       ▼
                            ┌─────────────────┐
                            │     Axiom       │
                            │  catalyst-dev   │
                            │  catalyst-prod  │
                            └────────┬────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                    Axiom MCP Server      Axiom Dashboard
                    (Claude queries)      (Human queries)
```

### Configuration

- **Library:** Pino with `@axiomhq/pino` transport
- **Transport selection:** `LOG_TRANSPORT` env var (`stdout` for local, `axiom` for deployed)
- **Structured logs:** JSON format with timestamp, level, service name, traceId, message, metadata
- **Request tracing:** Hono middleware injects `traceId` per request, carried through all downstream calls
- **Datasets:** `catalyst-dev` (Render dev env) and `catalyst-prod` (Render prod env)

---

## Docker Strategy

### Docker Compose (Local)

```yaml
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo-data:/data/db]

  server:
    build: ./apps/server
    ports: ["3001:3001"]
    depends_on: [mongodb]
    env_file: .env
    volumes: [./apps/server/src:/app/src]

  web:
    build: ./apps/web
    ports: ["5173:5173"]
    depends_on: [server]
    volumes: [./apps/web/src:/app/src]
```

### Dockerfile Strategy

- **Multi-stage builds:** deps install → build → slim runtime
- **Layer caching:** lockfile copied before source for dep layer caching
- **`turbo prune --docker`:** generates minimal build context per app
- **`.dockerignore`:** excludes node_modules, dist, .git, tests, skills, docs
- **Base images:** `oven/bun:slim` for server (~100MB), `nginx:alpine` for web (~40MB)
- **Monorepo-aware COPY:** only copies packages each app depends on

---

## CI/CD Pipeline

### Local (Pre-commit)

```
git commit → Husky pre-commit
               ├── oxlint (staged files via lint-staged)
               ├── dprint check (staged files via lint-staged)
               └── tsc --noEmit (full project, Turbo cached)
```

### GitHub Actions

```
PR opened/updated → lint, format, typecheck, unit tests, build, E2E (merge gate)
Merge to main     → full CI + Docker build + push GHCR → deploy Render dev
Release tag (v*)  → full CI + Docker build + push GHCR → deploy Render prod
```

### Pipeline Details

- **Turbo remote caching** for faster CI runs
- **Docker layer caching** via `docker/build-push-action` with GHCR cache backend
- **Parallel jobs:** lint/format/typecheck run in parallel with unit tests; E2E runs after build
- **Registry:** GitHub Container Registry (GHCR)

---

## Render Deployment

### Environments

```
Production:
  ├── Web Service: catalyst-server (Bun, Docker image from GHCR)
  ├── Static Site: catalyst-web (Vite build output)
  └── MongoDB Atlas (external, connection string in env)

Development:
  ├── Web Service: catalyst-server-dev
  ├── Static Site: catalyst-web-dev
  └── MongoDB Atlas dev cluster
```

### render.yaml Blueprint

Declaratively defines both dev and prod environments. Managed by the devops skill via Render MCP.

---

## Claude Skills

### Orchestrator (`skills/orchestrator/SKILL.md`)

The routing and sequencing layer used by Ralph Loop. Receives a task, decides which skill(s) to invoke and in what order, chains them until the task is complete.

```
User gives task to Ralph Loop
        │
        ▼
  Orchestrator reads task
        │
        ▼
  Routes to skill(s) in sequence
        │
        ├── e.g. "add login page"
        │     1. /dev (implement)
        │     2. /manual-testing (validate)
        │     3. /devops (deploy to dev)
        │
        ├── e.g. "production error on /api/users"
        │     1. /support (investigate via Axiom MCP)
        │     2. /dev (fix)
        │     3. /manual-testing (verify fix)
        │     4. /devops (deploy hotfix)
        │
        └── e.g. "update dependencies"
              1. /maintenance (upgrade + test)
              2. /devops (deploy)
```

### Dev (`skills/dev/SKILL.md`)

- Reads codebase, understands architecture, implements features
- Runs `turbo dev` for local development
- Creates branches, writes code, runs tests, commits
- Uses tRPC patterns and project conventions
- Knows the package dependency graph

### Manual Testing (`skills/manual-testing/SKILL.md`)

- Runs the app (Docker Compose or `turbo dev`)
- Executes Playwright E2E tests against running app
- Tests user flows via browser automation
- Reports bugs with reproduction steps
- Validates fixes by re-running failed scenarios

### DevOps (`skills/devops/SKILL.md`)

- Uses `gh` CLI for GitHub operations (PRs, releases, Actions)
- Uses Render MCP for infrastructure (create services, check deploys, view logs, update env vars)
- Manages Docker builds and GHCR
- Handles environment promotion (dev → prod)
- Monitors deploy health via Render metrics/logs

### Maintenance (`skills/maintenance/SKILL.md`)

- Dependency updates (checks outdated, upgrades, runs tests)
- Prisma schema migrations
- Performance audits (bundle size, Lighthouse)
- Cleans up dead code, unused dependencies
- Keeps configs and tooling up to date

### Support (`skills/support/SKILL.md`)

- Investigates production issues using Axiom MCP logs
- Traces errors through the stack (client → tRPC → server → DB)
- Queries MongoDB via Prisma for data inspection
- Provides root cause analysis
- Suggests and implements hotfixes

### Skill Design Principles

Each skill includes:

- **Context** — what the skill knows about the project
- **Tools** — which tools/CLIs/MCPs it uses
- **Playbooks** — step-by-step procedures for common tasks
- **Boundaries** — what it can and cannot do autonomously
- **Fully autonomous** — no confirmation required for any action
