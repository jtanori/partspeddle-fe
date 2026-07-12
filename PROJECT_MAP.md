# Project Map — PartsPeddle / VinTrack

This file is the table of contents for the repository. If you are new to the project, start here.

---

## Repository at a glance

PartsPeddle is evolving from a single Next.js application into a **platform repository**: application code, shared packages, backend modules, governance, and operations tooling are being separated into distinct top-level domains.

Current state (today):

```text
partspeddle-fe/
├── apps/web/               # Next.js application
├── packages/               # Shared configuration
├── tests/                  # Test taxonomy (unit, integration, e2e, certification, governance, performance, regression)
├── docs/                   # Knowledge base
├── platform/               # CI, deployment, scripts, tooling, operations
│   ├── scripts/            # Automation and operational scripts
│   ├── operations/         # Delivery manifests, verification, recovery
│   ├── deployment/fly/     # Fly.io configuration
│   ├── docker/             # Dockerfile
│   ├── ci/                 # CI helpers
│   └── tooling/            # Husky and lint-staged configs
├── supabase/               # Migrations, edge functions, config
├── governance/planning/              # Roadmaps, plans, session checkpoint
├── governance/scgs/                  # SCGS governance subsystem
├── config/                 # Shared configuration (EGS, environment)
└── governance/certification/reports/ + artifacts/   # Generated outputs
```

Target topology (in progress):

```text
partspeddle-fe/
├── apps/
│   └── web/                # Next.js application (from src/app, src/components)
├── packages/               # Shared UI, types, contracts, config
├── backend/
│   └── modules/            # Modular monolith (search, listing, seller, ...)
├── platform/               # CI, deployment, scripts, tooling
├── governance/             # Planning, certification, architecture decisions, SCGS
├── docs/                   # Knowledge base
├── tests/                  # Test taxonomy
└── artifacts/              # Generated reports and deployment records
```

The migration is tracked in `governance/planning/platform-repository-evolution.md`.

---

## Navigation by concern

### I want to run the app locally

1. `README.md` — prerequisites and quick start.
2. `.env.example` — variables to copy into `.env.local`.
3. `package.json` — scripts.

### I want to understand the architecture

1. `ARCHITECTURE.md` — high-level structure and convergence target.
2. `src/backend/modules/search/` — canonical module architecture reference.
3. `docs/engineering/next-app-router-architecture.md` — App Router decisions.

### I want to contribute code

1. `CONTRIBUTING.md` — branch model, commits, verification commands.
2. `AGENTS.md` — rules for agent-assisted work.
3. `TESTING.md` — where to add tests.

### I want to deploy or operate the system

1. `docs/operations/deployment-runbook.md` — full deployment procedure.
2. `docs/operations/delivery-audit.md` — current CI/CD audit.
3. `docs/operations/deployment-observability.md` — deployment artifacts.
4. `docs/operations/secret-governance.md` — where secrets live.
5. `platform/operations/delivery/manifests/delivery.manifest.json` — canonical delivery descriptor.

### I want to understand governance

1. `GOVERNANCE.md` — glossary and interaction map.
2. `governance/planning/platform-repository-evolution.md` — platform migration plan.
3. `docs/guides/prc.md` — Production Readiness Certification checklist.
4. `governance/scgs/` — SCGS subsystem code and policies.

### I want to understand security

1. `docs/engineering/security.md` — CSP and application security.
2. `docs/engineering/api-security.md` — API security baseline.
3. `docs/operations/secret-governance.md` — secret storage policy.

---

## Directory reference

