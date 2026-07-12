# SCGS Search Projection Contract

## Purpose

Defines the canonical projection returned by SCGS-powered search. Any consumer
of `/api/search/scgs` receives a `SearchViewModel` validated against this
contract.

## Ownership

This contract is owned by the SCGS backend module:

```
apps/web/src/backend/modules/scgs/contract/search-view-model.contract.ts
```

The legacy file `apps/web/src/domain/view-models/search.ts` is a temporary shim
and will be removed once all consumers migrate to `@/backend/modules/scgs`.

## Schema

```ts
interface SearchViewModel {
  results: SearchResultCardModel[];
  facets: FacetViewModel[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  meta: {
    source: 'SCGS';
    query?: string;
    queryMs?: number;
    rankingVersion?: string;
    generatedAt?: string; // ISO 8601
  };
}
```

## `SearchResultCardModel`

```ts
interface SearchResultCardModel {
  id: string;
  title: string;
  price: string; // formatted currency
  imageUrl?: string;
  subtitle?: string;
  conditionLabel?: string;
  conditionColor?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  fitmentSummary?: string;
  badges: {
    isOEM: boolean;
    isTested: boolean;
    isGoodFit: boolean;
  };
  facets: Record<string, string | number | boolean>;
}
```

## Guarantees

- `meta.source` is always the literal `'SCGS'`.
- `results` preserves the order produced by the SCGS ranking engine.
- `pagination.totalPages` is derived from `total / pageSize`.
- `facets.values` includes `selected` based on the current filter state.
- The entire object is validated by Zod before being returned.

## Building the view model

Use the application use case:

```ts
import { buildSearchViewModel } from '@/backend/modules/scgs';

const viewModel = buildSearchViewModel({
  rankedArtifacts,
  presentations, // mapping listingId -> presentation data
  facets,
  filters,
  page,
  pageSize,
  total,
  query,
  queryMs,
});
```

## `/api/search/scgs`

This route is the reference implementation. It:

1. Searches Algolia for candidate listings.
2. Builds `CompiledSemanticArtifact` instances from hits.
3. Ranks artifacts with `rankArtifacts`.
4. Builds `SearchResultPresentation` from hits.
5. Returns a validated `SearchViewModel`.

## Future evolution

- Phase 3 will introduce `PDPViewModel` using the same contract pattern.
- Phase 5 may enrich `SearchResultCardModel.facets` from the compiled artifact
  rather than from the upstream index.
