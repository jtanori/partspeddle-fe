# Platform Repository Evolution

**Status:** Planning — target topology defined; phased migration pending prioritization.  
**Goal:** Evolve the PartsPeddle repository from a single Next.js application into a platform repository with clear boundaries between product code, governance, engineering tooling, documentation, and operations.

---

## Context

The repository has grown organically into an engineering platform:

- ~500 files across application, governance, documentation, planning, CI, certification, and automation.
- Documentation + testing + automation now outweigh the application itself.
- Multiple architectural generations coexist (service layer → DDD → backend modules).
- The search module (`backend/modules/search`) has emerged as the canonical architectural pattern.

The repository needs an explicit organizational layer that separates:

> **application** from **engineering platform**.

---

## Target Topology

```text
/
├── README.md                    # Project entry point
├── PROJECT_MAP.md               # Repository table of contents
├── ARCHITECTURE.md              # High-level architecture
├── CONTRIBUTING.md              # Contributor workflow
├── GOVERNANCE.md                # Governance subsystem overview
├── TESTING.md                   # Testing philosophy and taxonomy
├── package.json                 # Root workspace manifest (pnpm workspaces)
├── pnpm-workspace.yaml          # Workspace definition
│
├── apps/
│   └── web/                     # Next.js 16 + App Router application
│       ├── src/
│       ├── public/
│       ├── next.config.ts
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── shared/                  # Shared utilities, hooks, helpers
│   ├── contracts/               # Operational contracts (health, delivery, etc.)
│   ├── types/                   # Cross-cutting type definitions
│   ├── sdk/                     # Client/server SDKs
│   └── config/                  # Shared ESLint, TS, Tailwind configs
│
├── backend/
│   └── modules/                 # Modular monolith
│       ├── search/              # Canonical reference module
│       ├── listing/
│       ├── seller/
│       ├── catalog/
│       ├── taxonomy/
│       ├── ai/
│       └── ...
│
├── platform/
│   ├── scripts/                 # Automation and operational scripts
│   ├── ci/                      # GitHub Actions workflows
│   ├── docker/                  # Dockerfiles and compose files
│   ├── deployment/              # Fly.io, Supabase deploy configs
│   ├── generators/              # Code generators
│   └── tooling/                 # Husky, lint-staged, commitlint configs
│
├── governance/
│   ├── scgs/                    # SCGS subsystem (currently .scgs)
│   ├── planning/                # Planning documents (currently .planning)
│   ├── certification/           # Certification artifacts and evidence
│   ├── architecture/            # Architecture decision records and models
│   └── decisions/               # ADRs
│
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── engineering/
│   ├── operations/
│   ├── design/
│   ├── api/
│   ├── decisions/               # ADRs (mirrored from governance/decisions)
│   ├── guides/
│   ├── onboarding/
│   └── reference/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── certification/
│   ├── governance/
│   ├── performance/
│   ├── regression/
│   ├── fixtures/
│   └── helpers/
│
└── artifacts/
    ├── coverage/
    ├── certification/
    ├── reports/
    └── benchmarks/
```

---

## Guiding Principles

1. **Convergence over churn.** Declare `backend/modules/search` the canonical module architecture. All new backend development follows it. Existing areas migrate incrementally as they are touched.
2. **Product vs. platform separation.** Application code lives under `apps/`. Engineering tooling, CI, deployment, and governance live under `platform/` and `governance/`.
3. **Feature ownership.** Components, hooks, and view-models cluster around features rather than living in a flat `components/` directory.
4. **Generated artifacts isolated.** Reports, coverage, traces, and benchmarks live in `artifacts/`, never alongside authored content.
5. **Self-documenting structure.** Each top-level directory has a `README.md`. Navigation documents at root explain the repository.

---

## Preparation (must complete before full platform migration)

These two items must land before the large-scale repository reorganization begins. Each is implemented in its own branch and merged via a dedicated PR.

### Prep 1 — Fix CSP security

**Goal:** Remove the temporary `'unsafe-inline'` relaxation from production CSP and replace it with a nonce-based App Router CSP.

**Branch:** `feat/prep-nonce-based-csp`  
**PR:** One dedicated PR.

**Implementation:**

- Generate a unique nonce per request in `middleware.ts`.
- Set `Content-Security-Policy` via middleware so it includes `script-src 'nonce-<value>' 'self'`.
- Remove CSP from `src/lib/security-headers.ts` (other security headers can stay in `next.config.ts`).
- Let Next.js App Router detect the nonce from the response header and apply it to inline Flight bootstrap scripts automatically.
- Update `tests/security/headers.spec.ts` and `tests/branch/p5-6-frontend-client-security/frontend-security.test.ts` to assert:
  - Production CSP does not contain `'unsafe-inline'` for scripts.
  - Production CSP contains a `nonce-` token.
  - `'unsafe-eval'` is still absent.
