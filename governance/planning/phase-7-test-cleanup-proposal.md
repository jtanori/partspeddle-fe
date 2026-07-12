# Phase 7 — Test Cleanup Proposal

**Status:** Inventory draft — awaiting operator review before deletion/archival.  
**Goal:** Identify branch tests whose sole purpose was to enforce architecture-evolution milestones, so Phase 7 can move less code.

---

## Context

`tests/branch/` was used heavily during the platform-repository evolution. Many tests were written to prove that a migration happened (file moved, config updated, token renamed, migration created) rather than to assert ongoing runtime behavior. Phase 7 will reorganize `tests/` by intent; carrying these evolution tests into the new taxonomy adds noise.

## Classification criteria

| Category | Definition | Proposed action |
| -------- | ---------- | --------------- |
| **Pure evolution** | Only asserts file existence, directory structure, config content, documentation content, or source-code strings as evidence of a completed refactor. | **Delete** (or archive under `tests/branch/archive/` if history must be preserved). |
| **Mixed** | Contains evolution assertions alongside genuine behavior checks. | **Prune** evolution assertions; keep behavior tests and relocate to the right taxonomy bucket. |
| **Functional / security** | Executes code and asserts runtime behavior, auth, RBAC, API contracts, search ranking, etc. | **Keep** and relocate to `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/security/`, or `tests/certification/`. |

---

## Pure evolution tests — candidates for deletion

These tests do not exercise application behavior. They verify that a planned structural change landed.

### Repository topology & tooling configuration

| Test | What it enforces |
| ---- | ---------------- |
| `tests/branch/p2-11-root-cleanup/root-cleanup.test.ts` | Legacy files removed (`vite.config.ts`, `metadata.json`, etc.); scripts relocated to `platform/scripts/`. |
| `tests/branch/p2-8a-build-and-typecheck/build-and-typecheck.test.ts` | `package.json` has `typecheck`; search mapper aliases and server-search filter typing. |
| `tests/branch/p2-8b-eslint-expand/eslint-expand.test.ts` | ESLint config scopes `apps/web/src`; `useIsClient` uses `useSyncExternalStore`. |
| `tests/branch/p2-8c-strict-mode/strict-mode.test.ts` | `tsconfig.base.json` has `strict: true`; specific source patterns exist. |
| `tests/branch/p2-8d-eslint-strict/eslint-strict.test.ts` | ESLint overrides for `src/domain`; no `any` in specific files. |
| `tests/branch/p5-1-app-router-normalization/app-router.test.ts` | Route groups exist under `apps/web/src/app`; no orphan `page.tsx`; SCGS under `(admin)`. |

### CI/CD and operational configuration

| Test | What it enforces |
| ---- | ---------------- |
| `tests/branch/p4-exercise-cicd/exercise-cicd.test.ts` | Smoke-staging script exists; workflow contains `smoke-tests` job; runbook mentions deploy verification. |
| `tests/branch/p4-supabase-cicd/supabase-cicd.test.ts` | CI workflow uses Supabase CLI, links projects, deploys migrations/Edge Functions; runbook mentions Supabase CI/CD. |
| `tests/branch/p4-local-supabase-config/supabase-local-config.test.ts` | `supabase/config.toml`, `.env.example`, local DB scripts, and archived master plan content. |
| `tests/branch/p5-deploy-env-review/deploy-env-review.test.tsx` | `fly.toml` contents, `.env.example` classification, runbook content, master-plan milestones, CI `environment` usage. |

### Design-system / token migration

| Test | What it enforces |
| ---- | ---------------- |
| `tests/branch/p5-design-system/tokens.test.ts` | CSS custom properties exist; legacy `pp-*` aliases remain during transition; no hardcoded hex in new components. |
| `tests/branch/p5-design-system/phase-4-storybook.test.ts` | `docs/design-system/` files exist; `.storybook/` config; stories exist for primitives/composites/workspace; Storybook builds. |
| `tests/branch/p5-marketplace-convergence/marketplace-convergence.test.ts` | PPDS tokens used in root layout, listing page, public shell; legacy loading indicators removed; no hardcoded hex/pp-* in `pdp-modern`. |
| `tests/branch/p5-design-system/components.test.tsx` | `Container` component uses design-system max width. |
| `tests/branch/p5-design-system/phase-2-components.test.tsx` | Phase 2 components (Skeleton, Rating, VehicleLineage, etc.) render correctly. |
| `tests/branch/p5-design-system/phase-3-marketplace.test.tsx` | Marketplace components (PartCard, SearchNoResults, ViewToggle, etc.) render correctly. |
| `tests/branch/p5-design-system/workspace-layout.test.tsx` | Workspace shell components (DensityProvider, Sidebar, TopNavigation, PageHeader) render. |
| `tests/branch/p7-4-editorial-archetypes/archetypes.test.tsx` | Archetype layouts exist; public pages import them; design-system doc exists. |

