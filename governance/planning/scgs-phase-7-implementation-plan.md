# SCGS Phase 7 — Advanced Capabilities

**Goal:** Add semantic search intent parsing, live-search projections with SCGS-powered autocomplete, and a recommendation engine on top of the canonical SCGS foundation.

**Branch:** `feat/scgs-phase-7-advanced-capabilities`

**Source plan:** `governance/planning/scgs-spec-implementation-plan.md` § Phase 7.

**Boundary rule:** This phase intentionally does **not** change the Algolia indexing pipeline, add new database tables, or fix the analytics schema. It builds new SCGS capabilities and wires them into existing UI/API surfaces using data already available (compatibility, category, part_type, seller trust).

---

## 1. Scope

### In scope

1. **Semantic query intent parser** — classify search queries as part name, YMM (year/make/model), VIN, or OEM part number.
2. **LiveSearch projection contract** — Zod schema for grouped, ranked autocomplete suggestions.
3. **`buildLiveSearchViewModel` use case** — produces the projection from Algolia hits + SCGS intent parsing.
4. **Autocomplete API** — enhance `/api/search/suggestions` or add `/api/search/live` to return the SCGS projection.
5. **Recommendation engine** — `RecommendationCompiler` and `buildRecommendations` use case using compatibility + category/part-type similarity + seller trust.
6. **Recommendation API** — `/api/listings/[id]/recommendations` returning related/compatible parts.
7. **PDP wiring** — populate `crossSell` in `buildPDPViewModel` and the PDP page using recommendations.
8. **Module-owned contract/integration tests** for intent parser, live search, and recommendations.
9. **Updated documentation** (`README.md`, `scgs-compiler-pipeline.md`).

### Out of scope

- New database tables for user behavior (views, favorites).
- Fixing `SearchAnalyticsService` schema mismatch.
- Rewiring the full search page to use `/api/search/scgs` as primary.
- Replacing `SearchModal` with `SearchCommandPalette`.
- Extending `SearchDocument`/Algolia index with new ranking signals.

---

## 2. Deliverables and Execution Order

### 2.1 Semantic query intent parser

Files:

- `apps/web/src/backend/modules/scgs/domain/search-intent.ts` — `SearchIntent` union and input types.
- `apps/web/src/backend/modules/scgs/infrastructure/query-intent-parser.ts` — parser with regex/heuristic classifiers.

Classifiers:

- `VIN`: 17-character alphanumeric (excluding I, O, Q).
- `OEM_PART_NUMBER`: alphanumeric pattern with common delimiters.
- `YMM`: year (19xx-20xx) + make + model combinations.
- `PART_NAME`: default fallback.

### 2.2 LiveSearch projection contract

Files:

- `apps/web/src/backend/modules/scgs/contract/live-search-view-model.contract.ts`

Schema includes:

- `query`: original query string.
- `intent`: detected intent type and extracted entities.
- `groups`: array of suggestion groups (`products`, `vehicles`, `taxonomy`, `manufacturers`, `recent`).
- `meta`: compiler version, ranking version, timestamp.

### 2.3 LiveSearch use case and API

Files:

- `apps/web/src/backend/modules/scgs/application/build-live-search-view-model.ts`
- `apps/web/src/app/api/search/live/route.ts` (or update `apps/web/src/app/api/search/suggestions/route.ts`)

Behavior:

1. Parse query intent.
2. Query Algolia via existing `AlgoliaSearchRepository` or direct index client.
3. Group and rank hits into suggestion buckets.
4. Return validated `LiveSearchViewModel`.

### 2.4 Recommendation engine

Files:

- `apps/web/src/backend/modules/scgs/domain/recommendation.ts` — `Recommendation` types.
- `apps/web/src/backend/modules/scgs/infrastructure/recommendation-compiler.ts` — scoring logic.
- `apps/web/src/backend/modules/scgs/application/build-recommendations.ts` — use case.

Inputs:

- `CompiledSemanticArtifact` for the source listing.
- Optional user context (recently viewed IDs, category preferences).
- Catalog repository for candidate parts.

Scoring signals (all available today):

- Compatibility overlap (+)
- Same category/part_type (+)
- Same seller or high trust (+)
- Already in cross-sell/compatible list (+)
- Same listing (excluded)

### 2.5 Recommendation API and PDP wiring

Files:

- `apps/web/src/app/api/listings/[id]/recommendations/route.ts`
- `apps/web/src/backend/modules/scgs/application/build-pdp-view-model.ts` — add crossSell from recommendations.
- `apps/web/src/app/(public)/listing/[id]/page.tsx` — ensure recommendations are passed through.

### 2.6 Tests

New module-owned tests:

- `apps/web/src/backend/modules/scgs/tests/unit/query-intent-parser.test.ts`
- `apps/web/src/backend/modules/scgs/tests/contract/live-search-view-model.contract.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/build-live-search-view-model.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/recommendation-compiler.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/build-pdp-view-model.test.ts` (update existing or add crossSell assertions)

### 2.7 Documentation

- Update `apps/web/src/backend/modules/scgs/README.md` with Phase 7 capabilities.
- Update `docs/specifications/scgs-compiler-pipeline.md` with live search and recommendation sections.
- Update `governance/planning/session-checkpoint.md` to mark Phase 7 in progress / completed.

---

## 3. Verification Commands

During development, run per deliverable:

```bash
# After domain / application changes
cd apps/web && pnpm typecheck

# After script changes
pnpm lint --cache

# Module tests
pnpm vitest run apps/web/src/backend/modules/scgs/tests/

# Delivery manifest
pnpm delivery:manifest:validate
```

Final PR verification:

```bash
pnpm install
pnpm lint --cache
pnpm typecheck
pnpm vitest run apps/web/src/backend/modules/scgs/tests/ tests/integration/search-api.spec.ts
pnpm delivery:manifest:validate
```

---

## 4. Risks and Mitigations

| Risk                                                     | Mitigation                                                                                                       |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Autocomplete response latency increases                  | Cache intent parsing; keep Algolia query minimal (hitsPerPage ≤ 10); add test timeout.                           |
| Recommendation results feel low quality                  | Keep scoring transparent with explanation; default to category/part-type similarity when compatibility is empty. |
| PDP build breaks due to new crossSell shape              | Maintain existing `PDPPartSummaryModel` contract; only populate the array.                                       |
| SearchAnalyticsService mismatch blocks behavior features | Do not depend on analytics in Phase 7; use only static/catalog signals.                                          |
| UI consumes old suggestions endpoint                     | Add new `/api/search/live` route and update `SearchDropdownController` gradually; keep old route as fallback.    |
| GitHub Actions billing blocks CI                         | Continue local verification and `--admin` merge until billing is resolved.                                       |

---

## 5. Approval Checklist

- [ ] Scope and boundaries are acceptable.
- [ ] One PR for the entire phase is acceptable.
- [ ] Autocomplete will use a new `/api/search/live` route.
- [ ] Recommendations will use compatibility + category/part-type + seller trust only.

**Next action after approval:** Create branch `feat/scgs-phase-7-advanced-capabilities`, update the session checkpoint, and begin with §2.1 semantic query intent parser.
