# A0 — Architecture Convergence & Platformization

**Status:** Planning complete — awaiting review before execution.  
**Previous plan:** `.planning/d0-delivery-infrastructure-stabilization.md` (approved, execution pending).  
**Scope:** Evolve the repository from a single Next.js application into a platform repository with clear boundaries between product code, governance, engineering tooling, documentation, and operations. Converge the three coexisting architectural generations around the `backend/modules/search` pattern.

---

## Objectives

By the end of A0 the following must be true:

1. **Repository topology is platform-oriented** — top-level directories clearly separate `apps/`, `packages/`, `platform/`, `governance/`, `docs/`, and `tests/`.
2. **Documentation is a structured knowledge base** — authored content is organized by audience and purpose; generated artifacts live elsewhere.
3. **Scripts and tests are taxonomized** — discovery is easy because flat folders are replaced by purpose-driven groups.
4. **Navigation documents exist** — a new contributor can understand the repository without asking.
5. **Canonical module architecture is declared** — `backend/modules/search` is the reference implementation; all new backend work follows it.
6. **Architectural convergence is underway** — Generation 1 (services/lib) and Generation 2 (domain/projection/view-models) migrate toward Generation 3 (backend modules) incrementally, as they are touched for feature work.
7. **Domain boundaries are explicit** — types and logic move from flat `domain/types/` and `types/` into bounded contexts.
8. **Feature ownership is the default frontend pattern** — components, hooks, and view-models cluster under `features/<capability>/`.
9. **No large-scale refactors of stable code** — existing search, SCGS, and projection layers are preserved and improved, not rewritten.

---

## Current State Summary

The codebase has reached an **8.8–9.1/10 architecture maturity** but now contains three architectural generations:

- **Generation 1:** `services/`, `repositories/`, `lib/`
- **Generation 2:** `domain/`, `projection/`, `view-models/`
- **Generation 3:** `backend/modules/<capability>/` with `application/`, `domain/`, `infrastructure/`, `tests/`

`backend/modules/search` is the strongest and most coherent module. It should become the canonical template. SCGS is incomplete but architecturally sound; it needs convergence, not redesign.

---

## Workstreams

### Workstream 1 — Repository Topology

**Goal:** Reorganize the repository root so that product, platform, governance, docs, and tests are peers.

#### Phase 1.1 — Target top-level structure

```
/
├── README.md
├── package.json
├── apps/
│   └── web/                    # current Next.js application
├── packages/
│   ├── ui/                     # shadcn/design-system components
│   ├── shared/                 # cross-cutting utilities, types, hooks
│   ├── contracts/              # API contracts and schemas
│   ├── types/                  # globally shared TypeScript types (transitional)
│   └── config/                 # shared tooling configs (eslint, tsconfig, tailwind)
├── platform/
│   ├── scripts/                # operational automation
│   ├── ci/                     # GitHub Actions and related config
│   ├── docker/                 # Dockerfile, .dockerignore, compose files
│   ├── deployment/             # Fly.io configs and deploy helpers
│   └── generators/             # code generators and scaffolds
├── governance/
│   ├── planning/               # .planning content
│   ├── scgs/                   # .scgs content
│   ├── certification/          # certification evidence and templates
│   ├── architecture/           # ADRs and architecture docs
│   └── decisions/              # decision records
├── docs/
│   ├── architecture/
│   ├── engineering/
│   ├── operations/
│   ├── product/
│   ├── design/
│   ├── api/
│   ├── guides/
│   ├── onboarding/
│   └── reference/
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
└── artifacts/                  # generated outputs
    ├── coverage/
    ├── reports/
    ├── benchmarks/
    └── traces/
```

#### Tasks

- [ ] 1.1.1 Define the final top-level directory contract.
- [ ] 1.1.2 Move `.planning/` → `governance/planning/`.
- [ ] 1.1.3 Move `.scgs/` → `governance/scgs/`.
- [ ] 1.1.4 Move `fly/` → `platform/deployment/fly/`.
- [ ] 1.1.5 Move `.github/workflows/` → `platform/ci/` (with `.github/workflows` as a symlink or generated copy if required).
- [ ] 1.1.6 Move `scripts/` → `platform/scripts/` and re-taxonomize (see Workstream 2).
- [ ] 1.1.7 Move `tests/` → `tests/` and re-taxonomize (see Workstream 3).
- [ ] 1.1.8 Move generated artifacts (`reports/`, `test-results/`, `storybook-static/` where appropriate) → `artifacts/`.
- [ ] 1.1.9 Update all absolute and relative paths in CI, scripts, package.json, and Docker.
- [ ] 1.1.10 Add a root `PROJECT_MAP.md` explaining the layout.