### Documentation structure

| Test | What it enforces |
| ---- | ---------------- |
| `tests/branch/p5-4-repository-data-access-security/no-service-role-in-app.test.ts` | Partly evolution: asserts `docs/engineering/data-access.md` documents each service-role exception. The import-scan is functional/security. |
| `tests/branch/p5-7-database-security-alignment/rls-alignment.test.ts` | Partly evolution: asserts `docs/engineering/rls-policy-map.md` documents tables. Migration/schema checks are security. |
| `tests/branch/p6-1-tighten-rls-policies/tighten-rls-policies.test.ts` | Partly evolution: asserts `rls-policy-map.md` documents tightened policies. Migration checks are security. |
| `tests/branch/p6-2-restrict-grants/restrict-grants.test.ts` | Partly evolution: asserts `rls-policy-map.md` documents grant model. Migration checks are security. |
| `tests/branch/p6-7-apply-remediation-migrations-to-remote-databases/apply-remediation-migrations-to-remote-databases.test.ts` | Partly evolution: asserts checklist doc exists and contains specific strings. Script/package checks are operational. |

## Mixed tests — prune evolution assertions, keep behavior

| Test | Evolution part to remove | Behavior part to keep |
| ---- | ------------------------ | --------------------- |
| `tests/branch/p5-2-routing-proxy-session-security/proxy-session-security.test.ts` | Asserts `docs/engineering/route-auth-matrix.md` exists and covers route rows. | Proxy middleware behavior (cookies, redirects, RBAC) is genuine security behavior. |
| `tests/branch/p5-6-frontend-client-security/frontend-security.test.ts` | Asserts CSP/headers config strings in source. | Header assertions on actual responses are valuable. |
| `tests/branch/p2-9-security-headers/security-headers.test.ts` | May assert static config content. | Runtime header checks are valuable. |
| `tests/branch/p5-ux-polish/ux-polish.test.tsx` | Asserts legacy loading indicator files removed. | EmptyState/ErrorState rendering, toast behavior, sticky toolbars are UI behavior. |
| `tests/branch/p5-seller-workspace-shell/seller-workspace-shell.test.tsx` | Asserts workspace pages import `PageHeader`. | Rendering workspace pages is UI behavior. |
| `tests/branch/p2-ui-standardization/ui-standardization.test.ts` | Asserts token/component conventions in source. | Rendered output checks are behavior. |
| `tests/branch/p2-store-refactor/store-refactor.test.ts` | Asserts store file structure. | Store behavior tests are functional. |

## Functional / security tests — keep and relocate

These should survive Phase 7 and move into the new taxonomy.

