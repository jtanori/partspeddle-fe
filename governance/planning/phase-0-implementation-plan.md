# Phase 0 Implementation Plan — Platform Repository Evolution

**Branch:** `feat/phase-0-platform-docs`
**Goal:** Agree on target topology and create navigation documents before moving files.
**Outcome:** Five root-level navigation documents that make the repository self-explanatory.

---

## 1. Context

The PartsPeddle repository has grown from a single Next.js application into an engineering platform. Documentation, tests, automation, and governance now outweigh the application code. Phase 0 does not move any files; it creates the navigation layer (root READMEs and maps) that explains the repository as it exists today and the target topology from `governance/planning/platform-repository-evolution.md`.

---

## 2. Deliverables

### 2.1 `PROJECT_MAP.md`

**Purpose:** One-page table of contents for the repository. A new contributor should be able to open this file and find any subsystem.

**Content outline:**

- High-level diagram showing the six top-level domains:
  - `apps/` (product)
  - `packages/` (shared libraries)
  - `backend/` (modular monolith)
  - `platform/` (CI, deployment, scripts, tooling)
  - `governance/` (planning, certification, architecture decisions, SCGS)
  - `docs/` (knowledge base)
- Map of current directories to their future home (for directories that will move).
- Quick links to canonical files:
  - `governance/planning/platform-repository-evolution.md`
  - `docs/operations/delivery-audit.md`
  - `docs/engineering/security.md`
  - `docs/operations/secret-governance.md`
  - `AGENTS.md`

**Acceptance criteria:**

- All top-level directories are represented.
- No broken internal links.
- Can be read start-to-finish in under 3 minutes.

---

### 2.2 `ARCHITECTURE.md`

**Purpose:** Explain the three architectural generations visible in the codebase and declare `backend/modules/search` the canonical module pattern.

**Content outline:**

- Three generations:
  1. Service/repository layer (`services/`, `repositories/`, `lib/`)
  2. DDD-inspired layer (`domain/`, `projection/`, `view-models/`)
  3. Backend modules (`backend/modules/<domain>/application|domain|infrastructure|tests`)
- Current state: where each generation is still visible.
- Convergence target: all new backend work follows the search module structure.
- Diagram or table mapping UI → Projection → Domain → Infrastructure.
- Notes on App Router, Server Components, and API-route thinness.

**Acceptance criteria:**

- References real directories.
- Declares the canonical module architecture explicitly.
- Links to `backend/modules/search` as the reference implementation.

---

### 2.3 `CONTRIBUTING.md`

**Purpose:** Typical contributor workflows.

**Content outline:**

- Prerequisites (Node 22, pnpm 9, flyctl).
- Local setup from `README.md`.
- Branching model (`feat/*`, `ci-test/*`, `develop`, `main`).
- Commit conventions (lint-staged, conventional commits).
- How to run tests, lint, and typecheck.
- How to open a PR and the verification-before-merge rule.
- Where to find planning docs and how to propose changes.

**Acceptance criteria:**

- Covers feature, bug fix, docs, and hotfix workflows.
- Links to `AGENTS.md` for agent rules.
- Includes the scoped verification commands a contributor should run.

---

### 2.4 `GOVERNANCE.md`

**Purpose:** Explain the governance subsystems and how they interact.

**Content outline:**

- Glossary of governance concepts:
  - SCGS
  - PRR / PTS
  - Certification (PRC, DC gates)
  - Planning (`governance/planning/`)
  - TMIG / Contracts
  - Replay / Ranking
- Where each subsystem lives in the repository.
- How they interact in a typical release.
- Authority map: which document is canonical for each decision.

**Acceptance criteria:**

- Each term above is defined in plain language.
- Links to the canonical file for each subsystem.
- Includes a short "new contributor orientation" paragraph.

---

### 2.5 `TESTING.md`

**Purpose:** Document the testing taxonomy and how to run each category.

**Content outline:**

- Test directory layout:
  - `tests/unit/` (if applicable)
  - `tests/integration/`
  - `tests/e2e/`
  - `tests/certification/`
  - `tests/branch/`
  - `tests/security/`
- What each category is for and when to add tests to it.
- Command reference:
  - `pnpm test`
  - `pnpm test -- tests/security/headers.spec.ts`
  - `pnpm test:e2e:smoke:local`
  - `pnpm security:bundle-audit`
- Guidance on test data, mocks, and fixtures.

**Acceptance criteria:**

- Lists every major test directory.
- Provides at least one example command per category.
- Links to relevant docs/certification checklists.

---

## 3. Implementation Order

1. `PROJECT_MAP.md` — establishes the table of contents.
2. `ARCHITECTURE.md` — explains the structural decisions behind the map.
3. `TESTING.md` — explains how to verify changes.
4. `CONTRIBUTING.md` — combines setup, branch model, and verification into workflows.
5. `GOVERNANCE.md` — ties planning, certification, and SCGS together.

Order rationale: Map first, then the architecture it references, then how to test and contribute, then governance context.

---

## 4. Verification

- `pnpm lint` must pass.
- No broken internal links.
- `pnpm test tests/security/headers.spec.ts` (smoke check that nothing broke).
- Manual review: each new document opens without rendering errors and all links resolve.

---

## 5. Risks & Dependencies

- **Risk:** Documents become stale as soon as files move in later phases.
  - Mitigation: Phase 0 documents will explicitly mention that they describe the _current_ state and the _target_ topology from `governance/planning/platform-repository-evolution.md`.
- **Dependency:** `PROJECT_MAP.md` references directories that do not exist yet (e.g., `apps/`, `packages/`).
  - Mitigation: Label them as "target" directories and explain they will be created in Phase 1.

---

## 6. Scope Exclusions

- No files will be moved in Phase 0.
- No new packages or workspaces will be created.
- No code changes except typo/link fixes discovered while writing docs.