- Verify hydration works in staging and production.

**Acceptance criteria:**

- Production CSP does not contain `'unsafe-inline'` for `script-src`.
- Browser console shows no CSP violations for Next.js inline scripts.
- Every page hydrates correctly.
- All security tests pass.
- Smoke tests pass after deployment.

### Prep 2 — Update documentation with all introduced changes

**Goal:** Synchronize documentation with the delivery certification work, CSP changes, production promotion, and planning cleanup that have already landed.

**Branch:** `feat/prep-update-docs`  
**PR:** One dedicated PR.

**Implementation:**

- Update `docs/operations/delivery-audit.md` to reflect completed DC gates and the successful production promotion.
- Update or create `docs/operations/deployment-observability.md` describing the deployment artifact format and location.
- Update `config/environment/README.md` if production secret provisioning changed.
- Update `docs/operations/secret-governance.md` to document the GitHub `production` environment Algolia secrets.
- Add a note about the temporary CSP relaxation and the nonce-based target to `docs/engineering/security.md` (or create it).
- Update root `README.md` if it references stale paths like `.planning/master-plan.md`.
- Ensure `docs/PRC.md` Section 11 links to current security test locations.

**Acceptance criteria:**

- No broken internal documentation links.
- Docs accurately describe the current delivery pipeline, CSP state, and secret governance.
- A new contributor can read the root `README.md` and find the correct planning and operations docs.
- `pnpm test` and `pnpm lint` still pass.

---

## Phases

### Phase 0 — Decision and documentation

**Goal:** Agree on target topology and create navigation documents before moving files.

- [ ] Finalize this plan and get operator approval.
- [ ] Create `PROJECT_MAP.md` at repository root.
- [ ] Create `ARCHITECTURE.md` describing the three architectural generations and convergence target.
- [ ] Create `CONTRIBUTING.md` with typical workflows.
- [ ] Create `GOVERNANCE.md` explaining SCGS, certification, planning, and contracts.
- [ ] Create `TESTING.md` documenting test taxonomy.

### Phase 1 — Workspace scaffolding

**Goal:** Introduce pnpm workspaces and the new top-level directories without moving application code.

- [ ] Add `pnpm-workspace.yaml` referencing `apps/*` and `packages/*`.
- [ ] Create empty target directories with `README.md` files.
- [ ] Move shared config into `packages/config`.
- [ ] Update root `package.json` to reference workspace packages.
- [ ] Ensure CI still passes.

### Phase 2 — Application extraction

**Goal:** Move the Next.js application into `apps/web/`.

- [ ] Move `src/app`, `src/components`, `src/assets`, `src/lib` (application code) to `apps/web/src/`.
- [ ] Move `public/`, `next.config.ts`, `Dockerfile` to `apps/web/`.
- [ ] Update import aliases and `tsconfig.json`.
- [ ] Move root config files that belong to the app (`next.config.ts`, `instrumentation.ts`).
- [ ] Update CI paths and scripts.
- [ ] Verify build, test, lint, and deploy still work.

### Phase 3 — Backend modularization

**Goal:** Promote the modular monolith pattern and migrate existing backend code.

- [ ] Keep `backend/modules/search` as the reference.
- [ ] Create `backend/modules/listing`, `backend/modules/seller`, `backend/modules/catalog`, etc.
- [ ] Migrate existing `services/`, `repositories/`, `domain/` code into appropriate modules incrementally.
- [ ] Define clear module structure:
  ```text
  backend/modules/<name>/
  ├── application/
  ├── domain/
  ├── infrastructure/
  ├── tests/
  │   ├── contract/
  │   ├── integration/
  │   ├── performance/
  │   └── resilience/
  └── contract/
  ```
- [ ] Ensure API routes remain thin adapters over application services.

### Phase 4 — Platform consolidation

**Goal:** Move engineering tooling and automation under `platform/`.

- [ ] Move `scripts/` → `platform/scripts/` with subdirectories:
  - `bootstrap/`, `ci/`, `deployment/`, `maintenance/`, `generators/`, `certification/`, `migration/`, `tooling/`, `dev/`.
