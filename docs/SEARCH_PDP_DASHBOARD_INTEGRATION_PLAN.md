# Search, PDP, and Dashboard Integration Plan (SCGS Integration)

This document outlines the operational roadmap for integrating the remaining catalog consumers (Search, LiveSearch, PDP, Dashboard) into the finalized SCGS architecture.

**Architectural Law**: We are now in a "Harvesting Phase." All semantic interpretation must occur in the SCGS kernel. Consumers are pure projection layers. No new architecture, no new governance systems.

---

## Phase A — Search Infrastructure
*Highest business value, highest risk, highest visibility.*

- **A1. Search Projection Foundation**: `src/projection/search.ts` (Complete)
- **A2. SCGS Search API**: `/api/search.scgs` (Complete)
- **A3. SearchResultsController**: Dual-read/Shadow mode (Complete)
- **A4. Parity Gate**: Search parity baseline (Complete)
- **A5. Feature Flag Rollout**: Staged traffic migration.

---

## Phase B — Search Ranking Migration (Current Focus)

- **B1 (PR #2C.1): Ranking Certification & Explainability**: Implement `RankingEngine` tests, verify ranking explainability, and certify baseline metrics.
- **B2 (PR #2C.2): Ranking Migration**: Integrate `RankingEngine` into the compiler pipeline.
- **B3 (PR #2C.3): Search Cutover**: Transition to primary SCGS ranking.

---

## Phase C — LiveSearch
- **C1. LiveSearch Projection**: Implement `LiveSearchProjection`.
- **C2. Autocomplete Projection**: Map suggestions through compiler output.
- **C3. Ranking Explainability**: Expose scoring breakdown to LiveSearch.
- **C4. Rollout**: Full SCGS-backed suggestion engine.

---

## Phase D — PDP Migration
- **D1. PartViewModel Projection**: Implement `src/projection/pdp.ts` fully.
- **D2. PDP Route Migration**: Migrate `/listing/[id]` to consume `CompiledSpecificationSet`.
- **D3. Component Integration**: Wiring sub-components to pure ViewModels.
- **D4. Parity Validation**: Validate rendered output.

---

## Phase E — Dashboard Observability
- **E1. Dashboard Read Model API**: Expose `SCGSReadModel` endpoints.
- **E2. Listing Health Views**: UI dashboard for category stability.
- **E3. Replay Visualization**: Integrate the `SemanticReplayTrace`.
- **E4. Production Rollout**: Enable for team-wide use.


---

## Operational Enforcement Rules (Immutable)

1.  **NO BUILDERS**: `PartViewModelBuilder` and similar patterns are permanently removed.
2.  **PURE PROJECTIONS**: Projection functions (in `/projection/`) MUST NOT contain domain logic, grouping, or sorting.
3.  **CI BLOCK**: Any attempt to move interpretation logic out of the SCGS kernel will cause the `scgs:prr` gate to fail the PR build.
4.  **SEMANTIC PARITY**: Every Search/PDP migration must pass the parity test before the feature flag is enabled.

---

## Execution Sequence

1.  Merge PR #1 (SCGS Core).
2.  Execute PR #2 (Search Projection Integration).
3.  Execute PR #3 (PDP Migration).
4.  Execute PR #4 (Dashboard).
5.  Remove legacy Algolia/Builder paths (Final Cleanup).

**This plan is now the System of Record for project execution.**
