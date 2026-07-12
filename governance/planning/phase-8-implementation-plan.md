# Phase 8 — Engineering Manual

**Goal:** Create `docs/onboarding/ENGINEERING_MANUAL.md`, a single authoritative entry point that explains the PartsPeddle engineering ecosystem to new contributors, operators, and agents.

**Branch:** `feat/phase-8-engineering-manual`

**Depends on:** Phase 0–7 completed and merged to `develop`; DC-7.1 merged.

---

## 1. Problem Statement

The repository has grown into an engineering platform with many subsystems:

- SCGS, PRC, PTS, PRR, TMIG, EGS, DC
- Modular backend architecture
- Governance, operations, certification, and planning artifacts
- Test taxonomy (unit, integration, e2e, certification, governance, performance, regression)

New contributors currently have to navigate `PROJECT_MAP.md`, `ARCHITECTURE.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `TESTING.md`, and scattered docs to understand how everything fits together. There is no single "operator's guide" that explains the ecosystem from a human perspective.

## 2. Deliverable

A single Markdown file:

```text
docs/onboarding/ENGINEERING_MANUAL.md
```

Plus minor navigation updates:

- `docs/onboarding/README.md` — add Engineering Manual as the first link.
- `PROJECT_MAP.md` — fix duplicate Phase 8 checklist entry; link to Engineering Manual from onboarding section.

## 3. Manual Structure

### Part I — Welcome

- What PartsPeddle / VinTrack is (one paragraph).
- Who this manual is for (new engineers, operators, agents).
- How to use this manual (start here, then follow links).
- Quick orientation: repository topology at a glance.

### Part II — Architecture

- The three architectural generations ( Generation 1 services/repositories, Generation 2 domain/projection, Generation 3 backend modules).
- The canonical module pattern (`backend/modules/search/` as reference).
- Data flow: UI → projection → application → domain → infrastructure.
- Next.js App Router conventions used in the project.
- Infrastructure at runtime (Fly.io, Supabase, Algolia, GitHub Actions).
- Links to `ARCHITECTURE.md`, `docs/engineering/next-app-router-architecture.md`, `docs/engineering/backend-modules.md`.

### Part III — Governance Ecosystem

Plain-language explanation of each subsystem and how they interact:

| Subsystem | Purpose | Authoritative Document / Location |
| --------- | ------- | --------------------------------- |
| SCGS | Semantic Change Governance System — compile-time analysis, replay, ranking telemetry | `governance/scgs/`, `docs/engineering/component-reachability.md` |
| PRC | Production Readiness Certification — gate before promotion | `docs/guides/prc.md` |
| PTS | Predictive Trust Score — quality signal used by SCGS/PRC | `governance/scgs/` |
| PRR | Production Readiness Review — human review process | `docs/guides/prc.md` |
| EGS | Engineering Governance System — constitutions and policies | `governance/` |
| DC | Delivery Certification — CI/CD, deploy, health, smoke gates | `docs/operations/delivery-audit.md` |
| TMIG | Technical Migration — phased repository evolution | `governance/planning/platform-repository-evolution.md` |

Include a simple interaction diagram:

```text
Feature work
    ↓
SCGS analysis + PTS score
    ↓
PRC checklist
    ↓
PRR (human review)
    ↓
DC pipeline (test, deploy, health, smoke)
    ↓
Merge / promotion
```

### Part IV — Repository Map

- What lives in each top-level domain.
- Where to put new code.
- Canonical files and why they matter.
- Links to `PROJECT_MAP.md`.

### Part V — Development Workflow

- Branch model (`develop` → feature branch → PR → `develop` → `main`).
- Commit conventions.
- Verification commands (`pnpm lint --cache`, `pnpm typecheck`, `pnpm test <scope>`, `pnpm delivery:manifest:validate`).
- Agent-assisted work rules (`AGENTS.md`).
- Pre-commit hooks (Husky / lint-staged).
- Links to `CONTRIBUTING.md`, `TESTING.md`, `AGENTS.md`.

### Part VI — Testing Philosophy

- Test taxonomy and when to use each bucket.
- How to run scoped tests.
- Certification and governance tests.
- Links to `TESTING.md` and `tests/README.md`.

### Part VII — Deployment & Operations

- Environments: local, staging (`stage.partspeddle.com`), production (`partspeddle.com`).
- Delivery pipeline overview.
- How to deploy (CI does it; local fallbacks exist but are not the primary path).
- Secret governance and drift checks.
- Key operational commands (`pnpm delivery:verify:env-drift`, `pnpm deploy:verify`, `pnpm env:validate`).
- Links to `docs/operations/deployment-runbook.md`, `docs/operations/delivery-audit.md`, `docs/operations/secret-governance.md`.

### Part VIII — Security & Compliance

- CSP (nonce-based).
- Secret handling rules.
- API security baseline.
- Where to find security checks.
- Links to `docs/engineering/security.md`, `docs/engineering/api-security.md`, `docs/operations/secret-governance.md`.

### Part IX — Common Tasks

Step-by-step recipes:

1. Start the app locally.
2. Add a new backend module.
3. Add a new page.
4. Add a new test.
5. Run a production access check.
6. Run an environment drift check.
7. Open and merge a PR (including billing-blocked CI workaround).

### Part X — Decision Records

- Where ADRs live (`governance/decisions/`, `docs/decisions/`).
- How to propose a new decision.
- Links to `governance/decisions/README.md`.

### Part XI — Glossary

Concise definitions of project-specific terms:

- Projection, bounded context, module, bounded context, PRC, DC, SCGS, PTS, PRR, EGS, TMIG, drift, artifact, contract.

### Part XII — Index of Authoritative Documents

A flat list of "if you need X, read Y" entries, grouped by role:

- New contributor
- Backend engineer
- Frontend engineer
- Operator / SRE
- Security engineer
- Agent

## 4. Out of Scope

- No new code or scripts.
- No changes to CI/CD workflows.
- No large-scale doc reorganization (Phase 6 already did that).
- No new tests except a possible simple link-check test if already available.

## 5. Verification Plan

1. `pnpm lint --cache` — must pass (0 errors).
2. `pnpm typecheck` — must pass.
3. `pnpm delivery:manifest:validate` — must pass.
4. Manual review of `docs/onboarding/ENGINEERING_MANUAL.md` for completeness and broken internal links.

## 6. Implementation Steps

1. Create `docs/onboarding/ENGINEERING_MANUAL.md` with the structure above.
2. Update `docs/onboarding/README.md` to link to the Engineering Manual first.
3. Fix duplicate Phase 8 entry in `PROJECT_MAP.md` and add link to Engineering Manual.
4. Run verification commands.
5. Commit, push, open PR, and merge (with `--admin` if CI is billing-blocked).

## 7. Success Criteria

- A new contributor can read `docs/onboarding/ENGINEERING_MANUAL.md` and understand the project's architecture, governance, workflows, and where to find authoritative docs without asking for help.
- All internal links point to existing files.
- Verification commands pass.