#### Acceptance Criteria

- A new contributor can identify where a file belongs without asking.
- All CI paths are updated and green.
- No generated artifacts live alongside authored source.

---

### Workstream 2 — Documentation Information Architecture

**Goal:** Turn `docs/` from a flat wiki into a structured knowledge base.

#### Target structure

```
docs/
├── README.md                   # docs index
├── architecture/               # system and subsystem architecture
├── engineering/                # development guides, conventions, runbooks
├── operations/                 # deployment, monitoring, incident response
├── product/                    # product specs and roadmaps
├── design/                     # design system and UX specs
├── api/                        # API documentation
├── guides/                     # how-to guides
├── onboarding/                 # new contributor path
├── reference/                  # glossaries, cheat sheets
└── adr/                        # architecture decision records
```

#### Tasks

- [ ] 2.1 Audit all 153 docs and classify them.
- [ ] 2.2 Move each doc into the appropriate bucket.
- [ ] 2.3 Merge or archive overlapping docs.
- [ ] 2.4 Create `docs/adr/0001-repository-platformization.md` and subsequent ADRs.
- [ ] 2.5 Create `docs/onboarding/ENGINEERING_MANUAL.md` explaining SCGS, PRR, PTS, Certification, Replay, Planning, TMIG, Constitution, Contracts, and how they interact.
- [ ] 2.6 Add `docs/README.md` with the knowledge base map.

#### Acceptance Criteria

- Every doc has a single, clear home.
- Onboarding manual answers: what the project is, how it is organized, what each governance subsystem does, which documents are authoritative, and typical workflows.

---

### Workstream 3 — Script & Test Taxonomy

**Goal:** Make 77 scripts and 170 tests discoverable by purpose.

#### Target script structure

```
platform/scripts/
├── bootstrap/                  # repo setup, env initialization
├── ci/                         # CI helpers
├── deployment/                 # deploy, rollback, smoke tests
├── maintenance/                # cleanup, backups, drift checks
├── generators/                 # scaffolding new modules/features
├── certification/              # certification and evidence collection
├── migration/                  # database and data migrations
├── tooling/                    # lint, format, typecheck orchestration
└── dev/                        # local development helpers
```

#### Target test structure

```
tests/
├── unit/                       # isolated unit tests
├── integration/                # integration tests
├── e2e/                        # Playwright end-to-end tests
├── certification/              # certification evidence tests
├── governance/                 # SCGS/certification tests
├── performance/                # load and performance tests
├── regression/                 # regression suites
├── branch/                     # branch-specific regression suites
├── fixtures/                   # shared test data
└── helpers/                    # shared test utilities
```

#### Tasks

- [ ] 3.1 Classify every script in `scripts/` by purpose.
- [ ] 3.2 Move scripts into the taxonomy above.
- [ ] 3.3 Update `package.json` script references.
- [ ] 3.4 Classify every test by type.
- [ ] 3.5 Move tests into the taxonomy above.
- [ ] 3.6 Update test commands and CI paths.

#### Acceptance Criteria

- Anyone can find a script or test in under 30 seconds.
- CI still runs the full suite correctly.

---

### Workstream 4 — Generated Artifact Separation

**Goal:** Keep generated outputs isolated from authored content.

#### Tasks

- [ ] 4.1 Create `artifacts/` with subdirectories: `coverage/`, `reports/`, `benchmarks/`, `traces/`.
- [ ] 4.2 Move existing generated reports (`reports/` root contents) into `artifacts/reports/` or a dedicated governance evidence path.
- [ ] 4.3 Update `.gitignore` so generated artifacts are ignored or committed intentionally.
- [ ] 4.4 Update scripts that write reports to use `artifacts/`.

#### Acceptance Criteria

