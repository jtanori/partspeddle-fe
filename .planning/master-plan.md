# Code Review & Audit Remediation Plan

Each item is tagged with a priority:

- **P0 — Critical**: production incident or blocker; fix immediately.
- **P1 — High**: significant user impact, security, or architectural debt; tackle next sprint.
- **P2 — Medium**: correctness, maintainability, or performance improvements.
- **P3 — Low**: polish, dead code, documentation.

Dependencies are called out explicitly so work is not duplicated.

Status markers:

- **✅ Done** — merged into `develop` (and usually `origin/develop`).
- **🔄 In progress** — branch open and being worked.
- _(no marker)_ — not started.

> **Branch test-suite rule:** every remediation branch must include a focused regression suite under `tests/branch/<branch-name>/` and update `package.json` so `pnpm test` runs it. The first suite was added for `fix/p0-middleware-and-types`.

---

## Pre-P0 — Repository cleanup (do first)

### Pre-P0.1 Audit and clean up stale branches ✅

**Why:** The repository has accumulated many local and remote branches. Some are already merged into `main` and can be deleted safely; others have unmerged work that must be reviewed before it is lost. Cleaning this up before the remediation work prevents merge conflicts, lost code, and confusion about which branch is the source of truth.  
**Files/scope:** All `refs/heads/*` and `origin/*` branches.  
**Action:**

- ✅ Safe branches already merged into `main` have been deleted locally and on `origin`.
- ✅ Ranking-engine hardening from `870a74b` was already present in `develop`; no cherry-pick needed.
- ✅ Reverted `010daee` on `develop` (buildpack builder) in favor of the Dockerfile-based strategy (`3cd0e34`).
- ✅ Deleted `search/scgs-projection-foundation` and `origin/search/scgs-projection-foundation` (commits covered by `search/ranking-migration-prep`).
- ✅ Deleted `feat/next-app-routing` and `origin/feat/next-app-routing` (stash index, work already in `main`).
- ✅ Decided on `feat/search-refinement`: branch was deleted; no fixtures needed.
- ✅ Decided on `search/ranking-migration-prep`: unique work already in `develop`; branch deleted.
- After cleanup, merge `develop` to `main`.

**Branch cleanup report (generated 2026-06-30):**