| Test | Proposed new home |
| ---- | ----------------- |
| `tests/branch/p0-middleware-and-types/admin-auth.test.ts` | `tests/integration/` or `tests/security/rbac/` |
| `tests/branch/p0-middleware-and-types/pdp-projection.test.ts` | `tests/integration/` |
| `tests/branch/p0-middleware-and-types/proxy.test.ts` | `tests/integration/` or `tests/security/` |
| `tests/branch/p0-middleware-and-types/scgs-replay.test.ts` | `tests/integration/scgs/` |
| `tests/branch/p0-taxonomy-and-indexing/taxonomy-and-indexing.test.ts` | `tests/integration/search/` |
| `tests/branch/p1-algolia-filter-escaping/algolia-filter-escaping.test.ts` | `tests/unit/search/` |
| `tests/branch/p1-edge-function-hardening/edge-function-hardening.test.ts` | `tests/integration/edge-functions/` |
| `tests/branch/p1-fitment-in-algolia/*` | `tests/integration/search/` |
| `tests/branch/p1-mobile-*` | `tests/e2e/` or `tests/integration/ui/` |
| `tests/branch/p1-ranking-cleanup/ranking-cleanup.test.ts` | `tests/unit/search/` |
| `tests/branch/p1-server-side-roles/get-user-role.test.ts` | `tests/unit/auth/` |
| `tests/branch/p2-health-check/health-check.test.ts` | `tests/integration/ops/` |
| `tests/branch/p2-server-search/server-search.test.ts` | `tests/integration/search/` |
| `tests/branch/p2-search-result-mapping/search-result-mapping.test.ts` | `tests/unit/search/` |
| `tests/branch/p2-search-parity-audits/search-parity-audits.test.ts` | `tests/integration/search/` |
| `tests/branch/p2-decouple-supabase/decouple-supabase.test.ts` | `tests/integration/data/` |
| `tests/branch/p3-1-dead-code-cleanup/dead-code-cleanup.test.ts` | `tests/integration/ops/` (or keep as maintenance smoke) |
| `tests/branch/p4-validate-local-replay/validate-replay.test.ts` | `tests/integration/scgs/` |
| `tests/branch/p4.6-db-security-audit/security-audit.test.ts` | `tests/security/` |
| `tests/branch/p4-rebaseline-migrations/rebaseline-migrations.test.ts` | `tests/integration/db/` |
| `tests/branch/p5-listing-draft-wizard/listing-draft.test.tsx` | `tests/e2e/` or `tests/integration/` |
| `tests/branch/p6-3-remove-unused-extensions/remove-unused-extensions.test.ts` | `tests/integration/db/` |
| `tests/branch/p6-4-replace-service-role-public-routes/replace-service-role-public-routes.test.ts` | `tests/security/` |
| `tests/branch/p6-5-webhook-replay-protection/webhook-replay-protection.test.ts` | `tests/security/` |
| `tests/branch/p6-6-rotate-exposed-staging-service-role-jwt/rotate-exposed-staging-service-role-jwt.test.ts` | `tests/security/` |
| `tests/branch/p7-2-link-audit/link-audit.test.tsx` | `tests/integration/seo/` |
| `tests/branch/p7-5-support-center/support-center.test.tsx` | `tests/e2e/` |
| `tests/branch/p7-6-navigation-registry/navigation-registry.test.tsx` | `tests/integration/navigation/` |
| `tests/branch/p7-7-command-palette/command-palette.test.tsx` | `tests/integration/ui/` |
| `tests/branch/p7-7-seo-accessibility/seo-accessibility.test.tsx` | `tests/integration/seo/` |
| `tests/branch/phase-11-information-page-system/information-page-system.test.tsx` | `tests/e2e/` |
| `tests/branch/fix-extract-*` | `tests/unit/` or `tests/integration/` |
| `tests/branch/fix-p3-7-layout-standardization/layout-standardization.test.tsx` | `tests/integration/ui/` |
| `tests/branch/fix-dev-server-image-hosts/*` | `tests/integration/ui/` |
| `tests/branch/feat-resurrect-scgs-ranking-engine/*` | `tests/integration/scgs/` |
| `tests/security/*` | `tests/security/` (already taxonomy-aligned) |
| `tests/certification/*` | `tests/certification/` |
| `tests/chaos/*` | `tests/chaos/` or `tests/resilience/` |
| `tests/functional/*` | `tests/integration/` or `tests/functional/` |
| `tests/e2e/*` | `tests/e2e/` |
| `tests/c0_8/*` | `tests/regression/` or `tests/integration/` |

---

## Recommended first cut

Delete (or archive) the **pure evolution** tests listed above. They have served their purpose and now duplicate the information already captured in:

- `governance/planning/platform-repository-evolution.md`
- `PROJECT_MAP.md`
- `ARCHITECTURE.md`
- `GOVERNANCE.md`
- The actual file structure of `docs/`, `platform/`, `governance/`, and `apps/web/src/app`.

For the **mixed** tests, strip the documentation/config assertions and keep only the behavior tests. This avoids carrying brittle path-string checks into the new taxonomy.

---

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Deleting a test that guards a real invariant | Review each file before deletion; keep anything that executes code. |
| Future regressions in architecture conventions | Replace with a small lint/custom rule if a convention must persist (e.g., "no `supabaseAdmin` in `src/components`"). |
| Losing historical evidence of migration | Archive instead of delete if history matters. |

---

## Next step

Await operator approval of this list. Once approved, create a cleanup branch, delete/archive the pure-evolution tests, prune the mixed tests, then proceed with Phase 7 directory reorganization.
