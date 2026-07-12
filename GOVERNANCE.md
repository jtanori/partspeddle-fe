# Governance — PartsPeddle / VinTrack

This document explains the governance subsystems used by the project, where they live, and how they interact.

---

## New contributor orientation

PartsPeddle has several overlapping governance concepts. They exist because the project is moving from a simple application to an operationally certified platform. The short version:

- **Planning** decides what to build and when.
- **Architecture** decides how to structure it.
- **SCGS** validates that changes do not break semantic contracts.
- **Certification** proves the system is ready for production.
- **Contracts** encode operational guarantees between subsystems.

If you only remember one thing: **the canonical plan is in `governance/planning/`, the canonical checklist is `docs/guides/prc.md`, and the canonical delivery descriptor is `platform/operations/delivery/manifests/delivery.manifest.json`.**

---

## Glossary

### SCGS — Semantic Change Governance System

**Purpose:** Detect, record, and validate semantic changes across the codebase so that refactors and feature work do not silently break contracts.

**What it covers:**

- Compilation and AST analysis
- Governance policies
- Replay validation
- Ranking telemetry
- Diff engine

**Where it lives:** `governance/scgs/`.

**When to care:** When you rename a public API, change a search ranking rule, or modify a domain type that is replayed or projected.

### PRR — Pre-Release Review

**Purpose:** A structured review gate before a release is promoted.

**Where it lives:** Review templates in `docs/review-templates/`.

**When to care:** When opening a `develop → main` promotion PR.

### PTS — Production Test Specification

**Purpose:** Defines the tests that must pass before a release is considered production-ready.

**Where it lives:** Embedded in `docs/guides/prc.md` and `tests/certification/`.

**When to care:** When adding a new certification gate or changing production-readiness criteria.

### Certification (PRC / DC)

**Purpose:** Formal evidence that the system meets production standards.

- **PRC** — Production Readiness Certification. The master checklist is `docs/guides/prc.md`.
- **DC** — Delivery Certification. Tracks the CI/CD pipeline, deployment, and operational gates. Recent evidence is in `docs/operations/delivery-audit.md` and `artifacts/delivery/`.

**Where it lives:**

- Checklist: `docs/guides/prc.md`
- Audit: `docs/operations/delivery-audit.md`
- Evidence: `governance/certification/evidence/`, `governance/certification/reports/`, `artifacts/`

**When to care:** Before every `develop → main` promotion and after any infrastructure change.

### Planning

**Purpose:** Long-term and near-term technical planning.

**Where it lives:** `governance/planning/`.

Key files:

- `governance/planning/platform-repository-evolution.md` — platform migration plan.
- `governance/planning/phase-0-implementation-plan.md` — current phase plan.
- `governance/planning/session-checkpoint.md` — current session state and next steps.

**When to care:** When starting a new initiative or proposing a large refactor.

### TMIG — Technical Migration Governance

**Purpose:** Tracks migrations that affect multiple subsystems and ensures they are completed safely.

**Where it lives:** Planning documents and ADRs.

**When to care:** When introducing a migration that must happen in stages (e.g., moving services into backend modules).

### Contracts

**Purpose:** Operational guarantees between subsystems. Examples include health contracts, API contracts, and search sync contracts.

**Where it lives:**

- `operations/delivery/manifests/delivery.manifest.json`
- `src/backend/modules/search/contract/`
- `docs/engineering/api-security.md`

**When to care:** When two subsystems exchange data or depend on each other's behavior.

### Replay

**Purpose:** Re-run historical inputs through a changed system to prove behavior is preserved.

**Where it lives:** `governance/scgs/replay/` and `platform/scripts/scgs/replay-validate.ts`.

**When to care:** When refactoring search ranking, pricing logic, or any deterministic transformation with historical inputs.

### Ranking

**Purpose:** Score and order search results according to business rules.

**Where it lives:** `apps/web/src/backend/modules/search/domain/ranking/` and `apps/web/src/domain/specification/scgs/ranking/`.

**When to care:** When changing how listings appear in search.

---

## How governance interacts in a release

```text
Planning (governance/planning/)
  ↓
Implementation (src/)
  ↓
SCGS validation (governance/scgs/, replay, diff)
  ↓
Test & certification (tests/, docs/guides/prc.md)
  ↓
PRR / PTS review
  ↓
Delivery (operations/delivery/manifests/delivery.manifest.json)
  ↓
Deployment (GitHub Actions, Fly.io, Supabase)
  ↓
Observability & artifacts (artifacts/delivery/)
```

Not every change triggers every gate. A small bug fix goes through tests and PR review. A large refactor also triggers SCGS replay and certification evidence updates.

---

## Authority map

| Decision type           | Canonical source                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| What to build next      | `governance/planning/platform-repository-evolution.md`                                                    |
| How to structure code   | `ARCHITECTURE.md` + `src/backend/modules/search/`                                                         |
| Is it production ready? | `docs/guides/prc.md` + `docs/operations/delivery-audit.md`                                                |
| Where do secrets go?    | `docs/operations/secret-governance.md`                                                                    |
| How to deploy           | `docs/operations/deployment-runbook.md` + `platform/operations/delivery/manifests/delivery.manifest.json` |
| What tests must pass    | `TESTING.md` + `tests/certification/`                                                                     |
| Agent rules             | `AGENTS.md`                                                                                               |

---

## Contributing to governance

- Propose planning changes by editing or adding a document in `governance/planning/` and opening a PR.
- Propose architecture changes by adding an ADR in `governance/decisions/`.
- Update `docs/guides/prc.md` when a certification gate changes.
- Update `docs/operations/delivery-audit.md` when the CI/CD pipeline changes.

---

## Related documents

- `PROJECT_MAP.md` — repository navigation.
- `ARCHITECTURE.md` — structural decisions.
- `CONTRIBUTING.md` — contributor workflows.
- `docs/guides/prc.md` — production readiness checklist.
- `docs/operations/delivery-audit.md` — delivery audit.