- [ ] Move `.github/workflows` → `platform/ci/workflows` (if supported by GitHub; otherwise keep `.github/workflows` as symlink or thin wrappers).
- [ ] Move `fly/`, `Dockerfile`, `.dockerignore` → `platform/docker/` and `platform/deployment/`.
- [ ] Move Husky/lint-staged configs → `platform/tooling/`.
- [ ] Update all scripts and CI to reference new paths.

### Phase 5 — Governance consolidation

**Goal:** Move governance subsystems under `governance/`.

- [ ] Move `.scgs/` → `governance/scgs/`.
- [ ] Move `.planning/` (active + archived) → `governance/planning/`.
- [ ] Move certification evidence and artifacts → `governance/certification/`.
- [ ] Move architecture docs and ADRs → `governance/architecture/` and `governance/decisions/`.
- [ ] Update any hard-coded paths in scripts or CI.

### Phase 6 — Documentation restructure

**Goal:** Turn `docs/` into a structured knowledge base.

- [ ] Split `docs/` into:
  - `docs/architecture/`
  - `docs/product/`
  - `docs/engineering/`
  - `docs/operations/`
  - `docs/design/`
  - `docs/api/`
  - `docs/decisions/` (ADRs)
  - `docs/guides/`
  - `docs/onboarding/`
  - `docs/reference/`
- [ ] Create `docs/README.md` as the knowledge-base index.
- [ ] Move or archive overlapping documents.

### Phase 7 — Test taxonomy

**Goal:** Reorganize tests by intent.

- [ ] Move `tests/c0_8/` → `tests/unit/` or `tests/integration/` as appropriate.
- [ ] Move `tests/e2e/` → `tests/e2e/`.
- [ ] Move `tests/certification/` → `tests/certification/`.
- [ ] Move `tests/security/` → `tests/governance/` or `tests/certification/`.
- [ ] Move `tests/branch/` → `tests/regression/` or dissolve into feature/module tests.
- [ ] Create `tests/fixtures/` and `tests/helpers/`.
- [ ] Update CI test commands and scripts.

### Phase 8 — Engineering Manual

**Goal:** Create a single onboarding document that explains the entire engineering ecosystem.

- [ ] Create `docs/onboarding/ENGINEERING_MANUAL.md` covering:
  - What the project is.
  - How the architecture is organized.
  - What each governance subsystem does (SCGS, PRR, PTS, certification, replay, TMIG, contracts).
  - How they interact.
  - Which documents are authoritative.
  - Typical workflows (feature, bug fix, release, certification).

### Phase 9 — Cleanup and verification

**Goal:** Remove root clutter and verify everything works.

- [ ] Ensure root only contains:
  ```text
  README.md
  package.json
  pnpm-workspace.yaml
  apps/
  packages/
  backend/
  platform/
  governance/
  docs/
  tests/
  artifacts/
  configs/
  ```
- [ ] Remove stale top-level files and directories.
- [ ] Run full CI pipeline.
- [ ] Run delivery certification smoke tests.
- [ ] Update `.gitignore` for new artifact locations.

---

## Acceptance Criteria

- [ ] Repository root contains only the agreed top-level directories and navigation documents.
- [ ] `apps/web/` builds, tests, lints, and deploys successfully.
- [ ] `backend/modules/search` remains the reference architecture for new modules.
- [ ] All CI workflows pass.
- [ ] All certification tests pass.
- [ ] New contributors can orient themselves using `PROJECT_MAP.md` and `ENGINEERING_MANUAL.md`.
- [ ] Generated artifacts are isolated in `artifacts/`.

---

## Dependencies

- **Blocked by:**
  - **Prep 1 (CSP security)** must be complete before any Phase 2+ application moves.
  - **Prep 2 (documentation update)** must be complete before Phase 0 navigation documents are finalized.
- **Blocks:** Large-scale file moves until approved.
- **Related:** Prep 1 replaces the deferred P5.6 CSP hardening follow-up.

---

## Risks

- **Large-scale moves create merge conflicts.** Prefer incremental migration per phase.
- **CI path updates are error-prone.** Audit every script and workflow after each phase.
- **Import aliases may break.** Use automated refactor tools or codemods.
- **Documentation links rot.** Run a link checker after docs restructure.
- **SCGS and governance tools may have hard-coded paths.** Search for `.scgs/`, `.planning/`, `scripts/`, `docs/` references before moving.

---

## Recommendation

Start with **Prep 1** and **Prep 2** immediately. CSP security must be restored before the platform migration begins, and documentation must reflect the current state before navigation documents are written. Once both prep items are merged, execute Phase 0, then proceed through phases in order with a verifying CI run after each.
