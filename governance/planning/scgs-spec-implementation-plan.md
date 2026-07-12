# SCGS Specification Implementation Plan

**Goal:** Align the existing SCGS implementation with the specification documents in `/Users/dev/Documents/SCGS/` and close the highest-value gaps incrementally.

**Source specifications:**

- `1.0 SCGS Search Platform Specification.md` — SCGS foundation, domain model, compiler architecture, ranking, projections.
- `2.0 PartsPeddle Semantic Platform Specification (PSPS).md` — 18-volume engineering constitution plus the Semantic Data Lineage Specification (SDLS).
- `3.0 Marketplace Semantic Model (MSM).md` — canonical domain ontology for Vehicle, Part, Listing, Specification, Compatibility, Fitment, Trust, Ranking, Recommendation, Projection.

**Branch:** `feat/scgs-spec-plan`

---

## 1. Specification Hierarchy

The three documents form a layered specification stack:

```text
Marketplace Semantic Model (MSM)
  ↓ defines the business language
Semantic Data Lineage Specification (SDLS)
  ↓ defines how information flows
SCGS Search Platform Specification
  ↓ defines how semantic knowledge is compiled
PartsPeddle Semantic Platform Specification (PSPS)
  ↓ defines every subsystem, directory, API, CI stage, and migration path
```

For implementation purposes, the work falls into four buckets:

1. **Formalize specifications as documents** — write canonical `docs/specifications/` versions of MSM and SDLS.
2. **Strengthen the compiler artifact model** — introduce explicit `SemanticSpecification`, `RankedArtifact`, lineage IDs, and richer ranking signals.
3. **Build stable projection contracts** — `SearchViewModel`, `PDPViewModel`, `DashboardListingViewModel`, `LiveSearchViewModel`.
4. **Close semantic capabilities** — trust profiles, compatibility/fitment, recommendations, specification framework.
5. **Integrate governance into CI** — make `scgs:ci:decide` and the governance controller real gates.

---

## 2. Current SCGS Inventory

### What exists today

| Component | Location | Status |
| --------- | -------- | ------ |
| `SpecificationCompilerImpl` | `apps/web/src/domain/services/specification.compiler.ts` | Compiles specs → `CompiledSpecificationSet` (flat, grouped, facets, ranking factors). |
| `CompiledSemanticArtifact` type | `apps/web/src/domain/specification/scgs/types.ts` | Has listingId, categoryId, version, compiled payload, checksum, metadata. |
| `RankingEngine` | `apps/web/src/domain/specification/scgs/ranking/ranking.engine.ts` | 3-factor ranking (listingQuality, sellerTrust, recency) with explanations. |
| Diff engine | `apps/web/src/domain/specification/scgs/diff.engine.ts` | Group and facet diffs with severity scoring. |
| Governance policy evaluator | `apps/web/src/domain/specification/scgs/governance.ts` | Evaluates evolution against policy. |
| PTS engine | `apps/web/src/domain/specification/scgs/pts.engine.ts` | Simple drift score. |
| Replay engine | `apps/web/src/domain/specification/scgs/replay/engine.ts` | Reconstructs traces from two artifacts. |
| Replay validator | `apps/web/src/domain/specification/scgs/replay/validator.ts` | Checks losslessness, PTS/CI binding, snapshot integrity. |
| Governance controller | `apps/web/src/domain/specification/scgs/controller.ts` | Maps system state → allowed/forbidden actions. |
| Dashboard projection | `apps/web/src/domain/specification/scgs/dashboard.projection.ts` | Builds `SCGSReadModel` for the admin dashboard. |
| SCGS comparison API | `apps/web/src/app/api/search/scgs/route.ts` | Compares Algolia ranking vs SCGS ranking. |
| Admin dashboard UI | `apps/web/src/app/(admin)/scgs/dashboard/[category]/page.tsx` | Visualizes violations and drift. |
| SCGS scripts | `platform/scripts/scgs/` | `replay-validate.ts`, `ranking-signal-audit.ts`, `ci-decide.ts` (stub), `prr.ts`. |
| Tests | `tests/integration/scgs/`, `tests/integration/middleware-and-types/` | Determinism, replay trace, ranking resurrection. |
| Documentation | `governance/scgs/` | Architecture, governance controller, PRR certification, system operations. |