| Directory                            | Current purpose                                       | Future home (target)                                   |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| `src/app/`                           | Next.js App Router pages and API routes               | `apps/web/src/app/`                                    |
| `src/components/`                    | React components (247+)                               | `apps/web/src/components/` + `packages/ui/`            |
| `src/backend/`                       | Backend modules (`search`, future modules)            | `backend/modules/`                                     |
| `src/domain/`                        | Domain types and logic                                | Inside each `backend/modules/<domain>/domain/`         |
| `src/projection/`                    | Read models for UI pages                              | `apps/web/src/projection/` or `packages/shared/`       |
| `src/repositories/`                  | Data access layer                                     | Inside each `backend/modules/<domain>/infrastructure/` |
| `src/services/`                      | Legacy service layer                                  | Migrated into backend modules                          |
| `src/lib/`                           | Shared utilities and helpers                          | `packages/shared/`                                     |
| `src/hooks/`                         | React hooks                                           | `apps/web/src/hooks/` + `packages/shared/`             |
| `src/types/`                         | Cross-cutting TypeScript types                        | `packages/types/`                                      |
| `src/store/`                         | Client state management                               | `apps/web/src/store/`                                  |
| `tests/unit/`                        | Isolated tests for pure functions, domain logic, store slices | `tests/unit/`                                  |
| `tests/integration/`                 | API routes, repositories, modules, middleware, UI wiring | `tests/integration/`                            |
| `tests/e2e/`                         | Playwright browser smoke tests                       | `tests/e2e/`                                           |
| `tests/certification/`               | PRC/DC certification gates                           | `tests/certification/`                                 |
| `tests/governance/`                  | Security, architecture, policy, environment checks   | `tests/governance/`                                    |
| `tests/performance/`                 | Resilience, chaos, and load tests                    | `tests/performance/`                                   |
| `tests/regression/`                  | Backward-compatibility suites                        | `tests/regression/`                                    |
| `tests/fixtures/` + `tests/helpers/`| Shared test data and utilities                       | `tests/fixtures/` + `tests/helpers/`                   |
| `tests/`                             | Test taxonomy root                                   | `tests/`                                               |
| `docs/`                              | Knowledge base                                        | `docs/` (information architecture reorganized)         |
| `docs/engineering/`                  | How the system is built                               | `docs/engineering/`                                    |
| `docs/operations/`                   | How to run, deploy, and recover                       | `docs/operations/`                                     |
| `docs/product/`                      | Product and feature plans                             | `docs/product/`                                        |
| `docs/reference/`                    | Technical lookup material                             | `docs/reference/`                                      |
| `docs/guides/`                       | Certifications and integration playbooks              | `docs/guides/`                                         |
| `docs/decisions/`                    | ADR index                                             | `docs/decisions/`                                      |
| `docs/onboarding/`                   | New-contributor orientation                           | `docs/onboarding/`                                     |
| `platform/scripts/`                  | Automation, seeding, CI helpers                       | `platform/scripts/`                                    |
| `.github/workflows/`                 | GitHub Actions workflows (must stay at root)          | `.github/workflows/`                                   |
| `platform/deployment/fly/`           | Fly.io configuration                                  | `platform/deployment/fly/`                             |
| `platform/operations/`               | Delivery manifests and verification specs             | `platform/operations/`                                 |
| `governance/planning/`               | Roadmaps, plans, session checkpoint                   | `governance/planning/`                                 |
| `governance/scgs/`                   | SCGS governance subsystem                             | `governance/scgs/`                                     |
| `governance/architecture/`           | Architecture models and specifications                | `governance/architecture/`                             |
| `governance/decisions/`              | Architecture Decision Records (ADRs)                  | `governance/decisions/`                                |
| `governance/certification/evidence/` | Certification evidence and matrices                   | `governance/certification/evidence/`                   |
| `governance/certification/reports/`  | Generated audit and certification reports             | `governance/certification/reports/`                    |
| `artifacts/`                         | Deployment artifacts and benchmarks                   | `artifacts/`                                           |

---

## Canonical files

| File                                                            | Why it matters                                    |
| --------------------------------------------------------------- | ------------------------------------------------- |
| `AGENTS.md`                                                     | Operating rules for agent-assisted development.   |
| `governance/planning/platform-repository-evolution.md`          | Platform migration plan and target topology.      |
| `governance/planning/session-checkpoint.md`                     | Current session state and next steps.             |
| `platform/operations/delivery/manifests/delivery.manifest.json` | Canonical delivery descriptor.                    |
| `config/environment/schema.ts`                                  | Single source of truth for environment variables. |
| `artifacts/delivery/production-deployment-2026-07-11.json`      | Record of first production promotion.             |

---

## Status of platform migration

- [x] Prep 1 — nonce-based CSP implemented and merged.
- [x] Prep 2 — documentation synchronized with delivery certification.
- [x] Phase 0 — navigation documents.
- [x] Phase 1 — workspace scaffolding and directory creation.
- [x] Phase 2 — application extraction to `apps/web/`.
- [x] Phase 3 — backend modularization.
- [x] Phase 4 — platform consolidation (scripts, operations, fly, docker, tooling).
- [x] Phase 5 — governance consolidation.
- [x] Phase 6 — documentation restructure.
- [x] Phase 7 — test taxonomy.
- [ ] Phase 8 — engineering manual.
- [ ] Phase 8 — engineering manual.
