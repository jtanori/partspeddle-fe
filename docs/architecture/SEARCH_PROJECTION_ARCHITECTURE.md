# Search Projection Architecture (P3.6)

**Goal**: Define canonical search projection.

---

## 1. Search Contract

```ts
// Canonical Search Document
interface MarketplaceSearchDocument {
  objectID: string;
  documentType: 'part' | 'donor_vehicle';
  title: string;
  subtitle?: string;
  price?: number;
  sellerId: string;
  
  // Flattened Specs for Algolia facets
  facets: Record<string, string | number>; 
}
```

## 2. Indexer Strategy
- The indexer service consumes `part_specifications` and flattens them into `facets`.
- This ensures that when a seller adds a "Voltage" spec to an alternator, it automatically becomes a filterable facet in the Search UI without schema changes.