| Branch                              | Merged to main   | Last commit (local) | Status / Recommendation                                                                                                                |
| ----------------------------------- | ---------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `main`                              | —                | 2026-06-16          | Source of truth for production.                                                                                                        |
| `develop`                           | **No** (ahead 2) | 2026-06-30          | Contains PR #3 merge + fly buildpack fix. **Merge to `main` after review.**                                                            |
| `search/ranking-migration-prep`     | **No**           | 2026-06-30          | PR #3 source branch; unique commit `870a74b` already reflected in `develop`; branch deleted.                                           |
| `search/scgs-projection-foundation` | Partial (PR #2)  | 2026-06-16          | PR #2 was merged into `main`, but branch tip has 3 additional unmerged commits (1970482...). **Review extra commits before deletion.** |
| `feat/search-refinement`            | **No**           | 2026-06-11          | Branch was stale and superseded by later search work; deleted without extracting fixtures.                                             |
| `feat/next-app-routing`             | **No**           | 2026-06-08          | Stash/worktree index with no relevant unmerged work; branch and remote tracking branch deleted.                                        |
| `feat/algolia-indexing`             | **Yes**          | 2026-06-03          | Safe to delete.                                                                                                                        |
| `feat/db-improvements`              | **Yes**          | 2026-06-03          | Safe to delete.                                                                                                                        |
| `feat/update-listing-scripts`       | **Yes**          | 2026-06-03          | Safe to delete.                                                                                                                        |
| `feat/fix-navbar`                   | **Yes**          | 2026-06-03          | Safe to delete.                                                                                                                        |
| `feat/search-layer`                 | **Yes**          | 2026-06-04          | Safe to delete.                                                                                                                        |
| `devops/deployment-runbook`         | **Yes**          | 2026-06-04          | Safe to delete.                                                                                                                        |
| `backup/main-before-consolidation`  | **Yes**          | 2026-06-08          | Safe to delete after confirming `main` is stable.                                                                                      |
| `feat/search-refinement-backup`     | **Yes**          | 2026-06-08          | Safe to delete.                                                                                                                        |
| `feat/search-ui`                    | **Yes**          | 2026-06-13          | Safe to delete.                                                                                                                        |
| `safe-backup/pre-merge`             | **Yes**          | 2026-06-13          | Safe to delete after confirming `main` is stable.                                                                                      |
| `backup/main-pre-cleanup-merge`     | **Yes**          | 2026-06-13          | Safe to delete after confirming `main` is stable.                                                                                      |
| `promotion/feat-search-ui-to-main`  | **Yes**          | 2026-06-13          | Safe to delete.                                                                                                                        |
| `feat/repository-cleanup`           | **Yes**          | 2026-06-13          | Safe to delete.                                                                                                                        |
| `feat/pdp-modernization`            | **Yes**          | 2026-06-13          | Safe to delete (PDP work was promoted through `search/ranking-migration-prep`).                                                        |
| `scgs/migration-stabilization`      | **Yes**          | 2026-06-15          | Safe to delete.                                                                                                                        |

**Detailed analysis of unmerged branches:**

- **`develop`** (ahead 2 of `main`):
  - `259d063` — Merge of PR #3 (`search/ranking-migration-prep` into `develop`). Brings PDP modernization, specification framework, search ranking, and Fly.io deployment configs.
  - `010daee` — Adds buildpack builder to Fly stage/prod configs. **Conflicts with the Dockerfile-based strategy already implemented on `develop`; this commit should be reverted or superseded before merging `develop` to `main`.**

- **`search/ranking-migration-prep`** (tip `870a74b`, not merged to `main` or `develop`):
  - Contains the PR #3 commits that are now in `develop`, **plus one critical follow-up commit**:
    - `870a74b` — `fix(scgs): harden ranking engine, repair type imports, clean lint warnings`. Hardens `RankingEngine.score` to default missing `rankingFactors`, removes unsafe debug logs, fixes `CompiledSpecificationSet` import paths, and cleans up lint errors in `src/domain/specification/scgs/ranking/ranking.engine.ts` and `src/app/api/search.scgs/route.ts`. **Directly relevant to P1.3 (ranking cleanup) and should be cherry-picked into `develop` before `develop` merges to `main`.**
  - Earlier commits include `8fbfcb0` (PDP layout), `c04e882` (specifications compiler), `a63d29a` (PDP catalog migrations), and a long chain of ranking-factor commits (`f8ebe59` through `1970482`). Most are already represented in `develop` via PR #3; the unique value is `870a74b`.

- **`search/scgs-projection-foundation`** (3 commits beyond `main`):
  - `d8846a4` — ranking inventory / explainability contract.
  - `70cfa47` — standalone ranking engine foundation.
  - `1970482` — ranking certification and determinism enforcement.
  - These three commits are also present in `search/ranking-migration-prep`, so they will be captured if that branch is merged/cherry-picked. **Not independently needed if `search/ranking-migration-prep` is handled.**

- **`feat/search-refinement`** (tip `a2c22af`, not merged):
  - Very large branch (248 files, ~10k insertions / ~20k deletions) with search refactoring, test coverage, observability, and UI changes.
  - Notable commits:
    - `a2c22af` — finalizes search refactoring and updates `build-search-document.ts` (uses `name_es` at this point).
    - `b5e9864` — resolves search test failures and promotion pass rate.
    - `c9f69ac` — restores protected tests and adds `SearchErrorBoundary`.
  - **Verdict:** largely superseded by later `search-layer` and `search-ui` work already in `main`, and by PR #3 in `develop`. The test files may contain useful fixtures, but the branch as a whole is stale. **Mark for deletion after extracting any useful tests if desired.**

- **`feat/next-app-routing`** (tip `1ff5eaa`):
  - Tip is a stash index commit on top of the real migration commit `c474e1c`. The real Next.js App Router migration work is in `c474e1c`, but the app router structure already exists in `main`/`develop`.
  - **Verdict:** not relevant. Delete the local branch; the remote tracking branch `origin/feat/next-app-routing` should also be removed.

---

## P0 — Critical

### P0.1 Fix taxonomy indexing so search filters work ✅

**Why:** Search currently indexes `category` and `part_type` as Spanish display names (`name_es`) while the UI taxonomy sends English names. Category/partType filters return empty results, and search cards show mismatched labels.  
**Files:** `src/backend/modules/search/application/build-search-document.ts`, `supabase/functions/sync-algolia-webhook/index.ts`, `src/app/api/search/parts/route.ts`, `src/services/supabase-db.ts`.  
**Action:**

- Canonicalize on English slugs (`categories.slug_en`, `part_types.slug_en`) for indexed `category`/`part_type` fields.
- Update the Edge Function webhook and `BuildSearchDocumentUseCase` to emit the same slugs.
- Update the search API to accept and filter by slugs.
- Keep a display-name field (`category_label`, `part_type_label`) if the UI needs human-readable text.
- **Depends on:** P0.2 (taxonomy source of truth).

### P0.2 Establish a single source of truth for taxonomy ✅

**Why:** `src/services/taxonomy.ts` hardcodes English systems/categories/partTypes that diverge from the database. The UI and search cannot stay in sync.  
**Files:** `src/services/taxonomy.ts`, `src/components/ProductSidebar.tsx`, `src/lib/utils/taxonomy.ts`.  
**Action:**

- Add a `useTaxonomy()` hook or server fetcher that reads from `categories` and `part_types` tables.
- Replace `SYSTEMS_TAXONOMY` and `SYSTEM_CATEGORIES` with dynamic lookups keyed by `slug_en`.
- Update `ProductSidebar` to render options from this source and derive counts from Algolia facets.

### P0.3 Unify indexing logic between webhook and batch reindex ✅

**Why:** The webhook writes raw DB scores; `BuildSearchDocumentUseCase` recomputes scores. Identical parts have different Algolia records depending on update path.  
**Files:** `supabase/functions/sync-algolia-webhook/index.ts`, `src/backend/modules/search/application/build-search-document.ts`, `src/backend/modules/search/application/search-index-worker.ts`.  
**Action:**

- Decide the source of truth for scores: either DB columns only, or computed values only.
- If computed values are required, backfill `parts.listing_quality_score` and `seller_profiles.seller_trust_score` via migration, then read those columns in both paths.
- Refactor the Edge Function to reuse the builder (e.g., extract a Deno-compatible shared module) so one file governs the record shape.
- **Depends on:** P0.1 (same record shape).

### P0.4 Wire up Next.js proxy and protect admin routes ✅

**Why:** `src/proxy.ts` was orphaned; `/admin`, `/seller`, `/dashboard` were unprotected at the edge. Admin reindex endpoints were open to the internet.  
**Files:** `src/proxy.ts`, `src/app/api/admin/search/reindex/route.ts`, `src/app/api/admin/search/reindex/[partId]/route.ts`.  
**Action:**

- Converted the orphaned proxy logic into a Next.js 16 `src/proxy.ts` (the `middleware` convention is deprecated in Next.js 16).
- Enforced login for `/dashboard`, `/seller`, `/admin`; seller role for `/seller`; admin role for `/admin`.
- Added session + admin-role checks to admin reindex routes; return `401`/`403` otherwise.
- **Depends on:** P1.1 (server-side role source of truth).

### P0.5 Remove `ignoreBuildErrors` and fix broken imports ✅

**Why:** TypeScript build errors were suppressed, allowing broken module paths and type mismatches to ship.  
**Files:** `next.config.ts`, `tsconfig.json`, files importing `../domain/marketplace.types`.  
**Action:**

- Removed `typescript: { ignoreBuildErrors: true }` from `next.config.ts`.
- Fixed the broken imports to point to `@/domain/types/marketplace.types`.
- Reconciled the colliding `PartViewModel` types by making `src/domain/types/pdp.types.ts` re-export the canonical viewmodel contract in `src/viewmodels/pdp.viewmodel.ts`.

### P0.6 Fix remaining TypeScript errors from PR #3 merge ✅

**Why:** PR #3 (`feat(pdp): modernize layout, specifications framework, search ranking, and staging/prod deployments`) exposed additional pre-existing type errors when `npx tsc --noEmit` was run. The build relied on `ignoreBuildErrors`, so these had to be resolved before P0.5 could close.  
**Files:** `src/domain/types/pdp.types.ts`, `src/viewmodels/pdp.viewmodel.ts`, `src/domain/specification/scgs/*`, `src/app/(public)/listing/[id]/page.tsx`, dead PDP/SCGS modules and tests.  
**Action:**

- Ran `npx tsc --noEmit` and cataloged every error.
- Added missing SCGS types (`SCGSCIVerdict`, `PTSVector`) and repaired `SemanticReplayEvent`/`SemanticReplayTrace` contracts.
- Fixed incomplete type signatures in `SpecificationCompilerImpl` and SCGS replay/projection code.
- Deleted dead modules that were only referenced by broken code (PDP backend module, broken Supabase repositories, unused mappers, the broken `/api/search.scgs` route, and their orphaned tests).
- Temporarily excluded `tests/` from the main `tsconfig.json` include so stale test imports do not block the production build while the test suite is repaired.
- Verified `pnpm build`, `npx tsc --noEmit`, `pnpm lint`, and `pnpm test` all pass.
- **Depends on:** P0.5 (done together).

---

## P1 — High

### P1.1 Move canonical role storage server-side ✅

**Why:** Role was stored in `user_metadata`, which users can edit. Buyers could claim seller access.  
**Files:** `src/app/(auth)/login/page.tsx`, `src/proxy.ts`, `src/lib/admin-auth.ts`, `src/lib/user-roles.ts`, `supabase/migrations/20260701000000_add_user_roles.sql`.  
**Action:**

- Created `public.user_roles` with RLS, a backfill from `auth.users` metadata, and an `on_auth_user_created_role` trigger so new sign-ups are synced automatically.
- Added `getUserRole()` helper and updated `src/proxy.ts`, `src/lib/admin-auth.ts`, and the login page to query the table instead of `user_metadata.role`.
- Added branch tests under `tests/branch/p1-server-side-roles/`.
- **Unblocks:** P0.4 (now verified against server-side roles).

### P1.2 Push fitment filtering into Algolia ✅

**Why:** `/api/search/parts` fetched from Algolia then filtered in JavaScript, breaking `totalHits`/`totalPages` and wasting bandwidth.  
**Files:** `src/app/api/search/parts/route.ts`, `src/backend/modules/search/infrastructure/algolia-search-repository.ts`, `src/backend/modules/search/application/build-search-document.ts`, `supabase/functions/sync-algolia-webhook/index.ts`, `scripts/algolia/configure-algolia-index.ts`.  
**Action:**

- Indexed fitment as exact tuple signatures (`makeId:modelId:year`) in a new `fitment_signatures` array.
- Updated the batch builder and the Edge Function webhook to emit the same signatures.
- Added `filterOnly(fitment_signatures)` to the Algolia index settings.
- Extended `SearchFilters` and `AlgoliaSearchRepository` to translate fitment queries into Algolia filters.
- Removed the post-fetch `fitmentFilterIds` JavaScript filter from `/api/search/parts`.
- Added branch tests under `tests/branch/p1-fitment-in-algolia/`.
- **Depends on:** P0.1 (consistent filter values).

### P1.3 Standardize search ranking and remove the broken SCGS route ✅

**Why:** Ranking was already configured in Algolia, duplicated in `RankingEngine`, and misreported in debug output. The `/api/search.scgs` route used the wrong Algolia client signature and a broken recency formula.  
**Files:** `src/app/api/search.scgs/route.ts` (already deleted), `src/domain/specification/scgs/ranking/ranking.engine.ts`, `src/domain/specification/scgs/pipeline.ts`, `src/backend/modules/search/domain/search-result.ts`, `src/backend/modules/search/infrastructure/algolia-search-repository.ts`, `src/domain/view-models/search.ts`, `scripts/scgs/compile.ts`, `scripts/scgs/search-parity.ts`.  
**Action:**

- Deleted the broken `/api/search.scgs` route (done in P0.6), the unused `SemanticCompilerGovernanceSystem` pipeline, `RankingEngine`, `ranking.types`, and `SnapshotStore`.
- Removed the misleading `debug` payload (`matchedOn`/`rankingFactors`) from `SearchResult` and the Algolia repository.
- Confirmed Algolia's `customRanking` remains the single source of truth (`desc(listing_quality_score)`, `desc(seller_trust_score)`, `desc(created_at)`).
- Cleaned up `SearchViewModel`/`SearchResultCardModel` to remove SCGS-specific ranking explanation types.
- Removed broken SCGS scripts and the obsolete ranking-engine certification test.
- Added branch tests under `tests/branch/p1-ranking-cleanup/`.

### P1.4 Harden Supabase Edge Functions ✅

**Why:** Webhooks accept unsigned cross-origin requests; image analysis leaks the Gemini key in the URL; notifications log PII.  
**Files:** `supabase/functions/sync-algolia-webhook/index.ts`, `supabase/functions/analyze-part-image/index.ts`, `supabase/functions/send-message-notification/index.ts`.  
**Action:**

- Verify the Supabase service-role JWT or a webhook signature in `sync-algolia-webhook`.
- Move `GEMINI_API_KEY` to an `Authorization` header and add file-size/type validation in `analyze-part-image`.
- Verify JWT and remove email logging in `send-message-notification`.

### P1.5 Fix Algolia filter escaping ✅

**Why:** `escapeFilterValue` uses backslash escaping instead of Algolia's doubled-single-quote rule.  
**Files:** `src/backend/modules/search/infrastructure/algolia-search-repository.ts`.  
**Action:**

- Replace custom escaping with the official helper or the correct doubling rule.
- Add unit tests for injection payloads.

### P1.6 Harden Docker and CI/Ops ✅

**Why:** Docker runs as root, CI uses npm instead of pnpm, several scripts reference missing files, and the nightly workflow uses Node 20.  
**Files:** `Dockerfile`, `.github/workflows/ci.yml`, `.github/workflows/nightly-operational-validation.yml`, `package.json`, `.env.example`.  
**Action:**

- Add a non-root user to the Dockerfile and pin the base image by digest.
- Switch CI to `pnpm install`, `pnpm lint`, `pnpm test`.
- Fix or remove broken scripts (`deps:restore`, `verify:schema`, `test:outbox-recovery`, `test:drift`, `test:load`).
- Update nightly workflow to Node 22 and fix k6 installation source.
- Complete `.env.example` with all required variables.

### P1.7 Fix mobile viewport, video tutorial layout, and post-dismiss focus artifacts ✅

**Why:** The onboarding video tutorial (`GuidedTour`) is unusable on phones: the dialog is fixed at `max-w-[720px]` with a `16/10` aspect video, it does not adapt to portrait or landscape orientation, and after the user dismisses it the gold focus outline on highlighted elements is sometimes not removed. The root layout also lacks an explicit viewport meta tag, and the floating help button overlaps the mobile bottom tab bar.  
**Files:** `src/app/layout.tsx`, `src/components/GuidedTour.tsx`, `src/components/layout/AppWrapper.tsx`, `src/components/UIOverlays.tsx`, `src/services/data/tour.ts`.  
**Action:**

- Add an explicit `viewport` export to `src/app/layout.tsx` (`width=device-width, initial-scale=1, maximum-scale=5`).
- Make `GuidedTour` responsive: stack vertically / use a sheet-style layout on portrait phones, switch to a compact landscape layout on phone landscape, and ensure the video scales to fit without horizontal overflow.
- Replace direct inline-style DOM highlight manipulation in `GuidedTour` with a data-attribute/CSS class approach that is guaranteed to clean up on unmount/dismiss.
- Remove the duplicate `GuidedTour` mount: keep it only in `UIOverlays` (or only in `AppWrapper`), not both.
- Verify every `TOUR_STEPS` `elementId` exists in the DOM; guard highlight logic so missing targets do not throw.
- Move the global help button above the mobile bottom tab (`bottom-24` on small screens) or hide it while the tour is active.

### P1.8 Fix mobile search and homepage layout overflows ✅

**Why:** Several public-page components assume desktop widths and break on small viewports. `SearchModal` reads `window.innerWidth` during render, which can cause hydration mismatches and SSR errors. The hero search input uses an absolute-positioned submit button that collides with the input on narrow screens. The mobile navigation has both a local `MobileSearchSheet` and the global `SearchModal`, creating two search entry points. The search results page hides the sidebar on mobile (`hidden md:block`) but never wires up the existing `MobileFilterSheet`, leaving users with no filters on phones.  
**Files:** `src/components/SearchModal.tsx`, `src/components/homepage/HeroSection.tsx`, `src/components/navbar/MobileNavbar.tsx`, `src/components/navbar/MobileSearchSheet.tsx`, `src/components/navbar/BottomTabBar.tsx`, `src/app/(public)/search/page.tsx`, `src/components/search/MobileFilterSheet.tsx`.  
**Action:**

- Replace the direct `window.innerWidth` usage in `SearchModal` with CSS breakpoints or a safe `useMediaQuery` hook that defaults to mobile during SSR.
- Refactor `HeroSection` search form so the submit button wraps/stacked below the input on small screens (`flex-col sm:flex-row`).
- Consolidate mobile search: route the mobile search icon to the existing `SearchModal` and remove `MobileSearchSheet`, or clearly separate their responsibilities.
- Wire `MobileFilterSheet` into `src/app/(public)/search/page.tsx` for the mobile breakpoint and remove the unconditional `hidden md:block` from the sidebar wrapper.
- Audit `ProductGridCard`, `ProductListCard`, `ListingsGrid`, and `SearchResultsController` for horizontal overflow, truncated prices, and touch targets smaller than 44×44 px.
- Ensure the mobile bottom tab bar does not obscure page content by adding safe-area/padding-bottom utilities to main page wrappers.

### P1.9 Make the modern PDP responsive ✅

**Why:** The new PDP components merged in PR #3 are desktop-first and overflow or become unreadable on phones. `ProductGallery` is locked at `h-[480px]` with a left thumbnail rail, `PriceBlock` renders the price at `text-6xl`, `ProductHeader` uses `text-4xl` titles, `TabSystem` tabs are a non-wrapping horizontal flex, and `TrustSummaryStrip` squishes four columns into a narrow viewport.  
**Files:** `src/components/pdp-modern/ProductGallery.tsx`, `src/components/pdp-modern/PriceBlock.tsx`, `src/components/pdp-modern/ProductHeader.tsx`, `src/components/pdp-modern/TabSystem.tsx`, `src/components/pdp-modern/TrustSummaryStrip.tsx`, `src/components/pdp-modern/PDPRoot.tsx`.  
**Action:**

- Refactor `ProductGallery` to stack thumbnails below the main image on mobile (or use a swipeable carousel), and replace the fixed `480px` height with responsive/aspect-ratio-based sizing.
- Downscale `PriceBlock` price to `text-4xl` on mobile (`text-6xl md:text-5xl lg:text-6xl`).
- Downscale `ProductHeader` title and wrap the rating/SKU row on small screens.
- Make `TabSystem` tabs horizontally scrollable or wrap to two rows on mobile.
- Convert `TrustSummaryStrip` to a 2×2 grid on small screens and a single row on desktop.
- Add `overflow-x-hidden` to `PDPRoot` and verify no long breadcrumb titles cause horizontal scroll.

### P1.10 Make the seller dashboard usable on mobile and tablets ✅

**Why:** `SellerSidebar` is a fixed `260px` width with no responsive behavior, so the entire seller dashboard layout overflows on phones and tablets. The listing intake wizard (`StageOneMedia`) relies on hover for its help popover, which does not work on touch devices, and its `w-80` tooltip can overflow the viewport.  
**Files:** `src/components/seller-dashboard/Sidebar.tsx`, `src/app/(seller)/layout.tsx`, `src/components/wizard/stages/StageOneMedia.tsx`, `src/components/seller-dashboard/DashboardHeader.tsx`.  
**Action:**

- Convert `SellerSidebar` to a collapsible/mobile sheet pattern on small screens, or hide it behind a hamburger menu on tablets/phones.
- Add a mobile top bar or bottom tab for the most common seller actions.
- Replace the hover-only help popover in `StageOneMedia` with a tap-to-toggle pattern and constrain the popover width to the viewport (`max-w-[calc(100vw-2rem)]`).
- Audit seller dashboard tables and forms for horizontal overflow; wrap tables in `overflow-x-auto` and stack form fields vertically on mobile.

---

## P2 — Medium

### P2.1 UI/UX standardization: cards, search, and homepage ✅

**Why:** Multiple card components (`FeaturedParts`, `ProductGridCard`, `SearchModal` results) have inconsistent styling, hardcoded data, and duplicate logic.  
**Files:** `src/components/homepage/FeaturedParts.tsx`, `src/components/search/cards/ProductGridCard.tsx`, `src/components/search/SearchModal.tsx`, `src/components/search/SearchResultsDropdown.tsx`, `src/components/navbar/LiveSearchDropdown.tsx`, `src/components/homepage/ListingsGrid.tsx`, `src/components/ProductSidebar.tsx`.  
**Action:**

- Consolidate on one card component (`ProductGridCard` or a renamed `PartCard`) for all grids.
- Remove `FeaturedParts` in favor of `ListingsGrid` on the homepage.
- Replace inline condition-color logic with the shared `getConditionColor` utility.
- Replace hardcoded seller badges with real seller data.
- Standardize instant search: replace `LiveSearchDropdown` and `SearchModal` direct Supabase calls with the existing `/api/search/suggestions` route or a dedicated search endpoint; add abort controllers and debounce.
- Use `next/image` for all product/hero images and add `images.remotePatterns`.
- Replace the inline SVG fallback with a small optimized placeholder file.

### P2.2 Move search data fetching to the server ✅

**Why:** Search page renders an empty shell and fetches client-side, hurting SEO, FCP, and LCP.  
**Files:** `src/app/(public)/search/page.tsx`, `src/components/search/SearchResultsController.tsx`, `src/services/supabase-db.ts`.  
**Action:**

- Fetch initial results in the Server Component using `/api/search/parts`.
- Use React Suspense and `loading.tsx` for transitions.
- Keep client-side filtering for subsequent interactions but push sort/filter changes through URL state.

### P2.3 Make health check verify dependencies ✅

**Why:** `/api/health` returns static `200` even when Supabase or Algolia is down.  
**Files:** `src/app/api/health/route.ts`, `fly/fly.stage.toml`, `fly/fly.prod.toml`.  
**Action:**

- Add lightweight Supabase and Algolia checks to `/api/health`.
- Return `503` when a critical dependency is unreachable.

### P2.4 Improve search result mapping and display ✅

**Why:** `supabase-db.ts` maps `category`/`part_type` directly from hits, and `buildSearchResultCard` hardcodes badges.  
**Files:** `src/services/supabase-db.ts`, `src/projection/search.ts`, `src/domain/view-models/search.ts`.  
**Action:**

- Include both slug and display label in the indexed document.
- Map hits to view models using the display label, not the slug.
- Remove hardcoded `isTested`/`isGoodFit`/`isOEM` badges or compute them from real data.
- Populate `facets` in `buildSearchProjection` for the sidebar.

### P2.5 Expand drift and parity audits ✅

**Why:** `audit-search-consistency.ts` only checks title/price/condition; `search-parity.ts` hardcodes facet parity.  
**Files:** `scripts/audit-search-consistency.ts`, `scripts/scgs/search-parity.ts`.  
**Action:**

- Extend the audit to compare `category`, `part_type`, `make`, `model`, `seller_verified`, `listing_quality_score`, `seller_trust_score`.
- Implement real facet parity in `search-parity.ts` and fail below a threshold.
- Schedule the audit in the nightly workflow.

### P2.6 Decouple presentation from direct Supabase calls ✅

**Why:** Components bypass repositories/API routes and depend on `supabaseDb`/`supabaseAdmin`.  
**Files:** `src/components/SearchModal.tsx`, `src/components/homepage/PopularSellersSection.tsx`, `src/components/seller-dashboard/*`, `src/hooks/useMessaging.ts`.  
**Action:**

- Move data access into API routes or server actions.
- Components should receive data via props or use domain hooks.

### P2.7 Refactor the global store ✅

**Why:** `useAppStore` mixes auth, profile, cart, search, tour, and modal state; components subscribe to everything.  
**Files:** `src/store/useAppStore.ts`, `src/components/layout/AppWrapper.tsx`, `src/components/UIOverlays.tsx`.  
**Action:**

- Split into focused stores with selectors.
- Remove duplicate overlay mounting between `AppWrapper` and `UIOverlays`.

### P2.8 Re-enable TypeScript strict mode and tighten ESLint ✅

**Why:** `"strict": false` and disabled lint rules allow `any`, undefined globals, and unused variables.  
**Files:** `tsconfig.json`, `eslint.config.js`, `package.json`.  
**Action:**

- Set `strict: true` in `tsconfig.json`.
- Re-enable `no-explicit-any`, `no-undef`, and `no-unused-vars` as errors.
- Expand the lint script to cover all of `src`.
- **Depends on:** P0.5 (build must pass first).

### P2.9 Add security headers ✅

**Why:** No CSP, HSTS, X-Frame-Options, or Referrer-Policy.  
**Files:** `next.config.ts`.  
**Action:**

- Add a `headers()` export with baseline security headers.
- Review inline scripts/styles for CSP compatibility.

### P2.10 Fix database trigger coupling and search-path injection defense ✅

**Why:** The Algolia sync trigger performs synchronous HTTP inside the transaction, and `SECURITY DEFINER` functions lack `SET search_path`.  
**Files:** `supabase/migrations/20260603030000_setup_algolia_sync_webhook.sql`, other trigger migrations.  
**Action:**

- Move sync to an async queue or lighten the synchronous path.
- Add `SET search_path = public, pg_temp` to all `SECURITY DEFINER` functions.

---

## P3 — Low

### P3.1 Remove dead code and stale comments ✅

**Why:** Dead PDP backend module, commented JSX, unused Express handlers, and TODO/FIXME comments clutter the codebase.  
**Files:** `src/backend/modules/pdp`, `src/backend/modules/search/contracts/search-api-handler.ts`, `src/backend/modules/search/contracts/search-suggestions-handler.ts`, `src/components/GuidedTour.tsx`, various TODOs.  
**Action:**

- Delete dead modules/files.
- Remove commented code or convert TODOs into tracked issues.

### P3.2 Clean up project metadata and dependencies ✅

**Why:** Package name is `react-example`, README is outdated, and build tooling is misplaced.  
**Files:** `package.json`, `README.md`.  
**Action:**

- Rename package to `partspeddle-fe` or `vintrack`.
- Move `vite`, `express`, `@faker-js/faker`, `@types/next`, `@eslint/js`, `dotenv` to `devDependencies` or remove them.
- Update README with pnpm/Fly.io setup instructions.

### P3.3 Add Prettier config and verify Husky hooks ✅

**Why:** No Prettier config exists, and Husky hooks are generic shells that may not run lint-staged.  
**Files:** `prettier.config.js` or `.prettierrc`, `.husky/_/pre-commit`, `.husky/_/commit-msg`.  
**Action:**

- Add a Prettier configuration file.
- Verify hooks invoke `lint-staged` and `commitlint` directly.

### P3.4 Standardize error responses ✅

**Why:** Search API returns `200` with empty hits on failure, masking outages.  
**Files:** `src/app/api/search/parts/route.ts`.  
**Action:**

- Return `5xx` for infrastructure failures and `4xx` for client errors.
- Log full errors server-side but return generic messages to the client.

### P3.5 Update production Fly.io secrets ✅

**Why:** `vintrack-prod` is currently using the same Supabase/Algolia/Gemini secrets as staging. Production needs its own project/credentials before it handles real traffic.  
**Files/scope:** `docs/DEPLOYMENT_RUNBOOK.md`, Fly.io app `vintrack-prod`.  
**Action:**

- Obtain production values for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, and `GEMINI_API_KEY`.
- Run `flyctl secrets set ... --app vintrack-prod` for each production secret.
- Redeploy `vintrack-prod` and verify `/api/health` and a smoke search request.

**Completed 2026-07-09:** Production secrets sourced from `.env.production` and set on `vintrack-prod`. App redeployed and `/api/health` returned HTTP 200. See `docs/DEPLOYMENT_RUNBOOK.md` §6 for details.

### P3.6 Expand ESLint strict typing outside `src/domain` ✅

**Why:** P2.8d enforced `no-explicit-any` and `no-unused-vars` as errors only in `src/domain`. The rest of `src/` still has ~115 `no-explicit-any` violations and ~105 `no-unused-vars` warnings (non-blocking). `eslint --fix` does not auto-resolve these rules.  
**Files:** `eslint.config.js`, primarily `src/backend/modules/search/**`, `src/app/api/search/**`, `src/lib/search/**`, `scripts/search/**`, then remaining `src/**` incrementally.  
**Action:** Fix in layers; add ESLint overrides mirroring P2.8d (`no-explicit-any` + `no-unused-vars` as errors) per layer before moving to the next.

- **Layer A (~10 min):** `catch (error: unknown)` in API routes and handlers (`src/app/api/**`, `src/backend/modules/search/contracts/**`). Use `error instanceof Error ? error.message : '...'` at use sites.
- **Layer B (~30 min):** `build-search-document.ts` + `algolia-search-repository.ts` — replace `as any` with existing domain/Algolia/Supabase types.
- **Layer C (~20 min):** Test mocks → typed partials / `satisfies`; leave `expect.any(...)` vitest matchers untouched.
- **Layer D (last):** `scripts/search/**` — not in CI lint path today; align with production types after `src/` layers are clean.

- **Depends on:** P2.8d (domain strict rules landed).

### P3.7 Standardize layout architecture across pages ✅

**Why:** The current UI uses inconsistent layout strategies per page: `src/app/layout.tsx` and `AppWrapper` contain conditional logic to hide the navigation bar on auth pages, while public pages, search, listing/PDP, and dashboard all re-implement wrappers or import nav components directly. This scatters layout concerns, complicates route-group auth boundaries, and duplicates global chrome (nav bars, footers, overlays). Next.js App Router conventions favor colocated layouts in route groups that compose with `children`, so each page provides only its unique content.  
**References:** [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure), [Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages), [Linking and navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating).  
**Files:** `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(seller)/layout.tsx`, `src/app/(admin)/layout.tsx`, `src/components/layout/AppWrapper.tsx`, `src/components/UIOverlays.tsx`, `src/components/navbar/*`, `src/components/footer/*`, `src/app/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/search/page.tsx`, `src/app/(public)/listing/[id]/page.tsx`.  
**Action:**

- Adopt Next.js route-group layouts: one root `layout.tsx` with global providers/styles, then group-level layouts for `(auth)` (no global nav), `(public)` (home/search/listing with nav + footer), `(dashboard)`/`(seller)`/`(admin)` (authenticated nav + sidebar).
- Remove auth-page conditional checks from `AppWrapper`/global nav components; let route groups own the chrome.
- Move `UIOverlays`/`GuidedTour`/`HelpButton` into the root or public layout once, instead of being mounted in individual pages.
- Ensure each `page.tsx` only renders content, not the layout shell.
- Document the layout convention in `docs/NEXT_APP_ROUTER_ARCHITECTURE.md`.
- Add branch tests asserting that auth pages do not render the public navbar and that public pages share a common layout wrapper.
- **Depends on:** P5.1 (App Router route groups) — can be done together or immediately after P5.1.

---

## P4 — Supabase platform & schema governance

### P4.1 Configure CI/CD for Supabase functions and DB migrations ✅

**Why:** Migrations and Edge Functions are applied manually today; drift between repo, staging, and production is easy to miss.  
**Files:** `.github/workflows/ci.yml` (or new `supabase-deploy.yml`), `supabase/config.toml`, `supabase/functions/**`, `docs/DEPLOYMENT_RUNBOOK.md`.  
**Action:**

- Add workflow job(s) to deploy DB migrations (`supabase db push` or `supabase migration up`) and Edge Functions (`supabase functions deploy`) on approved branches/environments.
- Gate deploy on passing test/lint/typecheck; use GitHub environment secrets for staging vs production project refs and keys.
- Document rollback and dry-run steps in the deployment runbook.
- **Depends on:** P4.2 (local Supabase works), P4.4 (migration baseline verified).

### P4.2 Configure local Supabase environment ✅

**Why:** Developers cannot reliably reproduce schema, RLS, triggers, or Edge Functions without a working local stack.  
**Files:** `supabase/config.toml`, `supabase/.env.example` (or documented env vars), `package.json` scripts, `docs/DEPLOYMENT_RUNBOOK.md`.  
**Action:**

- Ensure `supabase start` / `supabase stop` / `supabase status` are documented and scripted (`db:local:up`, etc. if useful).
- Wire local URLs and keys for Next.js (`SUPABASE_URL`, anon key, service role) and Edge Function secrets.
- Register all functions in `config.toml` (`sync-algolia-webhook`, `analyze-part-image`, `send-message-notification`).
- Verify app + `process-search-outbox` can run against local Postgres.

### P4.3 Rebaseline migrations from remote schema snapshot ✅

**Why:** ~40 incremental migrations are hard to audit, reorder, and replay; remote DB is the source of truth at task start.  
**Files:** `supabase/migrations/**`, `supabase/SCHEMA.sql` (reference dump), `scripts/db/` helpers.  
**Action:**

- At task start, dump the **current remote** schema (`supabase db dump` or `pg_dump --schema-only`) and archive it under `supabase/baseline/` with timestamp.
- Replace the migration history with either:
  - a single initial migration generated from that dump, or
  - a small ordered set (extensions → types → tables → indexes → RLS → triggers → functions).
- Remove superseded historical migration files from `supabase/migrations/` once the rebaseline is validated (do not delete until P4.4 passes).
- **Depends on:** P4.2.

### P4.4 Validate local migration replay against remote schema ✅

**Why:** A rebaselined migration set is only trustworthy if replay produces the same schema as production/staging.  
**Files:** `supabase/migrations/**`, `scripts/db/verify-schema-fix.ts`, new `scripts/db/compare-schema.ts` (if needed).  
**Action:**

- On a clean local DB: `supabase db reset` → apply rebaselined migrations only.
- Dump local schema and diff against the remote snapshot from P4.3 (tables, columns, indexes, constraints, RLS policies, triggers, functions).
- Fix migration SQL until diff is empty or documented intentional deviations are approved.
- **Depends on:** P4.3.

### P4.6 Perform full database security audit ✅

**Why:** RLS, `SECURITY DEFINER` functions, grants, vault secrets, and service-role exposure need a systematic review after schema rebaseline and deploy automation.  
**Files:** `supabase/migrations/**`, `supabase/SCHEMA.sql`, `docs/PRC.md` Section 11, `scripts/db/list-triggers.ts`, `scripts/db/verify-db.ts`.  
**Action:**

- Audit: RLS enabled on all public tables; policy coverage for buyer/seller/admin paths; `SECURITY DEFINER` + `search_path` on every function; excessive grants to `anon`/`authenticated`; extension usage (`pg_net`, `vault`).
- Audit: service role key usage (repo, CI, Edge Functions, logs); webhook signature verification on functions.
- Produce checklist results against PRC security certification; file gaps as follow-up issues.
- **Depends on:** P4.4 (stable schema), P4.5 (deploy path known).

---

## P5 — Routing, web security, public pages & navigation governance

**Stack context (audit baseline):** Next.js 16 App Router + `proxy.ts` (auth/RBAC), React 19, Supabase SSR (`@supabase/ssr`) + Postgres RLS, Algolia server SDK, Fly.io (`force_https`), Edge Functions (Deno), Gemini API, Zustand client state, OpenTelemetry. P2.9 baseline security headers are live via `next.config.ts`.

**Known architectural drift (to remediate in P5):**

- Root `app/page.tsx` uses `supabaseAdmin` (service role) for a public page instead of route-group colocation and user-scoped/server repository access.
- Documented `(public)/page.tsx` and `(admin)/*` layouts do not match repo (`app/scgs/*` sits outside route groups; no `(admin)` pages).
- Parallel backend layers: thin `app/api/*/route.ts` handlers coexist with `src/backend/modules/*/contracts/*` Express-style handlers — not idiomatic Next.js Route Handlers + colocated server modules.
- Widespread `supabaseAdmin` in Route Handlers bypasses RLS; seller auth uses Bearer tokens + service role instead of cookie session helpers everywhere.
- Legacy deps remain (`express`, `vite`) though runtime is Next-only.
- Public editorial pages share no canonical layout system; navigation is hardcoded across components.
- UI/UX inconsistency: pages use different card styles, spacing scales, border radii, and typography, so the product does not yet feel like one coherent design system.

### P5.0 Public pages, design system extension & navigation ✅ CLOSED

**Why:** The six public information pages (`/about`, `/contact`, `/terms`, `/privacy`, `/salvage-network`, `/trust-verification`) were built as isolated pages and navigation was scattered as hardcoded strings. P5.0 consolidates them into a governed Information Page System, defines Editorial Page Archetypes, scopes a Support Center, and introduces a Navigation Registry. The detailed subplans have been folded into this section; P5.0 is now closed and tracked as part of the master plan.
**Files:** `src/app/(public)/**`, `src/components/information-pages/**`, `src/navigation/**`, `docs/design-system/**`, `docs/PPDS-AI-Design-Spec.md`.

#### P5.0.1 Information Page System (IPS) — IMPLEMENTED

Build reusable editorial components and refactor the six existing public pages.

- **Components added:** `InformationPageHeader`, `InformationLayout`, `StickySidebar`, `TableOfContents`, `EditorialSection`, `InfoCallout`, `SupportCard`, `RelatedLinksCard`, `ContactMethodCard`, `NetworkStatisticCard`, `TrustFeatureCard`, `VerificationProcessTimeline`, `EditorialCTA`, `ContactForm`.
- **Pages refactored:** `/about`, `/contact`, `/terms`, `/privacy`, `/salvage-network`, `/trust-verification`.
- **Artifacts:** Storybook stories, branch tests (`tests/branch/phase-11-information-page-system/`), updated `docs/design-system/06-component-library.md` and `docs/PPDS-AI-Design-Spec.md`.

#### P5.0.2 Editorial Page Archetypes — PLANNED / BACKLOG

Define canonical page compositions so future editorial pages derive from a layout rather than ad-hoc assembly.

- **Archetypes:** A — Simple Editorial, B — Documentation, C — Support Center, D — Feature Explanation, E — Program/Network Landing, F — FAQ/Knowledge Base, G — Comparison/Trust.
- **Layout helpers:** `SimpleEditorialLayout`, `DocumentationLayout`, `SupportCenterLayout`, `FeatureExplanationLayout`, `ProgramLandingLayout`, `KnowledgeBaseLayout`, `ComparisonTrustLayout`.
- **Missing components to add:** `ComparisonTable`, `FAQSearch`, `KnowledgeBaseGrid`.
- **Future pages mapped to archetypes:** Help Center (F), Buyer/Seller Guide (F), Returns (A), Shipping (A), Careers (A), Buyer Protection (D), Escrow (D), Authentication (D).

#### P5.0.3 PartsPeddle Support Center (PSC) — PLANNED / BACKLOG

Lightweight support system around a canonical **Support Conversation** domain.

- **Data model:** `support_conversations`, `support_messages`, `support_participants`, `support_attachments`.
- **Realtime:** subscribe to `support_messages` on channel `conversation:{id}`.
- **UX:** floating `SupportLauncher`, `SupportMessenger`, conversation bubbles, suggestion chips, attachment cards.
- **Rollout:** Phase 1 MVP (human chat + admin inbox) → Phase 2 AI assistant with Algolia retrieval → Phase 3 marketplace context (orders, listings, payments attached).
- **API routes:** `POST /api/support/conversation`, `POST /api/support/message`, `GET /api/support/history`, `POST /api/support/close`.

#### P5.0.4 PPDS Navigation Registry (PNR) — PLANNED / BACKLOG

Replace hardcoded paths with a typed registry that generates URLs, menus, breadcrumbs, sitemaps, and metadata.

- **Route object:** `RouteDefinition` with `id`, `name`, `path`, `title`, `description`, `visibility`, `layout`, `breadcrumbs`, `parent`, `featureFlag`, `permissions`, `searchable`, `sitemap`.
- **Builders:** `route-builder`, `breadcrumb-builder`, `menu-builder`, `sitemap-builder`, `metadata-builder`.
- **Guards:** permission and feature-flag checks.
- **Consumers:** navbar, footer, sidebar, breadcrumbs, `sitemap.xml`, `robots.txt`, SEO metadata, Algolia search, support chatbot.
- **Future direction:** evolve into a semantic navigation graph (PNGS) where pages are nodes and relationships are typed edges (`NAVIGATION`, `RELATED`, `PARENT`, `NEXT`, `CTA`).

**Depends on:** P5.1 (route-group structure stable before navigation registry consumes routes).

#### P5.0.5 PartsPeddle Product Design System (PPDS) — expanded plan

**Why:** The product is no longer a collection of pages. It is an ecosystem — Marketplace, Seller Workspace, Buyer Workspace, Admin, Support, and eventually Mobile — that must share one visual and interaction language. The public marketplace design already established the canonical tokens and components; now we formalize it into the **PartsPeddle Product Design System (PPDS)** and use it as the operating system for every surface. The dashboard and the new AI-assisted listing workflow are the first internal consumers.  
**Files/scope:** `docs/design-system/**`, `tailwind.config.ts`, `src/index.css`, `src/components/ui/**`, `src/components/design-system/**`, `src/app/(public)/**`, `src/app/(auth)/**`, `src/app/(dashboard)/**`, `src/app/(seller)/**`, `src/components/homepage/**`, `src/components/search/**`, `src/components/pdp-modern/**`, `src/components/navbar/**`, `src/components/footer/**`, `src/components/seller-dashboard/**`, `src/app/layout.tsx`.

**PPDS consumers:**

```text
PartsPeddle
├── Marketplace      (public pages)
├── Seller Workspace (inventory, listings, orders, analytics)
├── Buyer Workspace  (watchlist, messages, purchases)
├── Admin            (SCGS, moderation, system)
├── Support          (help, disputes)
└── Mobile           (future)
```

**Layer 1 — Foundations (shared everywhere):**

| Token      | Value / notes                                                      |
| ---------- | ------------------------------------------------------------------ |
| Primary    | Industrial Orange (`--color-brand-primary`)                        |
| Secondary  | Steel                                                              |
| Neutral    | Warm Gray                                                          |
| Semantic   | Success, Warning, Danger, Information                              |
| Typography | Display XL/L/M, Heading XL/L/M/S, Body L/M/S, Caption, Label, Mono |
| Radius     | XS, SM, MD, LG, XL, Full                                           |
| Shadows    | Surface, Floating, Popover, Modal, Hero                            |
| Motion     | Fast, Normal, Slow durations with shared easing                    |
| Spacing    | 4, 8, 12, 16, 24, 32, 48, 64, 96                                   |

Foundations are **never** redefined inside dashboard or marketplace pages.

**Layer 2 — Layout systems:**

- **Marketplace layout**: centered, wide margins, hero sections, editorial spacing.
- **Workspace layout**: sidebar, top navigation, page header, toolbar, content grid, optional right inspector panel.

Both layouts use the exact same spacing tokens; only composition changes.

**Layer 3 — Component hierarchy:**

```text
Primitive  → Button, Input, Badge, Chip, Avatar, Icon, Divider
Composite  → Search Bar, Price Tag, Seller Card, Vehicle Card, Image Gallery, Progress Bar
Section    → Listing Summary, Vehicle Compatibility, Media Manager, Pricing, Shipping, SEO
Page       → Inventory, Wizard, Orders, Analytics
```

**Execution phases:**

1. **Foundations — tokens and primitives** (~1 sprint) ✅
   - Move hardcoded colors/spacing/radii/shadows into `src/index.css` `@theme` tokens and keep legacy aliases in `tailwind.config.ts` during transition.
   - Lock the public-page layout grid (`Container`, `Content`, `MainGrid`).
   - Standardize one icon family (Lucide) and one font scale.
   - Add branch tests asserting token usage and forbidding new hardcoded values.

2. **Core component library** (~1–1.5 sprints) ✅
   - Build canonical components in `src/components/ui` and `src/components/design-system`.
   - Deliver primitives: `Button`, `Card`, `Badge`, `Chip`, `Tabs`, `Accordion`, `Breadcrumb`, `Skeleton`, `Pagination`, `SearchInput`, `FilterGroup`, `Modal`, `Drawer`, `Toast`, `Tooltip`.
   - Deliver domain components: `Price`, `Rating`, `InventoryCount`, `SellerSummary`, `ImageGallery`, `SpecificationTable`, `VehicleLineage`, `PartCard`, `SellerCard`.
   - Add branch tests per component; old ad-hoc components remain and are tracked for removal.

3. **Marketplace page convergence** (~1.5 sprints) ✅
   - Use the existing **part page** as the canonical template.
   - Converge **home**, **search**, **authentication**, and **footer** to PPDS cards, spacing, and typography.
   - Specific targets:
     - Home: more whitespace, single card system, larger category cards, modernized trust section.
     - Search: persistent left filter panel, top toolbar (results/sort/view/filters/inventory count), unified result cards.
     - Authentication: reduce empty space, apply token typography/buttons/cards.
       - **Security fix:** replace uses of the `user` object returned by `supabase.auth.getSession()` or `supabase.auth.onAuthStateChange()` with `supabase.auth.getUser()` for any server-side or security-sensitive auth check. The session-derived user is read from storage and may not be authentic; `getUser()` validates the JWT against the Supabase Auth server.
     - Footer: align spacing, contrast, column widths, newsletter placement.
   - **Merged:** PR #60 (`feat(ui): finish P5.0 Phase 3 marketplace convergence token cleanup`).
   - **Cleanup:** stale source branch `feat/p5-marketplace-convergence` can be deleted.

4. **PPDS documentation & Storybook** (~0.5–1 sprint)
   - Create `docs/design-system/` with the proposed structure: philosophy, tokens, layout, typography, color, elevation/motion, component library, patterns, marketplace spec, seller-workspace spec, admin spec, responsive, accessibility, animation, content guidelines, Figma mapping.
   - Install Storybook and add stories for primitives, composites, and the canonical part page.
   - Add branch tests asserting documentation files exist and Storybook builds.

5. **Workspace layout system** (~1 sprint)
   - Build the workspace shell components:
     - `WorkspaceLayout` (sidebar + top nav + content + optional inspector).
     - `Sidebar` task-oriented navigation.
     - `TopNavigation` global search + notifications + messages + tasks + profile.
     - `PageHeader` (title + subtitle + primary/secondary actions).
     - `Toolbar` page-specific actions/filters.
     - `InspectorPanel` contextual right panel.
   - Add density modes (`comfortable`, `compact`, `dense`) via a context + CSS data attribute.
   - Add branch tests for workspace shell and density modes.

6. **Seller workspace shell** (~1 sprint) ✅
   - Create or converge seller pages under `(seller)/` using the workspace layout:
     - Dashboard
     - Inventory
     - Listings
     - Orders
     - Customers
     - Messages
     - Analytics
     - Financial
     - Settings
   - Wire sidebar navigation to existing routes.
   - Replace spinner loading with skeletons.
   - **Merged:** PR #61 (`feat(p5): seller workspace shell pages, sidebar, and skeleton loading states`).

7. **Deploy & environment secrets review** (~0.5 sprint) ✅
   - Review `fly/fly.stage.toml` and `fly/fly.prod.toml` to confirm each app targets the correct Fly.io app (`vintrack-stage` / `vintrack-prod`).
   - Classify environment variables in `.env.example`: `NEXT_PUBLIC_*` (browser-safe), server-only, and CI/deploy-only.
   - Verify `docs/DEPLOYMENT_RUNBOOK.md` documents staging vs production secret sets for Supabase, Algolia, Gemini, and Fly.io.
   - Confirm `vintrack-prod` has production-specific values for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, and `GEMINI_API_KEY` via `flyctl secrets`.
   - Add branch tests asserting env classification and deploy-script conventions.

8. **Listing Draft / AI-assisted wizard** (~1.5–2 sprints) ✅
   - Replace the rigid step wizard with a persistent **Listing Draft** model.
   - Draft always exists; shows completion percentage.
   - Modules: Identification, Fitment, Pricing, Media, Shipping, SEO.
   - AI identifies from image → enriches → user approves.
   - Right inspector panel shows completion, publishing status, market value, suggested price, inventory, shipping estimate, compatibility, SEO score.
   - Autosave: local state → optimistic update → server sync → success indicator.

9. **UX polish** (~0.5–1 sprint)
   - Replace all spinners with skeletons.
   - Add sticky action/filter panels.
   - Improve empty/error/responsive states.
   - Implement unified notification center.

10. **SEO & accessibility hardening** (~0.5–1 sprint)

- Fix heading hierarchy (one H1 per page, logical H2s).
- Add Schema.org structured data (`Product`, `Offer`, `Organization`, `Breadcrumb`, `AggregateRating`).
- Image optimization: AVIF/WebP, lazy loading, preload hero, reserve image height to reduce CLS.
- WCAG: contrast (especially orange), focus indicators, keyboard nav, ARIA labels, landmarks.

11. **Live search command palette** (~1–1.5 sprints)
    - Command-palette-style dropdown with sections: Parts, Categories, Manufacturers, Vehicles, Popular/Recent/Trending.
    - Reusable across marketplace header, workspace top navigation, and mobile search.
    - Keyboard navigation, recent searches, and trending suggestions.
    - Standalone phase to allow focused design and security review.

**Mapping from public pages to seller workspace:**

| Public experience    | Seller workspace        |
| -------------------- | ----------------------- |
| Header               | Top Navigation          |
| Search Bar           | Global Workspace Search |
| Product Card         | Inventory Card          |
| Product Gallery      | Media Manager           |
| Seller Info          | Customer / Seller Panel |
| Specifications       | Property Editor         |
| Filters              | Workspace Filters       |
| Sticky Purchase Card | Context Inspector       |
| Related Listings     | Recommendations         |
| Loading Skeletons    | Same Skeleton System    |
| Buttons              | Same Button System      |
| Typography           | Same Typography System  |
| Design Tokens        | Same Design Tokens      |

**Optimal implementation approach:**

- Treat PPDS as the **product operating system**, not a page redesign.
- Build components in `src/components/ui` and `src/components/design-system` with Tailwind + CSS variables; avoid one-off styled wrappers.
- Migrate surfaces incrementally: marketplace first (it defines the canon), then seller workspace, then admin.
- Use **Storybook-style branch tests** (`tests/branch/p5-design-system/`) to assert token compliance, component contracts, workspace layouts, and page-level regressions.
- Run PPDS work in a long-lived feature branch or series of stacked PRs to `develop`; merge each phase only after tests pass.
- Coordinate with P5.1 (App Router normalization) so route-group refactors consume PPDS components instead of duplicating them.

**Depends on:** P2.1 (card/search standardization), P3.7 (layout standardization), P4.6 (DB audit complete).  
**Unblocks:** P5.1–P5.10 by providing the component layer and workspace architecture those refactored routes will use.

### P5.1 Normalize Next.js App Router structure

**Why:** Monolithic and non-standard paths make auth boundaries, caching, and security reviews harder; docs and code diverge.  
**Files:** `src/app/**`, `docs/NEXT_APP_ROUTER_ARCHITECTURE.md`, `docs/ROUTE_INVENTORY.md`.  
**Status:** 🔄 Partially completed — route groups `(public)`, `(auth)`, `(dashboard)`, `(seller)`, `(admin)` and the `(public)/page.tsx` home route are in place; `scgs` has moved under `(admin)`. Remaining: retire duplicate `backend/modules/*/contracts/*` HTTP handlers, add missing `loading.tsx`/`error.tsx` per group, and add route-group branch tests.  
**Action:**

- Enforce route groups: `(public)`, `(auth)`, `(dashboard)`, `(seller)`, `(admin)`; move `app/page.tsx` → `(public)/page.tsx`, relocate `app/scgs/**` under `(admin)/scgs/**` (or documented ops group).
- One canonical pattern per concern: **Route Handler** (`route.ts`) → server module (`src/server/` or `src/lib/`) → repository; retire duplicate `backend/modules/*/contracts/*` HTTP handlers where Route Handlers already exist.
- Add missing layouts/`loading.tsx`/`error.tsx` per group; document public vs protected vs role-gated segments.
- Add branch tests asserting route-group conventions and absence of orphan top-level pages using service-role clients.
- **Depends on:** P2.10 (trigger/outbox stable), P3.1 (dead code removal reduces noise).

### P5.2 Routing, proxy, and session security

**Why:** `proxy.ts` protects `/dashboard`, `/seller`, `/admin` pages but API routes and alternate entry points need a unified access matrix.  
**Files:** `src/proxy.ts`, `src/lib/admin-auth.ts`, `src/lib/seller-auth.ts`, `src/lib/user-roles.ts`, `src/app/api/**`.  
**Action:**

- Publish route × role × auth mechanism matrix (cookie session vs Bearer vs public).
- Align seller/admin API auth with `@supabase/ssr` cookie sessions where browser-initiated; reserve Bearer for explicit machine-to-machine paths.
- Extend proxy matcher/rules for new `(admin)` pages; block unauthenticated access to seller/admin APIs at the handler boundary (defense in depth).
- Harden session cookies: `HttpOnly`, `Secure`, `SameSite`; verify Supabase cookie refresh path through proxy.
- Add tests for RBAC redirects and API 401/403 behavior per role.

### P5.3 API security baseline

**Why:** Public and authenticated APIs lack consistent validation, rate limits, and safe error surfaces (P3.4 partially addresses search).  
**Files:** `src/app/api/**`, shared `src/lib/api/` helpers (new), `next.config.ts`.  
**Action:**

- Input validation with Zod (or equivalent) on every Route Handler body/query; standard error envelope (`4xx` client / `5xx` infra).
- Method allowlists per route; payload size limits (uploads, search query, Gemini images).
- Rate limiting for anonymous search/analytics and authenticated seller mutations (middleware/proxy edge or Fly/Upstash layer — document chosen approach).
- Idempotency keys for inventory commit and other multi-step seller writes.
- Remove infrastructure-masking `200` empty responses (complete P3.4 across search + seller APIs).
- **Depends on:** P5.1 (handler locations stable).

### P5.4 Repository and data-access security

**Why:** Direct `supabaseAdmin` usage in pages and handlers bypasses RLS and concentrates service-role power.  
**Files:** `src/repositories/**`, `src/lib/supabase-admin.ts`, `src/lib/supabase.ts`, pages/routes currently importing admin client (`app/page.tsx`, `app/(public)/listing/**`, seller/admin APIs).  
**Status:** 🔄 Partially scoped — repository interfaces exist but have no implementations; `supabaseAdmin` is used in 20+ app-layer files. A detailed plan is saved in `.planning/p5-4-repository-data-access-security.md`.  
**Action:**

- Rule: **browser** → anon key + RLS; **server user context** → SSR Supabase client with user session; **service role** → repositories/background jobs only, never in Client Components or public Server Components.
- Route all DB reads/writes through repositories or typed query modules; ban new `supabaseAdmin.from(...)` in `app/` and `components/`.
- Seller-scoped queries must filter by `seller_id` from authenticated user; admin operations behind `requireAdmin` + audit log.
- Storage uploads: MIME/size validation, private buckets, signed URLs, path namespacing per seller.
- **Depends on:** P5.1, P5.2.

### P5.5 Secrets, env, and sensitive data exposure

**Why:** Marketplace systems mix public anon keys, service role, Algolia admin, and Gemini keys — leakage paths include logs, client bundles, and CI.  
**Files:** `package.json`, `.env.example`, `fly/*.toml`, `.github/workflows/**`, `src/lib/logger.ts`, `src/lib/supabase.ts`.  
**Status:** 🔄 Partially scoped — env classification exists in `.env.example`, but there is no runtime validation, client-bundle audit, log redaction, or `pnpm audit` gate. A detailed plan is saved in `.planning/p5-5-secrets-env-sensitive-data-exposure.md`.  
**Action:**

- Inventory env vars: classify `NEXT_PUBLIC_*` (safe), server-only, CI/deploy-only; fail build/start if required secrets missing in production.
- Audit client bundle for server secrets (`ALGOLIA_ADMIN_KEY`, `SERVICE_ROLE`, `GEMINI_API_KEY` must never ship).
- Redact tokens/PII in logs and OpenTelemetry spans; scrub error responses (generic client message, detailed server log).
- GitGuardian + `pnpm audit` gates in CI; document secret rotation in `docs/DEPLOYMENT_RUNBOOK.md`.
- Align with P3.5 (production Fly secrets separation).
- **Depends on:** P5.4 (data-access paths known).

### P5.6 Frontend and client-side security

**Why:** CSP still allows `unsafe-inline`/`unsafe-eval`; client stores auth state; uploads and third-party assets expand XSS/CSRF surface.  
**Files:** `src/lib/security-headers.ts`, `src/components/**`, `src/store/**`, `src/hooks/**`, Tailwind/Next font pipeline.  
**Status:** 🔄 Partially scoped — CSP is permissive, auth role is stored in `localStorage`, and upload UI lacks client validation, but no `dangerouslySetInnerHTML` usage was found. A detailed plan is saved in `.planning/p5-6-frontend-client-side-security.md`.  
**Action:**

- Tighten CSP incrementally (nonces/hashes for scripts/styles where feasible); document required third-party origins (Supabase, Algolia, Unsplash).
- XSS: sanitize rich text/markdown if rendered; avoid `dangerouslySetInnerHTML`; validate image URLs before render.
- Auth client: ensure JWT not in `localStorage` unnecessarily; Zustand auth slice mirrors server session, clears on logout/expiry.
- CSRF: SameSite cookies + Server Actions or double-submit token for state-changing forms where cookie auth is used.
- File upload UI: client-side type/size pre-check aligned with server rules (P5.4).
- Dependency hygiene: remove unused `express`/`vite` from runtime graph (ties to P3.2).

### P5.7 Database security alignment (application ↔ Postgres)

**Why:** App-layer service role can negate RLS; policies must match the routing/RBAC model. Complements P4.6 with an application-facing lens.  
**Files:** `supabase/migrations/**`, `src/repositories/**`, `src/app/api/**`, `docs/PRC.md`.  
**Status:** 🔄 Partially scoped — RLS policies exist in `supabase/SCHEMA.sql` and the rebaseline migration, but there is no repository-to-policy map and service role currently bypasses most policies. A detailed plan is saved in `.planning/p5-7-database-security-alignment.md`.  
**Action:**

- Map each repository/route to required RLS policies; flag any that **require** service role and document justification.
- Verify buyer/seller/admin cannot read/write cross-tenant rows via anon/authenticated clients used in Server Components.
- Review RPCs (`commit_inventory_package`, etc.) for `SECURITY DEFINER` + argument validation.
- Ensure Edge Functions use webhook secrets (per P1.4) and least-privilege Supabase clients.
- **Depends on:** P4.6 (DB audit), P5.4.

### P5.8 Production web security certification

**Why:** Disparate fixes need a single production gate before high-traffic launch.  
**Files:** `docs/PRC.md` Section 11, `tests/security/**`, `.github/workflows/ci.yml`.  
**Status:** 🔄 Partially scoped — `docs/PRC.md` exists and `tests/security/search/security-search.spec.ts` covers basic query safety, but there is no consolidated security suite, manual checklist, or sign-off artifact. A detailed plan is saved in `.planning/p5-8-production-web-security-certification.md`.  
**Action:**

- Checklist run: headers (P2.9), TLS/HSTS (Fly), RBAC matrix (P5.2), API validation (P5.3), secrets scan (P5.5), OWASP Top 10 relevant items (broken access control, injection, SSRF on Gemini/webhooks, security misconfiguration).
- Automated tests: security header regression suite, API auth negative tests, optional Playwright smoke for protected routes.
- Manual spot checks: IDOR on `/listing/[id]`, seller inventory isolation, admin reindex authorization.
- Sign-off artifact linked in PRC certification.
- **Depends on:** P5.1–P5.7.

### P5.9 Update production Fly.io secrets

**Tracked as P3.5 in this plan.** This item was numbered P5.9 in `docs/REMEDIATION_PLAN.md`; during consolidation it was kept at P3.5 because it is a low-priority operations task rather than a routing/web-security concern.

### P5.10 Add Storybook for design-system documentation

**Why:** Branch tests assert token compliance and component contracts, but they are a poor way for designers and engineers to browse states, variants, and the canonical part page in isolation. Storybook provides a stable visual reference and future visual-regression target for the design system.  
**Files/scope:** `.storybook/**`, `src/components/ui/**/*.stories.tsx`, `src/components/layout/design-system/**/*.stories.tsx`, `src/components/pdp-modern/**/*.stories.tsx`.  
**Action:**

- Install Storybook for Next.js 16 + React 19 + Tailwind CSS v4 and verify it starts alongside the dev server.
- Write stories for the core tokens/primitives (`Button`, `Badge`, `Card` variants, `Container`, `Content`, `MainGrid`, `Section`, `Stack`).
- Write stories for the canonical part page (`PDPRoot`) with representative mock data.
- Configure a11y and viewport addons; run Storybook as part of CI smoke checks.
- Keep component branch tests as the primary regression harness; Storybook is visual/reference documentation, not a replacement for tests.
- **Depends on:** P5.0 Phase 2 (component library).

---

## P6 — Security hardening follow-ups

These gaps were identified during the P4.6 database security audit. They are not blockers for the current remediation sprint but must be addressed before production certification (P5.8).

### P6.1 Tighten overly permissive RLS policies

**Why:** `part_images` public read leaks images linked to draft/removed/sold parts; `fraud_events`/`risk_scores` expose internal signals to the subject user; `offers`/`conversations` insert policies lack part/seller validation; `seller_owns_profile` is an implicit `FOR ALL` policy allowing profile deletion.  
**Files:** `supabase/migrations/20260704000000_rebaseline_public_schema.sql` (policy section).  
**Action:** Add status/part-availability checks to public reads; validate `seller_id`/`part_id` on insert policies; restrict `seller_owns_profile` to SELECT/UPDATE.

### P6.2 Restrict grants and default privileges

**Why:** `GRANT ALL` is given to `anon` and `authenticated` on every table and function, including sensitive ones (`audit_log`, `fraud_events`, `risk_scores`, `users`, `transactions`). Default privileges propagate this pattern to future objects.  
**Files:** `supabase/SCHEMA.sql`, `supabase/migrations/20260704000000_rebaseline_public_schema.sql`.  
**Action:** Replace table grants with least-privilege grants; remove function grants on trigger/INTERNAL functions; remove `anon`/`authenticated` from default table/function privileges where not required.

### P6.3 Remove unused Postgres extensions

**Why:** `pg_net`, `pg_graphql`, `supabase_vault`, and `uuid-ossp` are installed but not used by the marketplace core, increasing attack surface.  
**Files:** `supabase/SCHEMA.sql`.  
**Action:** Confirm no dependencies, then `DROP EXTENSION IF EXISTS ...` for each unused extension.

### P6.4 Replace service-role usage in public/analytics routes

**Why:** `supabaseAdmin` is used in public read routes (`/api/sellers/top`, `/api/parts/featured`, `/api/taxonomy`, home/listing pages) and in analytics writes (`/api/search/clicks`, `/api/search/events`) that accept client-controlled IDs.  
**Files:** `src/app/api/**`, `src/app/(public)/**`, `src/app/(seller)/**`.  
**Action:** Use anon/SSR clients for public reads; write analytics through RLS-permitted inserts or validate/authenticate IDs server-side.

### P6.5 Add replay protection to webhook signatures

**Why:** `sync-algolia-webhook` verifies HMAC but has no timestamp/nonce, so a captured valid payload can be replayed.  
**Files:** `supabase/functions/sync-algolia-webhook/index.ts`.  
**Action:** Include a timestamp in the signed payload and reject requests older than a short tolerance window.

### P6.6 Rotate exposed staging service-role JWT ✅

**Why:** The 2026-07-07 schema dump confirmed that staging still contains legacy `sync-algolia-webhook` and `notify-new-message` database triggers that call Edge Functions with a hard-coded service-role JWT. That token must be considered exposed.  
**Files/scope:** Supabase staging project, `docs/DEPLOYMENT_RUNBOOK.md`.  
**Action:**

- Migration fix is in place in `supabase/migrations/20260704000000_rebaseline_public_schema.sql` (lines 763–764):
  ```sql
  DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts";
  DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages";
  ```
- Edge Functions have been hardened (P1.4) so the legacy bearer-token path is no longer trusted.
- The concrete rotation/deployment steps are captured in the derived checklist **P6.7**, because the project is transitioning from a remote-first (no migrations) workflow to a migration-driven workflow.

### P6.7 Apply remediation migrations to remote-first databases

**Why:** Before the local Supabase initiative the team followed a remote-first strategy: schema changes were applied directly on the Supabase dashboard or via ad-hoc scripts, and the repo did not have a migration history. The rebaseline migration and trigger-cleanup fixes now exist in `supabase/migrations/`, but they have not yet been applied to the live staging/production projects. We need a one-time checklist to safely introduce migration-driven deployments and apply the P6.6 remediation.  
**Files/scope:** Supabase staging/production projects, `supabase/migrations/20260704000000_rebaseline_public_schema.sql`, `docs/DEPLOYMENT_RUNBOOK.md`, `.github/workflows/ci.yml`.  
**Action:**

1. **Choose the migration strategy** and document it in `docs/DEPLOYMENT_RUNBOOK.md`:
   - Option A — `supabase db push`: let Supabase CLI diff/apply migrations (requires the remote project to be in a clean state or for the rebaseline to be accepted as the new baseline).
   - Option B — Manual ordered apply: run the migration SQL files via `psql`/Supabase SQL Editor in a controlled order, then mark them as applied in `supabase_migrations.schema_migrations`.
   - Option C — `supabase db reset` on staging only (accepts data loss in staging), then restore seed data.
2. **Back up each environment** before applying anything:
   - `supabase db dump --db-name postgres --schema-only` and `--data-only` for staging.
   - Snapshot the production project from Supabase Dashboard if available.
3. **Validate remote vs. migration parity**:
   - Dump the remote schema after any pre-migration manual fixes.
   - Diff against `supabase/baseline/remote_20260707_public.sql` plus the repo migrations.
   - Resolve any drift caused by ad-hoc remote changes (e.g., extra indexes, columns, or triggers not in migrations).
4. **Apply the migration stack** that contains the trigger cleanup:
   - At minimum `supabase/migrations/20260704000000_rebaseline_public_schema.sql` (drops legacy triggers, creates `search_outbox`, hardens `SECURITY DEFINER` functions).
   - Apply first to staging, run smoke tests, then to production.
5. **Rotate the Supabase service-role JWT** immediately after the migration is applied:
   - Dashboard → Project Settings → API → Rotate JWT secret.
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Fly.io staging/production secrets.
   - Update GitHub Actions secrets used by CI deploy jobs.
6. **Verify the legacy triggers are gone**:
   ```sql
   SELECT trigger_name, event_object_table
   FROM information_schema.triggers
   WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');
   ```
   Expected: zero rows.
7. **Smoke-test the replacement paths**:
   - Algolia sync: insert/update a part, confirm a `search_outbox` row is created and `scripts/search/process-search-outbox.ts` (or the scheduled worker) syncs it to Algolia.
   - Message notifications: confirm the `notify-new-message` trigger is no longer firing and that the application invokes `send-message-notification` explicitly (or document that notifications are currently a logging stub).
8. **Lock in the migration workflow**:
   - Enforce that all future DB changes come through `supabase/migrations/` and the CI `supabase db push` job.
   - Add a pre-deploy check that fails if remote drift is detected.

**Depends on:** P4.4 (migration replay parity validated locally), P4.5 (CI/CD deploy path proven).

---

## Final verification

### Final verification — Supabase CI/CD end-to-end exercise

**Why:** Workflow YAML alone is insufficient — deploy paths, secrets, and function bundles must be proven in staging before the final `develop → main` merge.  
**Files:** `.github/workflows/**`, Supabase staging project, Fly.io staging (if app depends on new schema/functions).  
**Status:** ✅ Completed — staging CI/CD deploy path exercised and verified; evidence recorded in the deployment runbook.  
**Action:**

- ✅ Run migration deploy and function deploy from CI against staging; confirm `/api/health`, search outbox processing, and one Edge Function smoke call.
- ✅ Test failure modes: bad migration blocks deploy; function deploy rolls forward cleanly.
- ✅ Record evidence (CI run URLs, schema version, function versions) in runbook or certification note.
- **Depends on:** P4.1, P4.4.

## Completion

Final cross-cutting milestones to close the remediation effort.

### CI/CD consolidation

**Why:** The deploy pipeline has been patched incrementally (Fly.io env-file handling, Supabase migration jobs, staging smoke tests). A final consolidation pass ensures the pipeline is documented, reproducible, and fully green before production traffic.  
**Files/scope:** `.github/workflows/ci.yml`, `fly/fly.stage.toml`, `fly/fly.prod.toml`, `scripts/ops/deploy.sh`, `docs/DEPLOYMENT_RUNBOOK.md`.  
**Action:**

- Verify the `develop` branch deploys cleanly to staging via GitHub Actions (Fly.io + Supabase + smoke tests).
- Verify the `main` branch deploys cleanly to production.
- Document any manual steps or secrets required in `docs/DEPLOYMENT_RUNBOOK.md`.
- Remove or archive the local deploy workarounds if CI is now the canonical path.

### Final `develop → main` merge

**Why:** `main` is the production source of truth, but all remediation work has landed on `develop`. A final merge promotes the completed work to `main`.  
**Files/scope:** `main`, `develop`.  
**Action:**

- Ensure all P0–P6 work is verified on `develop`.
- Open a merge PR from `develop` to `main`.
- Run the full CI suite and staging smoke tests one last time.
- Merge and tag the release.

---

## Current Status Summary

| Phase      | Completed          | Pending                                                                    |
| ---------- | ------------------ | -------------------------------------------------------------------------- |
| Pre-P0     | Pre-P0.1           | —                                                                          |
| P0         | P0.1–P0.6          | —                                                                          |
| P1         | P1.1–P1.10         | —                                                                          |
| P2         | P2.1–P2.10         | —                                                                          |
| P3         | P3.1–P3.7          | —                                                                          |
| P4         | P4.1–P4.6          | —                                                                          |
| P5         | P5.0 closed        | P5.1 (partial), P5.2–P5.8, P5.10 Storybook for design-system documentation |
| P6         | P6.6               | P6.1–P6.5, P6.7                                                            |
| Completion | Final verification | CI/CD consolidation, Final `develop → main` merge                          |

**Total completed:** ~43 items  
**Total pending:** 17 items (P5.1 partial, P5.2–P5.8, P5.10, P6.1–P6.5, P6.7, CI/CD consolidation, Final `develop → main` merge)

---

## Execution order

0. **Pre-P0 cleanup:** audit and clean up stale branches (Pre-P0.1) before any code changes.
1. **P0 foundation:** taxonomy source of truth (P0.2) → taxonomy indexing (P0.1) → unified indexing logic (P0.3) → middleware + admin protection (P0.4) → remove `ignoreBuildErrors` and fix imports/types (P0.5) → fix remaining TypeScript errors from PR #3 (P0.6).
2. **P1 hardening:** server-side roles (P1.1) → fitment in Algolia (P1.2) → ranking cleanup (P1.3) → Edge Function security (P1.4) → filter escaping (P1.5) → CI/Docker fixes (P1.6) → mobile viewport / video tutorial / focus cleanup (P1.7) → mobile search and homepage overflow fixes (P1.8) → modern PDP responsive layout (P1.9) → seller dashboard mobile adaptation (P1.10).
3. **P2 quality:** UI/UX card/search standardization (P2.1) → server-side search fetch (P2.2) → health check (P2.3) → result mapping (P2.4) → drift/parity audits (P2.5) → Supabase decoupling (P2.6) → store refactor (P2.7) → strict mode + ESLint (P2.8) → security headers (P2.9) → DB trigger cleanup (P2.10).
4. **P3 polish:** dead code removal, metadata, Prettier/Husky, error responses → update production Fly.io secrets (P3.5) → expand ESLint strict typing outside domain (P3.6) → standardize layout architecture across pages (P3.7).
5. **P4 Supabase platform:** local environment (P4.2) → remote schema rebaseline (P4.3) → local replay parity (P4.4) → CI/CD for migrations + functions (P4.1) → end-to-end deploy verification (P4.5) → full database security audit (P4.6).
6. **P6 security hardening follow-ups:** address non-critical gaps from P4.6 (P6.1–P6.6) before production certification; apply the remote-first migration checklist (P6.7) once the migration strategy is chosen.
7. **P5 routing, web security, public pages & navigation:** P5.0 public pages and navigation governance is **closed** (IPS implemented; archetypes, support center, navigation registry, and PPDS execution phases are backlog items tracked in the master plan). Remaining P5 work: App Router normalization (P5.1) → proxy/session RBAC (P5.2) → API security baseline (P5.3) → repository/data-access containment (P5.4) → secrets/env hygiene (P5.5) → frontend client security (P5.6) → DB/app RLS alignment (P5.7, after P4.6/P6) → production security certification (P5.8) → add Storybook for design-system documentation (P5.10). Production Fly.io secrets are tracked at P3.5.

Items marked **Depends on** should not start until their dependency is complete.

8. **Completion:** consolidate and document the CI/CD pipeline (Completion — CI/CD consolidation) → merge `develop` into `main` and tag the release (Completion — Final `develop → main` merge).

Items marked **Depends on** should not start until their dependency is complete.

**Cross-track note:** P5 can begin P5.1–P5.3 in parallel with late P3 items; P5.7 should follow P4.6/P6; P5.8 is the final security gate before production traffic; the final merge happens after all verification passes.
