# Search Facet Strategy

**Goal**: Define the metadata-driven faceting engine.

---

## 1. Faceting Logic
Algolia facets are generated dynamically based on the metadata in `catalog_spec_definitions`.

## 2. Dynamic Facet Definition
When the Indexer service initializes, it queries:

```sql
SELECT key FROM catalog_spec_definitions WHERE facetable = true;
```

These keys are then set as `attributesForFaceting` in the Algolia Index configuration.

## 3. User Experience
- **Filter UI**: The Search UI iterates through `catalog_spec_definitions` where `filterable = true` for the active category context.
- **Facet Counts**: Algolia facet counts are requested for these keys dynamically.

No facet configuration is ever hardcoded in the frontend.