- `git status` on a clean clone shows no generated files.
- Report-generation scripts write to `artifacts/`.

---

### Workstream 5 — Navigation & Onboarding Documents

**Goal:** Make the repository self-explanatory.

#### Tasks

- [ ] 5.1 Create `PROJECT_MAP.md` — a visual table of contents for the repository.
- [ ] 5.2 Create `ARCHITECTURE.md` — high-level system boundaries and data flow.
- [ ] 5.3 Create `CONTRIBUTING.md` — feature/bug/release/certification workflows.
- [ ] 5.4 Create `ROADMAP.md` — link to governance planning and current initiatives.
- [ ] 5.5 Create `GOVERNANCE.md` — how SCGS, certification, and decisions work.
- [ ] 5.6 Create `TESTING.md` — testing philosophy, where tests live, how to run them.
- [ ] 5.7 Add subsystem READMEs:
  - `apps/web/README.md`
  - `platform/README.md`
  - `governance/README.md`
  - `docs/README.md`

#### Acceptance Criteria

- A staff engineer can orient themselves in 15 minutes using only root docs.

---

### Workstream 6 — Architecture Convergence

**Goal:** Declare the Generation 3 module pattern canonical and converge the other generations incrementally.

#### Canonical module template (based on `backend/modules/search`)

```
backend/modules/<capability>/
├── application/                # use cases, commands, queries
├── domain/                     # entities, value objects, policies, events
├── infrastructure/             # repositories, clients, external adapters
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── performance/
│   ├── observability/
│   └── resilience/
├── index.ts                    # public API
└── README.md                   # module contract and dependencies
```

#### Tasks

- [ ] 6.1 Document the canonical module template in `docs/engineering/backend-module-template.md`.
- [ ] 6.2 Add a generator scaffold (e.g., `platform/scripts/generators/module.sh`) to create new modules following the template.
- [ ] 6.3 Identify existing Generation 1 (`services/`, `lib/`) and Generation 2 (`domain/`, `projection/`) components that should migrate.
- [ ] 6.4 Establish a migration rule: **only refactor a component when it is touched for feature work**.
- [ ] 6.5 Add ADR `0002-canonical-backend-module.md`.
- [ ] 6.6 Update code review checklist to enforce the canonical pattern for new modules.

#### Acceptance Criteria

- All new backend capabilities are created using the canonical template.
- Existing search module remains untouched except for improvements.
- No large-scale refactors of stable code.

---

### Workstream 7 — Domain Consolidation

**Goal:** Move domain types and logic into bounded contexts.

#### Target structure

```
backend/modules/
├── search/
├── listing/
├── seller/
├── catalog/
├── marketplace/
├── taxonomy/
├── notifications/
├── analytics/
└── ai/
    ├── vision/
    ├── embeddings/
    ├── ranking/
    ├── classification/
    └── summarization/
```

#### Tasks

- [ ] 7.1 Define bounded contexts and their responsibilities.
- [ ] 7.2 Move `domain/types/catalog.types.ts`, `listing.types.ts`, etc., into bounded contexts (`backend/modules/listing/Listing.ts`, `ListingStatus.ts`, `ListingPolicy.ts`, `ListingEvents.ts`).
- [ ] 7.3 Promote repositories around aggregates (`ListingRepository`, `SellerRepository`, `CatalogRepository`, `MarketplaceRepository`, `SearchRepository`).
- [ ] 7.4 Expand the projection layer so UI pages consume projections, not repositories.
- [ ] 7.5 Keep API routes thin:
  ```
  Route → Application Service → Command/Query → Domain → Repository
  ```

#### Acceptance Criteria

- Each bounded context owns its types.
- UI pages read from projections.
- API routes contain no business logic.

---

### Workstream 8 — Feature-Based Frontend

**Goal:** Move the 247 components from a flat hierarchy into feature-owned structures.

#### Target structure

```
apps/web/src/features/
├── search/
│   ├── components/
│   ├── hooks/
│   ├── view-models/
│   └── pages/
├── listing/
├── seller/
├── admin/
└── shared/
    ├── components/
    └── hooks/
```

#### Tasks

