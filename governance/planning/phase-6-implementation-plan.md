# Phase 6 — Documentation Restructure

**Status:** Implementation plan — awaiting approval.  
**Goal:** Turn the flat `docs/` directory into a structured knowledge base with clear information architecture, while keeping all branch tests green and internal links valid.

---

## Context

Phases 0–5 established the platform-repository topology:

- Phase 0: navigation documents at root (`PROJECT_MAP.md`, `ARCHITECTURE.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `TESTING.md`).
- Phase 1: workspace scaffolding, including empty target directories.
- Phase 2: Next.js application moved to `apps/web/`.
- Phase 3: repository and AI service code modularized under `apps/web/src/backend/modules/`.
- Phase 4: engineering tooling consolidated under `platform/`.
- Phase 5: governance subsystems consolidated under `governance/`.

`docs/` still contains ~70 loose documents at its root. The current flat layout makes it hard to discover whether a document is engineering guidance, operational runbook, product planning, or reference material. This phase introduces an explicit taxonomy and moves documents into the appropriate buckets.

---

## Constraints and non-negotiables

1. **No functional code changes.** This phase is a mechanical reorganize-and-redirect; no business logic should change.
2. **Branch tests must stay green.** Several branch tests read specific docs files by path. Those paths are updated in the same PR, with test logic otherwise unchanged.
3. **No broken internal links.** All relative Markdown links inside moved documents are updated.
4. **Navigation documents stay current.** `docs/README.md`, `docs/INDEX.md`, `PROJECT_MAP.md`, `GOVERNANCE.md`, `README.md`, and `CONTRIBUTING.md` reflect the new structure.
5. **Certification artifacts move to `governance/certification/`.** Documents that are part of the certified system record (certification matrices, changelogs, impact assessments) belong under governance, not the knowledge base.
6. **ADRs remain authoritative in `governance/decisions/`.** `docs/decisions/` may contain a mirrored index, but the canonical ADR files stay in governance.

---

## Target layout after this phase

```text
docs/
├── README.md                         # knowledge-base entry point
├── INDEX.md                          # kept for backwards compatibility; redirects to README
│
├── engineering/                      # how the system is built
│   ├── README.md
│   ├── api-security.md
│   ├── backend-modules.md
│   ├── c09-semantic-snapshot-regression.md
│   ├── component-reachability.md
│   ├── data-access.md
│   ├── dead-code-report-candidates.md
│   ├── next-app-router-architecture.md
│   ├── route-auth-matrix.md
│   ├── rls-policy-map.md
│   ├── security-manual-checks.md
│   ├── security.md
│   ├── system-of-record.md
│   └── vite-decommissioning-plan.md
│
├── operations/                       # how to run, deploy, and recover the system
│   ├── README.md
│   ├── deployment-runbook.md
│   ├── disaster-recovery.md
│   ├── flyio-infrastructure.md
│   ├── operations-env-mapping.md
│   ├── p6-7-remote-migration-checklist.md
│   ├── delivery-audit.md
│   ├── delivery-certification-report.md
│   ├── deployment-observability.md
│   ├── recovery-runbook.md
│   └── secret-governance.md
│
├── product/                          # product and feature planning
│   ├── README.md
│   ├── catalog-rollout-plan.md
│   ├── dashboard-modernization-plan.md
│   ├── feature-planning-template.md
│   ├── pdp-modernization-plan.md
│   ├── pdp-prc-v2.md
│   ├── pdp-production-ready-certification.md
│   ├── pdp-v2-visual-spec.md
│   ├── search-command-surface-v2-plan.md
│   └── search-pdp-dashboard-integration-plan.md
│
├── reference/                        # technical lookup material
│   ├── README.md
│   ├── route-inventory.md
│   └── search/
│       ├── README.md
│       ├── algolia-ranking-execution-path.md
│       ├── architecture-snapshot.md
│       ├── data-flow.md
│       ├── index-contract.md
│       ├── infrastructure.md
│       ├── parity-baseline.md
│       ├── ranking-data-lineage.md
│       ├── ranking-inventory.md
│       ├── source-of-truth.md
│       └── v2-index-spec.md
│
├── guides/                           # checklists, certifications, integration playbooks
│   ├── README.md
│   ├── lessons-learned.md
│   ├── ppsc-pre-promotion-sanitization-certification.md
│   └── scgc-integration-plan.md
│
├── decisions/                        # ADR index (canonical ADRs remain in governance/decisions/)
│   ├── README.md
│   └── adr-index.md
│
├── onboarding/                       # new-contributor material
│   ├── README.md
│   └── getting-started.md
│
├── design-system/                    # unchanged
├── notes/                            # unchanged
├── review-templates/                 # unchanged
└── archive/                          # unchanged
```

Certification documents that currently live in `docs/` root move to `governance/certification/evidence/`:

```text
governance/certification/evidence/
├── certified-system-changelog.md     # from docs/CERTIFIED_SYSTEM_CHANGELOG.md
└── certified-systems-impact.md       # from docs/CERTIFIED_SYSTEMS_IMPACT.md
```

---

## Detailed work

### 1. Create new directories and READMEs

- `docs/engineering/README.md`
- `docs/operations/README.md`
- `docs/product/README.md`
- `docs/reference/README.md`
- `docs/reference/search/README.md`
- `docs/guides/README.md`
- `docs/decisions/README.md`
- `docs/onboarding/README.md`

Each README explains the directory purpose and lists its documents.

### 2. Move engineering documents

Move the following files into `docs/engineering/` (rename from PascalCase/kebab to lowercase kebab):

| Source                                     | Target                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| `docs/API_SECURITY.md`                     | `docs/engineering/api-security.md`                     |
| `docs/DATA_ACCESS.md`                      | `docs/engineering/data-access.md`                      |
| `docs/NEXT_APP_ROUTER_ARCHITECTURE.md`     | `docs/engineering/next-app-router-architecture.md`     |
| `docs/ROUTE_AUTH_MATRIX.md`                | `docs/engineering/route-auth-matrix.md`                |
| `docs/RLS_POLICY_MAP.md`                   | `docs/engineering/rls-policy-map.md`                   |
| `docs/SECURITY_MANUAL_CHECKS.md`           | `docs/engineering/security-manual-checks.md`           |
| `docs/SYSTEM_OF_RECORD.md`                 | `docs/engineering/system-of-record.md`                 |
| `docs/VITE_DECOMMISSIONING_PLAN.md`        | `docs/engineering/vite-decommissioning-plan.md`        |
| `docs/C09_SEMANTIC_SNAPSHOT_REGRESSION.md` | `docs/engineering/c09-semantic-snapshot-regression.md` |
| `docs/COMPONENT_REACHABILITY.md`           | `docs/engineering/component-reachability.md`           |
| `docs/DEAD_CODE_REPORT_CANDIDATES.md`      | `docs/engineering/dead-code-report-candidates.md`      |

Existing `docs/engineering/security.md` and `docs/engineering/backend-modules.md` stay in place.

### 3. Move operations documents

Move into `docs/operations/`:

| Source                                    | Target                                               |
| ----------------------------------------- | ---------------------------------------------------- |
| `docs/DEPLOYMENT_RUNBOOK.md`              | `docs/operations/deployment-runbook.md`              |
| `docs/DISASTER_RECOVERY.md`               | `docs/operations/disaster-recovery.md`               |
| `docs/FLYIO_INFRASTRUCTURE.md`            | `docs/operations/flyio-infrastructure.md`            |
| `docs/OPERATIONS_ENV_MAPPING.md`          | `docs/operations/operations-env-mapping.md`          |
| `docs/P6_7_REMOTE_MIGRATION_CHECKLIST.md` | `docs/operations/p6-7-remote-migration-checklist.md` |

Existing operations documents (`delivery-audit.md`, `delivery-certification-report.md`, `deployment-observability.md`, `recovery-runbook.md`, `secret-governance.md`) stay in place.

### 4. Move product documents

Move into `docs/product/`:

| Source                                          | Target                                                  |
| ----------------------------------------------- | ------------------------------------------------------- |
| `docs/CATALOG_ROLLOUT_PLAN.md`                  | `docs/product/catalog-rollout-plan.md`                  |
| `docs/DASHBOARD_MODERNIZATION_PLAN.md`          | `docs/product/dashboard-modernization-plan.md`          |
| `docs/PDP_MODERNIZATION_PLAN.md`                | `docs/product/pdp-modernization-plan.md`                |
| `docs/PDP_PRC_V2.md`                            | `docs/product/pdp-prc-v2.md`                            |
| `docs/PDP_PRODUCTION_READY_CERTIFICATION.md`    | `docs/product/pdp-production-ready-certification.md`    |
| `docs/PDP_V2_VISUAL_SPEC.md`                    | `docs/product/pdp-v2-visual-spec.md`                    |
| `docs/SEARCH_COMMAND_SURFACE_V2_PLAN.md`        | `docs/product/search-command-surface-v2-plan.md`        |
| `docs/SEARCH_PDP_DASHBOARD_INTEGRATION_PLAN.md` | `docs/product/search-pdp-dashboard-integration-plan.md` |
| `docs/FEATURE_PLANNING_TEMPLATE.md`             | `docs/product/feature-planning-template.md`             |

### 5. Move reference documents

Move into `docs/reference/`:

| Source                    | Target                              |
| ------------------------- | ----------------------------------- |
| `docs/ROUTE_INVENTORY.md` | `docs/reference/route-inventory.md` |

Move search technical references into `docs/reference/search/`:

| Source                                   | Target                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| `docs/ALGOLIA_RANKING_EXECUTION_PATH.md` | `docs/reference/search/algolia-ranking-execution-path.md` |
| `docs/SEARCH_ARCHITECTURE_SNAPSHOT.md`   | `docs/reference/search/architecture-snapshot.md`          |
| `docs/SEARCH_DATA_FLOW.md`               | `docs/reference/search/data-flow.md`                      |
| `docs/SEARCH_INDEX_CONTRACT.md`          | `docs/reference/search/index-contract.md`                 |
| `docs/SEARCH_INFRASTRUCTURE.md`          | `docs/reference/search/infrastructure.md`                 |
| `docs/SEARCH_PARITY_BASELINE.md`         | `docs/reference/search/parity-baseline.md`                |
| `docs/SEARCH_RANKING_DATA_LINEAGE.md`    | `docs/reference/search/ranking-data-lineage.md`           |
| `docs/SEARCH_RANKING_INVENTORY.md`       | `docs/reference/search/ranking-inventory.md`              |
| `docs/SEARCH_SOURCE_OF_TRUTH.md`         | `docs/reference/search/source-of-truth.md`                |
| `docs/SEARCH_V2_INDEX_SPEC.md`           | `docs/reference/search/v2-index-spec.md`                  |

### 6. Move guide documents

Move into `docs/guides/`:

| Source                                                  | Target                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `docs/PPSC-PRE-PROMOTION-SANITIZATION-CERTIFICATION.md` | `docs/guides/ppsc-pre-promotion-sanitization-certification.md` |
| `docs/SCGC_INTEGRATION_PLAN.md`                         | `docs/guides/scgc-integration-plan.md`                         |
| `docs/LESSONS_LEARNED.md`                               | `docs/guides/lessons-learned.md`                               |

### 7. Move certification artifacts to governance

Move into `governance/certification/evidence/`:

| Source                               | Target                                                            |
| ------------------------------------ | ----------------------------------------------------------------- |
| `docs/CERTIFIED_SYSTEM_CHANGELOG.md` | `governance/certification/evidence/certified-system-changelog.md` |
| `docs/CERTIFIED_SYSTEMS_IMPACT.md`   | `governance/certification/evidence/certified-systems-impact.md`   |

Update any internal links and the navigation documents that reference these files.

### 8. Create ADR index

- Create `docs/decisions/adr-index.md` that links to the canonical ADRs in `governance/decisions/ADR-001.md` and `ADR-004.md`.
- Do **not** duplicate ADR content; keep canonical copies in `governance/decisions/`.

### 9. Create onboarding stub

- Create `docs/onboarding/getting-started.md` with a short contributor orientation (what the project is, where to find architecture, how to run locally, where tests live, where planning lives).
- This intentionally stays small; the full `ENGINEERING_MANUAL.md` is Phase 8 scope.

### 10. Update knowledge-base index

- Create `docs/README.md` as the primary entry point.
- Update `docs/INDEX.md` to either redirect to `docs/README.md` or duplicate its core navigation. Keep `docs/INDEX.md` because existing bookmarks and tests may reference it.

### 11. Update root navigation documents

- `PROJECT_MAP.md`: update directory reference table to reflect new `docs/` subdirectories.
- `GOVERNANCE.md`: update certification artifact paths (`governance/certification/evidence/certified-system-changelog.md`, etc.).
- `CONTRIBUTING.md`: update docs links if any.
- `README.md`: update docs references if any.
- `ARCHITECTURE.md`: update links to engineering/reference docs if any.
- `TESTING.md`: update links to engineering docs if any.

### 12. Update branch tests that read docs by path

The following tests assert the existence or content of docs files. Update only the path strings, no logic changes.

| Test                                                                                                                          | Old path                                  | New path                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `tests/branch/p4-exercise-cicd/exercise-cicd.test.ts`                                                                         | `docs/DEPLOYMENT_RUNBOOK.md`              | `docs/operations/deployment-runbook.md`              |
| `tests/branch/p4-local-supabase-config/supabase-local-config.test.ts`                                                         | `docs/DEPLOYMENT_RUNBOOK.md`              | `docs/operations/deployment-runbook.md`              |
| `tests/branch/p4-supabase-cicd/supabase-cicd.test.ts`                                                                         | `docs/DEPLOYMENT_RUNBOOK.md`              | `docs/operations/deployment-runbook.md`              |
| `tests/branch/p5-deploy-env-review/deploy-env-review.test.tsx`                                                                | `docs/DEPLOYMENT_RUNBOOK.md`              | `docs/operations/deployment-runbook.md`              |
| `tests/branch/p5-2-routing-proxy-session-security/proxy-session-security.test.ts`                                             | `docs/ROUTE_AUTH_MATRIX.md`               | `docs/engineering/route-auth-matrix.md`              |
| `tests/branch/p5-4-repository-data-access-security/no-service-role-in-app.test.ts`                                            | `docs/DATA_ACCESS.md`                     | `docs/engineering/data-access.md`                    |
| `tests/branch/p5-7-database-security-alignment/rls-alignment.test.ts`                                                         | `docs/RLS_POLICY_MAP.md`                  | `docs/engineering/rls-policy-map.md`                 |
| `tests/branch/p6-1-tighten-rls-policies/tighten-rls-policies.test.ts`                                                         | `docs/RLS_POLICY_MAP.md`                  | `docs/engineering/rls-policy-map.md`                 |
| `tests/branch/p6-2-restrict-grants/restrict-grants.test.ts`                                                                   | `docs/RLS_POLICY_MAP.md`                  | `docs/engineering/rls-policy-map.md`                 |
| `tests/branch/p6-7-apply-remediation-migrations-to-remote-databases/apply-remediation-migrations-to-remote-databases.test.ts` | `docs/P6_7_REMOTE_MIGRATION_CHECKLIST.md` | `docs/operations/p6-7-remote-migration-checklist.md` |

### 13. Fix internal Markdown links

After moves, run a link audit and update relative links inside moved documents. Common patterns:

- Links to `DEPLOYMENT_RUNBOOK.md` → `../operations/deployment-runbook.md` or `operations/deployment-runbook.md` depending on source location.
- Links to `RLS_POLICY_MAP.md` → `../engineering/rls-policy-map.md`.
- Links to search reference docs → `../reference/search/...` or `reference/search/...`.
- Links to certification artifacts in `docs/` → `../../governance/certification/evidence/...`.

### 14. Update `.gitignore` if needed

No new generated locations are introduced; no `.gitignore` changes expected unless documentation build outputs are added.

---

## Verification plan

Run the following scoped checks locally before opening the PR:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm vitest run tests/branch/p4-exercise-cicd tests/branch/p4-local-supabase-config tests/branch/p4-supabase-cicd tests/branch/p5-deploy-env-review tests/branch/p5-2-routing-proxy-session-security tests/branch/p5-4-repository-data-access-security tests/branch/p5-7-database-security-alignment tests/branch/p6-1-tighten-rls-policies tests/branch/p6-2-restrict-grants tests/branch/p6-7-apply-remediation-migrations-to-remote-databases tests/branch/p5-design-system tests/branch/p7-4-editorial-archetypes
pnpm test tests/security
pnpm build
pnpm storybook:build
pnpm delivery:manifest:validate
```

Also run a path-reference audit:

```bash
grep -R "docs/[A-Z][A-Z_]*\.md" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" \
  . | grep -v node_modules | grep -v ".next" | grep -v "docs/archive/"
```

Expect zero matches for active source/test/docs files (archived historical references are acceptable).

Run a Markdown link sanity check:

```bash
find docs -name "*.md" -exec grep -l "](" {} \; | xargs -I {} sh -c 'echo "Checking {}"; grep -oP "\]\([^)]+\)" "{}" | grep -v "^\](http" | grep -v "^\](#" | grep -v "^\](mailto" | head -20'
```

Review any relative links that point outside their new directory and fix broken targets.

---

## Acceptance criteria

- [ ] `docs/` root contains only `README.md`, `INDEX.md`, and subdirectories.
- [ ] All moved documents are in their target directories with lowercase-kebab names.
- [ ] Certification artifacts (`CERTIFIED_SYSTEM_CHANGELOG.md`, `CERTIFIED_SYSTEMS_IMPACT.md`) live under `governance/certification/evidence/`.
- [ ] `docs/README.md` exists and serves as the knowledge-base index.
- [ ] `docs/engineering/README.md`, `docs/operations/README.md`, `docs/product/README.md`, `docs/reference/README.md`, `docs/guides/README.md`, `docs/decisions/README.md`, `docs/onboarding/README.md` exist.
- [ ] Branch tests listed in the verification plan pass with updated paths.
- [ ] No broken internal Markdown links in moved documents.
- [ ] `PROJECT_MAP.md`, `GOVERNANCE.md`, `README.md`, `CONTRIBUTING.md`, and `ARCHITECTURE.md` reflect the new docs structure.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm storybook:build`, and `pnpm delivery:manifest:validate` pass.
- [ ] CI passes on the PR.

---

## Risks and mitigations

| Risk                                         | Mitigation                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Branch tests fail because docs paths changed | Update only path strings in the listed tests; run the full branch-test suite before PR.                                               |
| Internal Markdown links break after moves    | Run link grep after moves; fix relative paths in affected documents.                                                                  |
| Navigation documents become stale            | Update `docs/README.md`, `docs/INDEX.md`, `PROJECT_MAP.md`, `GOVERNANCE.md` in the same PR.                                           |
| Certification documents misplaced            | Move `CERTIFIED_SYSTEM_CHANGELOG.md` and `CERTIFIED_SYSTEMS_IMPACT.md` to `governance/certification/evidence/` and update references. |
| Merge conflicts with feature branches        | Keep Phase 6 isolated to `docs/` and `governance/certification/evidence/` plus path-string test updates.                              |

---

## Out of scope

- Reorganizing `tests/` taxonomy (Phase 7).
- Creating the full `ENGINEERING_MANUAL.md` (Phase 8); only a small `getting-started.md` stub is added here.
- Editing or rewriting document content beyond path updates and README index entries.
- Moving `.github/workflows/` files (GitHub requirement).