### What is missing or incomplete

| Gap | Spec Reference | Impact |
| --- | -------------- | ------ |
| No formal `MarketplaceSemanticModel` document | MSM | Domain vocabulary is implicit. |
| No `SemanticDataLineageSpecification` document | PSPS SDLS | Data flows are not formally traced. |
| No explicit `SemanticSpecification` stage in compiler | SCGS Ch. 10, 24 | Compiler jumps from raw specs to compiled artifact. |
| No `RankedArtifact` type | SCGS Ch. 13 | Ranking output is just an array of results. |
| No formal `SearchViewModel` projection contract | SCGS Ch. 15 | Search projection is generic, not SCGS-owned. |
| No PDP projection | PSPS Vol. VII | Product Detail Page lacks SCGS projection. |
| No LiveSearch projection | PSPS Vol. VI | Live search suggestions are not governed. |
| No DashboardListing projection | PSPS Vol. VIII | Seller dashboard listing cards not governed. |
| Ranking signals are limited (3 factors) | SCGS Ch. 11, 12, 26 | Missing image quality, inventory completeness, popularity, response rate, conversion, compatibility. |
| Ranking explanation lacks normalized value and textual explanation | SCGS Ch. 14.3 | Explainability is incomplete. |
| No trust profile compilation | MSM Ch. 17 | Seller trust is just a raw score. |
| No compatibility/fitment compilation | MSM Ch. 12, 13 | Compatibility is not a computed semantic conclusion. |
| No recommendation engine | MSM Ch. 19 | Recommendations not implemented. |
| Specification framework is ad hoc | PSPS Vol. IV | No `SpecificationDefinition`, `SpecificationGroup`, `CategoryTemplate`. |
| `scgs:ci:decide` is a stub | PSPS Vol. X | CI does not enforce SCGS gates. |
| Replay storage uses local filesystem | SCGS Ch. 28 | No durable snapshot store. |
| No lineage IDs on artifacts | SDLS Ch. 7 | Artifacts cannot be traced end-to-end. |
| Governance controller not integrated into CI/workflow | SCGS Ch. 4 | Behavioral responses are not enforced. |

---

## 3. Implementation Roadmap

The roadmap is intentionally incremental. Each phase produces a mergeable, testable increment.

### Phase 0 — Specification Documents (Planning)

Create canonical specifications under `docs/specifications/`:

- `docs/specifications/marketplace-semantic-model.md` — formalize MSM.
- `docs/specifications/semantic-data-lineage.md` — formalize SDLS.
- `docs/specifications/scgs-domain-model.md` — extract domain objects from SCGS spec Vol. II.
- `docs/specifications/scgs-compiler-pipeline.md` — extract compiler stages from SCGS spec Vol. III.

These documents become the reference for all subsequent implementation. They do not change code.

**Verification:** Review for accuracy and internal consistency.

### Phase 1 — Compiler Artifact Model

Strengthen the compiler so it produces a richer, lineage-aware artifact.

Deliverables:

1. Introduce `SemanticSpecification` type representing the compiler's interpretation plan.
2. Refactor `SpecificationCompilerImpl` to expose explicit stages:
   - Input Acquisition
   - Validation
   - Normalization
   - Semantic Resolution
   - Specification Expansion
   - Facet Compilation
   - Ranking Signal Extraction
   - Artifact Packaging
   - Replay Generation
3. Add `RankedArtifact` type produced by `RankingEngine.rank()`.
4. Add `LineageId` to `CompiledSemanticArtifact` and `RankedArtifact`.
5. Expand ranking signals:
   - `imageQuality`
   - `inventoryCompleteness`
   - `popularity`
   - `responseRate`
   - `conversionScore`