- [ ] 8.1 Define feature boundaries.
- [ ] 8.2 Create `features/` directory and migrate components incrementally.
- [ ] 8.3 Move `view-models/` into the relevant feature.
- [ ] 8.4 Update imports and aliases.
- [ ] 8.5 Establish rule: new components live in `features/<capability>/components/`.

#### Acceptance Criteria

- Components cluster by feature.
- No new flat components added to `src/components/` without justification.

---

### Workstream 9 — SCGS Convergence

**Goal:** Promote SCGS from a hidden folder to a formal governance subsystem.

#### Target structure

```
governance/scgs/
├── compiler/
├── semantic-ast/
├── policies/
├── replay/
├── telemetry/
├── certification/
├── projection/
├── runtime/
└── schemas/
```

#### Tasks

- [ ] 9.1 Move `.scgs/` into `governance/scgs/`.
- [ ] 9.2 Reorganize SCGS contents into the subsystems above.
- [ ] 9.3 Document SCGS boundaries in `governance/scgs/README.md`.
- [ ] 9.4 Add ADR `0003-scgs-subsystem-structure.md`.

#### Acceptance Criteria

- SCGS is no longer a hidden folder.
- Its subsystems are clearly separated and documented.

---

## Execution Order

The goal is **incremental convergence**, not big-bang reorganization.

### Phase 1 — Repository skeleton (no code moves yet)

1. Workstream 1: create new top-level directories.
2. Workstream 5: add navigation docs.
3. Workstream 4: create `artifacts/`.

### Phase 2 — Content reorganization

4. Workstream 2: restructure docs.
5. Workstream 3: restructure scripts and tests.
6. Workstream 1: move `.planning/`, `.scgs/`, `fly/`, `.github/workflows/`, `scripts/`, `tests/` into new homes.

### Phase 3 — Architecture standards

7. Workstream 6: declare canonical module architecture.
8. Workstream 9: converge SCGS structure.
9. Workstream 7: define bounded contexts and begin domain consolidation.
10. Workstream 8: begin feature-based frontend migration.

### Phase 4 — Incremental migration (ongoing)

11. Refactor Generation 1 and Generation 2 code only when touched for feature work.
12. Create new modules (`listing`, `seller`, `catalog`, `taxonomy`, `notifications`, `analytics`, `ai`) as needed using the canonical template.

### Phase 5 — Platform extraction (optional, future)

13. When the product stabilizes, consider splitting into:
    ```
    apps/
    packages/
    backend/
    governance/
    platform/
    ```

---

## Acceptance Criteria for A0

- [ ] Root directory follows the platform repository topology.
- [ ] `docs/` is organized by audience and purpose.
- [ ] `platform/scripts/` and `tests/` follow the taxonomy.
- [ ] `artifacts/` exists and is used for generated outputs.
- [ ] `PROJECT_MAP.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, and `TESTING.md` exist.
- [ ] `backend/modules/search` is documented as the canonical module template.
- [ ] New modules follow the canonical template.
- [ ] Bounded contexts are defined and documented.
- [ ] SCGS is reorganized under `governance/scgs/` with clear subsystems.
- [ ] CI passes after each workstream.

---

## Relationship to D0

- **D0** stabilizes delivery infrastructure (CI/CD, Husky, Docker, Fly.io).
- **A0** stabilizes repository and application architecture.

D0 should complete before A0 Phase 3 begins, because A0's directory moves will change CI paths. However, Phase 1 and Phase 2 documentation/structure work can proceed in parallel with D0 if desired.

---

## Risks & Mitigations

| Risk                                         | Mitigation                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Large-scale moves break CI                   | Move in small workstreams; verify CI after each.                       |
| Merge conflicts with active feature branches | Coordinate timing; prefer directory moves during low-velocity windows. |
| Over-engineering the platform                | Apply the rule: refactor only when touched for feature work.           |
| Losing documentation links                   | Use `git mv` to preserve history; update links in the same PR.         |
| Contributors confused by new layout          | PROJECT_MAP.md and onboarding docs are created first.                  |

---

## Notes

- This plan intentionally avoids rewriting stable subsystems (search, SCGS core, projection layer).
- The canonical backend module is `backend/modules/search`.
- Frontend convergence to `features/` is incremental; existing flat components are migrated only when touched.
