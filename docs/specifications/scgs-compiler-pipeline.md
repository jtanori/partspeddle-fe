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

## Testing

Compiler behavior is covered by:

- `apps/web/src/backend/modules/scgs/tests/integration/specification-compiler.test.ts`
- `apps/web/src/backend/modules/scgs/tests/compile-listing.test.ts`
- `apps/web/src/backend/modules/scgs/tests/lineage.test.ts`
- `tests/integration/middleware-and-types/pdp-projection.test.ts`