6. Improve `RankingExplanation` with normalized value and textual explanation per contribution.
7. Add/extend unit tests for compiler stages and ranking engine.

**Verification:**

- `pnpm vitest run tests/integration/scgs/`
- `pnpm vitest run tests/unit/` (new compiler tests)
- `pnpm lint --cache`, `pnpm typecheck`

### Phase 2 — Search Projection Contract

Make `SearchViewModel` a first-class SCGS projection contract.

Deliverables:

1. Define `SearchViewModel` schema (Zod) with:
   - results: `SearchResultCardModel[]`
   - facets: grouped facets ready for display
   - pagination: page, pageSize, totalResults, totalPages, hasNext, hasPrevious
   - metadata: compiler version, ranking version, replay id, generation timestamp
2. Create `buildSearchViewModel` projection from `RankedArtifact[]`.
3. Update `/api/search/scgs` to return `SearchViewModel` as the primary response.
4. Add certification tests asserting consumers receive only the projection contract.

**Verification:**

- `pnpm vitest run tests/integration/scgs/scgs-ranking-resurrection.test.tsx`
- `pnpm vitest run tests/certification/`

### Phase 3 — PDP Projection

Build the Product Detail Page projection.

Deliverables:

1. Define `PDPViewModel` schema with sections:
   - gallery
   - header
   - pricing
   - specifications
   - compatibility
   - seller/trust
   - shipping
   - recommendations placeholder
   - actions
2. Create `buildPDPViewModel` projection from a single `CompiledSemanticArtifact`.
3. Add API route `/api/listings/[id]/scgs` or integrate into existing PDP route.
4. Update PDP page to consume the projection where feasible.

**Verification:**

- `pnpm vitest run tests/integration/scgs/`
- `pnpm build` (to verify PDP page still builds)

### Phase 4 — Semantic Capabilities (Trust, Compatibility)

Add trust profile and compatibility/fitment compilation.

Deliverables:

1. `TrustCompiler` — produces `TrustProfile` from seller history inputs.
2. `CompatibilityCompiler` — produces `CompatibilityConclusion` from Vehicle + Part + Specifications + OEM.
3. `FitmentCompiler` — narrower fitment conclusion.
4. Integrate these into `SpecificationCompilerImpl` so artifacts carry trust and compatibility metadata.
5. Add governance tests for these new semantic outputs.

**Verification:**

- `pnpm vitest run tests/governance/scgs/`
- `pnpm vitest run tests/unit/scgs/`

### Phase 5 — Specification Framework

Formalize the specification declaration system.

Deliverables:

1. `SpecificationDefinition` type (key, label, type, unit, validation, searchable, facetable).
2. `SpecificationGroup` type (name, order, definitions).
3. `CategoryTemplate` type (categoryId, groups, inherited definitions).
4. `SpecificationValue` type (definitionRef, value).
5. Refactor `SpecificationCompilerImpl` to consume the framework types.
6. Migration path from current ad hoc spec tables to framework schema.

**Verification:**

- `pnpm vitest run tests/integration/scgs/`
- `pnpm db:validate:replay`

### Phase 6 — Governance & CI Integration

Make SCGS gates real.

Deliverables:

1. Implement `scgs:ci:decide` to evaluate governance controller and return PASS/WARN/BLOCK.
2. Add SCGS gate to `.github/workflows/ci.yml` after test/lint.
3. Persist replay traces and snapshots to a durable store (Supabase or S3-compatible) instead of local filesystem.
4. Add `scgs:prr` enforcement to block PRs with semantic drift violations.
5. Dashboard improvements: show lineage IDs, lineage graph, data lineage trace.

**Verification:**

- `pnpm delivery:manifest:validate`
- CI run on a test branch

### Phase 7 — Advanced Capabilities

Recommendation engine, live search suggestions, autocomplete, semantic search.

Deliverables:

1. `RecommendationCompiler` using compatibility + user context + behavior.
2. `LiveSearchProjection` for suggestions.
3. SCGS-powered autocomplete.
4. Semantic search query intent parsing.

