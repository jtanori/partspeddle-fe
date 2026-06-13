# Search V2 Index Spec

This document defines the target Algolia object structure for the search page redesign.

## Target Schema (Flattened)

```json
{
  "objectID": "uuid",
  "title": "string",
  "description": "string",
  "price": "number",
  "status": "string",

  // Facetable Attributes
  "make": "string",
  "model": "string",
  "year": "number",

  "category": "string",
  "part_type": "string",

  "condition": "string",

  "seller_name": "string",
  "seller_verified": "boolean",
  "seller_trust_score": "number",

  "location": "string",

  "image_url": "string",
  "listing_quality_score": "number",
  "created_at": "number"
}
```

## Implementation Plan

1. **Source of Truth**: Consolidate on the `parts` table/index path.
2. **Schema Migration**: Update `supabase/functions/sync-algolia-webhook/` to transform data into this flat structure.
3. **Data Enrichment**: Ensure `condition`, `seller_verified`, `seller_trust_score`, and `listing_quality_score` are fetched and indexed.
4. **Deprecation**: Legacy index cleanup completed.
