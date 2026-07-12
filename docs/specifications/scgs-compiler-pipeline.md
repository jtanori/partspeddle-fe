# SCGS Compiler Pipeline

## Pipeline stages

### 1. Fetch

`SpecificationCompilerImpl` fetches in parallel through the
`SpecificationFrameworkRepository` port:

- `CategoryTemplate` for the listing category.
- `SpecificationValue[]` for the listing.
- Listing entity (`listingRepo.findById`).

### 2. Framework resolution

Raw catalog and listing data are mapped to canonical SCGS framework types by
`specification-framework-mapper.ts`:

- `SpecificationDefinition` — what is being measured.
- `SpecificationGroup` — how definitions are organized for display.
- `CategoryTemplate` — the blueprint for a category.
- `SpecificationValue` — a definition plus its raw and resolved value.

### 3. Resolve

Each `SpecificationValue` is matched against the template to produce a
`ResolvedSpec`:

- `value` is already coerced to `string | number | boolean` by the mapper.
- `group` and order come from the category template.
- `isSearchable` and `isFacetable` come from the definition.

### 4. Group

Resolved specs are grouped by `group` and sorted by `groupOrder` and
`displayOrder`.

### 5. Facet extraction

Facetable specs populate the `facets` record.

### 6. Ranking factor derivation

```ts
rankingFactors = {
  listingQuality: listing.listingQualityScore ?? 0.5,
  sellerTrust: listing.sellerTrustScore ?? 0.5,
  recency: listing
    ? 1.0 - (Date.now() - new Date(listing.createdAt).getTime()) / (30 * 86400000)
    : 0.5,
};
```

### 7. Semantic capability compilation

The compiler invokes:

- `compileTrustProfile` from seller/listing signals.
- `compileCompatibility` from raw compatibility entries.
- `compileFitment` from the compatibility conclusion and specifications.

### 8. Artifact assembly

The compiler returns a `CompiledSpecificationSet`. Callers wrap it in a
`CompiledSemanticArtifact` with a version and checksum.

## Extending the pipeline

New signals should be added as new fields on `rankingFactors` and consumed by
the `RankingEngine`. Breaking changes to `CompiledSpecificationSet` require a
schema version bump and a governance review.

## Phase 6 — Governance & CI integration

After artifact assembly, SCGS provides governance gates:

### Replay trace generation

`replayTrace(previous, next, store)` reconstructs the semantic diff between two
artifacts and persists a `SemanticReplayTrace`. Traces are stored via the
`ReplayStore` port, implemented by:

- `FilesystemReplayStore` for local development.
- `SupabaseReplayStore` for CI/production durability.

### CI decision

`evaluateGovernanceDecision(input)` combines:

1. PTS drift score from the evolution report.
2. Governance policy evaluation (`PASS | BLOCK | REVIEW`).
3. System state and behavioral response from the governance controller.

It emits a `PASS | WARN | BLOCK` CI decision with reason codes.

### Production Readiness Review

`runPRR({ current, previous?, store })` asserts:

- **Determinism** — replay produces identical events for identical inputs.
- **PTS stability** — drift score stays within the configured threshold.
- **Snapshot integrity** — traces are retrievable from durable storage.
- **PTS contract integrity** — traces contain `PTS_SHIFT` and `CI_VERDICT` events.

### CI workflow gate

`.github/workflows/ci.yml` runs `scgs:ci:decide` and `scgs:prr` in a dedicated
`scgs-governance` job. The job uses `continue-on-error: true` until a stable
baseline is established.

## Testing

Compiler behavior is covered by:

- `apps/web/src/backend/modules/scgs/tests/integration/specification-compiler.test.ts`
- `apps/web/src/backend/modules/scgs/tests/compile-listing.test.ts`
- `apps/web/src/backend/modules/scgs/tests/lineage.test.ts`
- `tests/integration/middleware-and-types/pdp-projection.test.ts`

Governance behavior is covered by:

- `apps/web/src/backend/modules/scgs/tests/integration/ci-decision.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/prr.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/replay-trace.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/filesystem-replay-store.test.ts`
- `apps/web/src/backend/modules/scgs/tests/unit/replay-store.factory.test.ts`
