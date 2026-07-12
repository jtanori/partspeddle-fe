# Phase 5 — Governance Consolidation

**Status:** Implementation plan — awaiting approval.  
**Goal:** Move governance subsystems from the repository root and scattered doc locations into `governance/`, keeping navigation docs, CI, and scripts pointing to the new paths.

---

## Context

Phases 0–4 established the platform-repository topology:

- Phase 0: navigation documents at root (`PROJECT_MAP.md`, `ARCHITECTURE.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `TESTING.md`).
- Phase 1: workspace scaffolding, including empty `governance/` directories.
- Phase 2: Next.js application moved to `apps/web/`.
- Phase 3: repository and AI service code modularized under `apps/web/src/backend/modules/`.
- Phase 4: engineering tooling consolidated under `platform/`.

The following governance subsystems are still outside `governance/`:

| Current location | Governance concern | Target location |
| ---------------- | ------------------ | --------------- |
| `governance/scgs/` | Semantic Change Governance System (SCGS) | `governance/scgs/` |
| `governance/planning/` | Roadmaps, phase plans, session checkpoint | `governance/planning/` |
| `governance/architecture/` | Architecture decision records and models | `governance/architecture/` |
| `governance/decisions/` | ADRs | `governance/decisions/` |
| `governance/certification/evidence/` | Certification evidence and matrices | `governance/certification/evidence/` |
| `governance/certification/evidence/` | Audit evidence | `governance/certification/evidence/` |
| `governance/certification/reports/` | Generated audit/certification reports | `governance/certification/reports/` |

---

## Constraints and non-negotiables

1. **No functional code changes.** This phase is a mechanical move and path update; no business logic should change.
2. **Backward compatibility.** Any hard-coded path in docs, scripts, tests, workflows, or navigation files is updated in the same PR.
3. **Generated reports keep working.** Scripts that write to `governance/certification/reports/` must be updated to write to `governance/certification/reports/`.
4. **`.github/workflows/` stays at root.** The nightly workflow that uploads `governance/certification/reports/` will be updated to `governance/certification/reports/`.
5. **SCGS runtime default path updates.** `ReplayStore` defaults to `governance/scgs/replay`; it must default to `governance/scgs/replay` and the replay validator script must match.

---

## Target layout after this phase

```text
/
├── governance/
│   ├── README.md
│   ├── scgs/
│   │   ├── README.md
│   │   └── replay/               # runtime traces (gitignored)
│   ├── planning/
│   │   ├── README.md
│   │   ├── platform-repository-evolution.md
│   │   ├── session-checkpoint.md
│   │   ├── phase-0-implementation-plan.md
│   │   ├── phase-1-implementation-plan.md
│   │   ├── phase-2-implementation-plan.md
│   │   ├── phase-3-implementation-plan.md
│   │   ├── phase-4-implementation-plan.md
│   │   ├── phase-5-implementation-plan.md
│   │   ├── archive/
│   │   └── temp/
│   ├── architecture/
│   │   ├── README.md
│   │   └── ...                   # former governance/architecture/
│   ├── decisions/
│   │   ├── README.md
│   │   └── ...                   # former governance/decisions/
│   └── certification/
│       ├── README.md
│       ├── evidence/             # former governance/certification/evidence/ + governance/certification/evidence/
│       └── governance/certification/reports/              # former governance/certification/reports/
│
├── docs/                         # knowledge base (next phase will restructure)
├── governance/scgs/                        # removed
├── governance/planning/                    # removed
├── governance/certification/reports/                      # removed
├── governance/architecture/            # removed
├── governance/decisions/                     # removed
├── governance/certification/evidence/           # removed
└── governance/certification/evidence/                # removed
```

---

## Detailed work

### 1. Move `governance/scgs/` → `governance/scgs/`

- Move any existing files from `governance/scgs/` into `governance/scgs/`.
- Update `apps/web/src/domain/specification/scgs/replay/store.ts` default `basePath` from `governance/scgs/replay` to `governance/scgs/replay`.
- Update `platform/scripts/scgs/replay-validate.ts` to use `governance/scgs/replay`.
- Update `.gitignore` to ignore `governance/scgs/replay/` instead of (or in addition to) `governance/scgs/`.

### 2. Move `governance/planning/` → `governance/planning/`

- Move the entire `governance/planning/` tree (active plans, archive, temp) into `governance/planning/`.
- Update tests that assert `governance/planning/` paths:
  - `tests/branch/p5-deploy-env-review/deploy-env-review.test.tsx`
  - `tests/branch/p4-local-supabase-config/supabase-local-config.test.ts`
- Update references in:
  - `PROJECT_MAP.md`
  - `GOVERNANCE.md`
  - `README.md`
  - `AGENTS.md`
  - `docs/INDEX.md`
  - `docs/P6_7_REMOTE_MIGRATION_CHECKLIST.md`
  - `docs/operations/delivery-certification-report.md`
  - `governance/certification/evidence/SEARCH_CERTIFICATION_REPORT.md`
  - `governance/certification/evidence/SEARCH_RANKING_CERTIFICATION.md`
  - `platform/scripts/scgs/*` (any hard-coded `governance/planning/` references)
  - `.github/workflows/nightly-operational-validation.yml` (if it references plans)

### 3. Move architecture docs → `governance/architecture/`

- Move `governance/architecture/*` → `governance/architecture/`.
- Update internal cross-references between architecture docs (relative links).
- Update links in:
  - `PROJECT_MAP.md`
  - `ARCHITECTURE.md`
  - `GOVERNANCE.md`
  - `README.md`
  - `docs/INDEX.md`
  - any docs that link to `governance/architecture/...`

### 4. Move ADRs → `governance/decisions/`

- Move `governance/decisions/*` → `governance/decisions/`.
- Update `GOVERNANCE.md` "Contributing to governance" section (currently says `governance/decisions/`).
- Update any links to `governance/decisions/...`.

### 5. Move certification evidence and reports → `governance/certification/`

- Move `governance/certification/evidence/*` → `governance/certification/evidence/`.
- Move `governance/certification/evidence/*` → `governance/certification/evidence/`.
- Move `governance/certification/reports/*` → `governance/certification/reports/`.
- Update scripts that write to `governance/certification/reports/`:
  - `platform/scripts/migration/security-audit.ts` → write to `governance/certification/reports/`
  - `platform/scripts/archive/test-outbox-recovery.ts` → write to `governance/certification/reports/`
  - `platform/scripts/archive/test-drift-validation.ts` → write to `governance/certification/reports/`
- Update `.github/workflows/nightly-operational-validation.yml` artifact upload path from `governance/certification/reports/` to `governance/certification/reports/`.
- Update `.gitignore` `governance/certification/reports/*.json` to `governance/certification/reports/*.json`.
- Update references in:
  - `GOVERNANCE.md`
  - `PROJECT_MAP.md`
  - `docs/operations/delivery-certification-report.md`
  - `docs/INDEX.md`
  - `docs/PRC.md`
  - `governance/certification/evidence/SEARCH_CERTIFICATION_REPORT.md`
  - `governance/certification/evidence/SEARCH_RANKING_CERTIFICATION.md`

### 6. Update root navigation documents

- `PROJECT_MAP.md`:
  - Replace `governance/planning/` with `governance/planning/`.
  - Replace `governance/scgs/` with `governance/scgs/`.
  - Replace `governance/certification/reports/` with `governance/certification/reports/`.
  - Replace `governance/architecture/` with `governance/architecture/`.
  - Mark Phase 5 as in progress / complete.
- `GOVERNANCE.md`:
  - Update "Where it lives" for SCGS, Planning, Certification, Replay, Ranking.
  - Update authority map canonical sources.
  - Update "Contributing to governance" ADR path.
- `ARCHITECTURE.md`:
  - Update links to architecture docs if any.
- `CONTRIBUTING.md`:
  - Update planning and ADR references.
- `README.md`:
  - Update references to `governance/planning/`, `governance/architecture/`, `governance/certification/reports/`.
- `AGENTS.md`:
  - Update planning references if needed.
- `docs/INDEX.md`:
  - Fix stale `governance/planning/master-plan.md` link.
  - Update links to architecture/certification docs.

### 7. Update `platform/scripts/scgs/*`

- Search for `governance/scgs/`, `governance/planning/`, `governance/certification/reports/`, `governance/certification/evidence/`, `governance/architecture/` references.
- Update paths or make them configurable via environment variables where appropriate.

### 8. Create/update `governance/README.md`

- Add a top-level `governance/README.md` explaining the four subsystems:
  - `governance/planning/`
  - `governance/architecture/`
  - `governance/decisions/`
  - `governance/certification/`
  - `governance/scgs/`

### 9. Update `governance/*/README.md` placeholders

- Ensure each `governance/scgs/README.md`, `governance/planning/README.md`, etc., reflects the new contents.

---

## Verification plan

Run the following scoped checks locally before opening the PR:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm vitest run tests/branch/p5-deploy-env-review tests/branch/p4-local-supabase-config
pnpm test tests/security
pnpm build
pnpm storybook:build
pnpm delivery:manifest:validate
```

Also run a path-reference audit:

```bash
grep -R "\governance/scgs/\|\governance/planning/\|governance/certification/reports/\|governance/architecture/\|governance/decisions/\|governance/certification/evidence/\|governance/certification/evidence/" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" \
  . | grep -v node_modules | grep -v ".next"
```

Expect the only matches to be intentional historical references inside archived documents, or paths inside `governance/` after the move.

---

## Acceptance criteria

- [ ] `governance/scgs/` contains the former `governance/scgs/` content and `ReplayStore` writes there by default.
- [ ] `governance/planning/` contains the former `governance/planning/` content.
- [ ] `governance/architecture/` contains the former `governance/architecture/` content.
- [ ] `governance/decisions/` contains the former `governance/decisions/` content.
- [ ] `governance/certification/evidence/` contains the former `governance/certification/evidence/` and `governance/certification/evidence/` content.
- [ ] `governance/certification/reports/` contains the former `governance/certification/reports/` content and scripts write there.
- [ ] Root `governance/scgs/`, `governance/planning/`, `governance/certification/reports/`, `governance/architecture/`, `governance/decisions/`, `governance/certification/evidence/`, `governance/certification/evidence/` are removed.
- [ ] `.gitignore` ignores generated JSONs under `governance/certification/reports/`.
- [ ] `.github/workflows/nightly-operational-validation.yml` uploads `governance/certification/reports/`.
- [ ] `PROJECT_MAP.md`, `GOVERNANCE.md`, `README.md`, `AGENTS.md`, `docs/INDEX.md`, and other navigation docs reference `governance/` paths.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, and scoped tests pass.
- [ ] CI passes on the PR.

---

## Risks and mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Broken internal documentation links | Run `grep` audit after moves; fix all `docs/...`, `governance/planning/...`, `governance/scgs/...`, `governance/certification/reports/...` links. |
| Scripts still write to old `governance/certification/reports/` | Update `security-audit.ts`, `test-outbox-recovery.ts`, `test-drift-validation.ts`; run them or inspect output paths. |
| SCGS replay store reads from old path | Update `ReplayStore` default and `replay-validate.ts`; add a test if missing. |
| CI artifact upload misses reports | Update `nightly-operational-validation.yml` path. |
| Branch tests assert old paths | Update `p5-deploy-env-review` and `p4-local-supabase-config` tests; run scoped tests. |
| Merge conflicts with active feature branches | Keep Phase 5 mechanical and isolated; coordinate with operator before merging. |

---

## Out of scope

- Restructuring `docs/` into `governance/architecture/`, `docs/product/`, etc. (Phase 6).
- Reorganizing `tests/` taxonomy (Phase 7).
- Creating the `ENGINEERING_MANUAL.md` (Phase 8).
- Moving `.github/workflows/` files themselves (GitHub requirement).
