# SCGS Compiler Pipeline

## Pipeline stages

### 1. Fetch

`SpecificationCompilerImpl` fetches in parallel:

- Listing specifications (`specRepo.findByListingId`)
- Category specifications (`catalogRepo.getSpecificationsForCategory`)
- All definitions (`specRepo.getAllDefinitions`)
- Listing entity (`listingRepo.findById`)

### 2. Resolve

Each raw spec is matched to its definition and category placement to produce a
`ResolvedSpec`:

- `value` is coerced to `string | number | boolean`.
- `group` and order come from the category spec.
- `isSearchable` and `isFacetable` come from the definition.

### 3. Group

Resolved specs are grouped by `group` and sorted by `groupOrder` and
`displayOrder`.

### 4. Facet extraction

Facetable specs populate the `facets` record.

### 5. Ranking factor derivation

```ts
rankingFactors = {
  listingQuality: listing.listingQualityScore ?? 0.5,
  sellerTrust: listing.sellerTrustScore ?? 0.5,
  recency: listing
    ? 1.0 - (Date.now() - new Date(listing.createdAt).getTime()) / (30 * 86400000)
    : 0.5,
};
```

### 6. Artifact assembly

The compiler returns a `CompiledSpecificationSet`. Callers wrap it in a
`CompiledSemanticArtifact` with a version and checksum.

## Extending the pipeline

New signals should be added as new fields on `rankingFactors` and consumed by
the `RankingEngine`. Breaking changes to `CompiledSpecificationSet` require a
schema version bump and a governance review.

## Testing

Compiler behavior is covered by:

- `tests/certification/c08_specification_parity.test.ts`
- `tests/integration/middleware-and-types/pdp-projection.test.ts`
- PDP page integration in `apps/web/src/app/(public)/listing/[id]/page.tsx`