**Verification:**

- Feature-specific tests
- `pnpm test` default suite

---

## 4. Recommended First Phase

**Start with Phase 0 + Phase 1 together.**

Phase 0 produces the canonical documents that justify every code change in Phase 1. Phase 1 delivers immediate value:

- A lineage-aware compiler artifact.
- A richer, explainable ranking engine.
- A formal `RankedArtifact` type.
- Better test coverage.

This is the highest-ROI starting point because it hardens the existing SCGS foundation without touching UI or database schema significantly.

### Phase 1 Detailed Deliverables

#### 4.1 New and updated types

Files:

- `apps/web/src/domain/specification/scgs/types.ts`
- `apps/web/src/domain/specification/scgs/ranking/ranking.types.ts`

Changes:

- Add `SemanticSpecification` interface.
- Add `RankedArtifact` interface (extends compiled artifact with score, rank, tieBreaker, explanation).
- Add `LineageId` branded string.
- Add `RankingFactorName` union.
- Extend `RankingContribution` with `normalizedValue` and `explanation`.

#### 4.2 Compiler refactor

File: `apps/web/src/domain/services/specification.compiler.ts`

Changes:

- Split `compile()` into explicit internal stages.
- Return `CompiledSemanticArtifact` instead of `CompiledSpecificationSet`.
- Add `lineageId` to output.
- Emit `CompilerStageEvent` for replay.
- Keep backward compatibility by exposing a helper that returns just `CompiledSpecificationSet` if needed.

#### 4.3 Ranking engine improvements

File: `apps/web/src/domain/specification/scgs/ranking/ranking.engine.ts`

Changes:

- Accept new signals from artifact.
- Make weights configurable per ranking version.
- Add tie-breaker metadata.
- Return `RankedArtifact[]`.

#### 4.4 Search API update

File: `apps/web/src/app/api/search/scgs/route.ts`

Changes:

- Build `RankedArtifact[]` from ranking engine.
- Build `SearchViewModel` from projection (Phase 2) or keep comparison payload during transition.

#### 4.5 Tests

New tests:

- `tests/unit/scgs/compiler-stages.test.ts`
- `tests/unit/scgs/ranking-explanation.test.ts`
- `tests/integration/scgs/lineage.test.ts`

Updated tests:

- `tests/integration/scgs/scgs-ranking-resurrection.test.tsx`
- `tests/integration/middleware-and-types/scgs-replay.test.ts`

---

## 5. Out of Scope for This Plan

- Rewriting the search index pipeline (Algolia indexing remains separate).
- Replacing the UI component library.
- Changing the database schema for listings/sellers (Phase 5 may touch spec tables only).
- Multi-language or locale-specific semantics.
- Real-time streaming compilation.

---

## 6. Success Criteria

After all phases:

- Every semantic interpretation flows through SCGS.
- UI components consume only projection contracts.
- Every compiled artifact has a lineage ID and is replayable.
- Ranking decisions are explainable.
- CI blocks semantic drift violations.
- `docs/specifications/` contains canonical MSM, SDLS, SCGS domain model, and compiler pipeline docs.

After Phase 1:

- `CompiledSemanticArtifact` has lineage ID and explicit compiler stages.
- `RankingEngine` returns `RankedArtifact[]` with richer explanations.
- All compiler and ranking tests pass.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Refactoring compiler breaks existing dashboard and API | Keep old interfaces as shims during transition; add integration tests before refactoring. |
| Adding ranking signals requires data not yet in Algolia/index | Start with signals already available (listingQuality, sellerTrust, recency) and make new signals optional with defaults. |
| Phase scope becomes too large | Strictly limit Phase 1 to artifact model + ranking; defer projections and capabilities. |
| Spec documents become stale | Update spec documents whenever the corresponding code changes. |
| CI billing continues to block automated checks | Continue local verification and `--admin` merges until billing is resolved. |

---

## 8. Next Action

Approve this plan, then create branch `feat/scgs-phase-1-artifact-model` and begin Phase 0 + Phase 1.
