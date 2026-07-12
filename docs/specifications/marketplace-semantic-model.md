# Marketplace Semantic Model (MSM)

## Scope

Defines the canonical semantic representation of a PartsPeddle listing so that
search, PDP, recommendations, and governance all operate on the same meaning.

## Core entity: `CompiledSemanticArtifact`

A `CompiledSemanticArtifact` is the immutable output of the SCGS compiler for a
single listing version.

```ts
interface CompiledSemanticArtifact {
  listingId: string; // Immutable listing identifier
  categoryId: string; // Taxonomy leaf category
  version: string; // Semantic version or git-derived tag
  compiled: CompiledSpecificationSet;
  checksum: string; // Content-addressable hash
  metadata: {
    createdAt: string; // ISO 8601
    compilerVersion: string; // SCGS compiler version
  };
}
```

## `CompiledSpecificationSet`

```ts
interface CompiledSpecificationSet {
  flat: ResolvedSpec[]; // Searchable spec list
  grouped: SpecGroup[]; // Presentation grouping
  facets: Record<string, string | number | boolean>; // Filterable values
  rankingFactors: {
    listingQuality: number; // 0..1
    sellerTrust: number; // 0..1
    recency: number; // 0..1
  };
}
```

## `ResolvedSpec`

Each specification value is resolved against the category definition:

```ts
interface ResolvedSpec {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group: string;
  groupOrder: number;
  displayOrder: number;
  isSearchable: boolean;
  isFacetable: boolean;
}
```

## Invariants

- `flat` and `grouped` must represent the same set of specs.
- `facets` is a subset of `flat` where `isFacetable === true`.
- `rankingFactors` are normalized to `[0, 1]`.
- `checksum` must change when any field changes.

## Consumers

- Search projection (`projection/search`)
- PDP projection (`projection/pdp`)
- Ranking engine (`backend/modules/scgs/infrastructure/ranking-engine.ts`)
- Replay / governance domain (`backend/modules/scgs/domain`)
