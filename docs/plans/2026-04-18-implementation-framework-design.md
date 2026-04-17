# Implementation Framework — Design Document

**Date:** 2026-04-18
**Status:** Approved

## Overview

A universal 8-phase implementation lifecycle that every task goes through, driven by a new `/plan` skill that breaks work into tasks and an updated orchestrator that executes each task through all phases.

## The 8 Phases

Every task — feature, bug fix, refactor — goes through all 8 phases. No phase is ever skipped.

| # | Phase             | Description                                                                |
| - | ----------------- | -------------------------------------------------------------------------- |
| 1 | Product Research  | Read design doc, define acceptance criteria, understand the "why"          |
| 2 | UX Research       | Describe components, interactions, states, edge cases (text-based UX spec) |
| 3 | Architecture      | Define data models, API contracts, package structure for this task         |
| 4 | Dev               | Implement: backend + frontend code, i18n, validation                       |
| 5 | Manual Test & Fix | Run the app, test via Playwright, fix issues (iterates with Dev)           |
| 6 | Write Tests       | Add unit tests + E2E tests for what was built                              |
| 7 | Commit            | git add + commit (pre-commit hooks: lint, format, typecheck, i18n)         |
| 8 | CI Check          | git push, verify CI passes green via gh CLI                                |

## Phase Overlap Rules

- Architecture must complete before Dev starts
- Dev and Manual Test & Fix can iterate together (build → test → fix → test)
- CI Check is always last
- All other phases are sequential

## New Skill: `/plan`

Takes a high-level task, reads the relevant design doc, and produces a plan file.

### Input

A task description, e.g. "Build the customers module"

### Output

A markdown plan file at `docs/plans/YYYY-MM-DD-<topic>-plan.md`:

```markdown
# Plan: Customers Module

**Design doc:** docs/plans/2026-04-18-crm-design.md
**Created:** 2026-04-18
**Status:** in-progress

## Tasks

### 1. Add Customer and CustomerStatus models to Prisma schema

- [ ] Product Research
- [ ] UX Research
- [ ] Architecture
- [ ] Dev
- [ ] Manual Test & Fix
- [ ] Write Tests
- [ ] Commit
- [ ] CI Check

### 2. Build customer tRPC router (CRUD + status change)

- [ ] Product Research
- [ ] UX Research
- [ ] Architecture
- [ ] Dev
- [ ] Manual Test & Fix
- [ ] Write Tests
- [ ] Commit
- [ ] CI Check

### 3. Build customers kanban view

- [ ] Product Research
- [ ] UX Research
- [ ] Architecture
- [ ] Dev
- [ ] Manual Test & Fix
- [ ] Write Tests
- [ ] Commit
- [ ] CI Check
```

### Task Granularity

The plan skill decides granularity based on complexity:

- Large features → broken into component-level tasks (e.g. "kanban board", "table view", "drag-drop status change")
- Simple features → kept as one task
- Each task should be independently committable and testable

## Ralph Loop Integration

```
Ralph Loop starts
  → reads plan file
  → finds first unchecked task
  → passes task to orchestrator
  → orchestrator runs 8 phases
  → orchestrator checks off phases in plan file
  → orchestrator marks task complete
  → Ralph Loop moves to next task
  → repeat until all tasks done
```

## Phase Execution

### Who runs each phase

| Phase             | Executed by                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| Product Research  | Orchestrator inline — reads design doc, writes acceptance criteria      |
| UX Research       | Orchestrator inline — writes UX spec (components, interactions, states) |
| Architecture      | Orchestrator inline — defines data models, API contracts                |
| Dev               | `/dev` skill                                                            |
| Manual Test & Fix | `/manual-testing` skill                                                 |
| Write Tests       | `/dev` skill (test writing)                                             |
| Commit            | Orchestrator inline — git operations                                    |
| CI Check          | `/devops` skill — `gh run list`, verify green                           |

Phases 1-3 and 7 are lightweight enough for the orchestrator to handle directly. Only Dev, Manual Test, and CI Check delegate to specialized skills.

## Failure Handling

The orchestrator decides based on failure type:

| Failure Type       | Action                                                          |
| ------------------ | --------------------------------------------------------------- |
| Lint/format error  | Fix inline, retry Commit phase                                  |
| Type error         | Roll back to Dev, fix, re-run Manual Test → Tests → Commit → CI |
| E2E test failure   | Iterate Dev ↔ Manual Test until fixed                           |
| CI failure         | Investigate logs, fix, retry from Dev phase                     |
| Unclear root cause | Stop, report findings, wait for user input                      |

## Files to Create/Modify

- **NEW:** `skills/plan/SKILL.md` — the plan skill
- **MODIFY:** `skills/orchestrator/SKILL.md` — add 8-phase lifecycle, plan file reading, phase tracking
- **MODIFY:** `CLAUDE.md` — document the framework and `/plan` skill
