# SEARCH_DATA_FLOW.md

## Current Data Pipeline

```mermaid
graph TD
    A[Supabase: parts table] -->|sync-to-algolia.ts| B(Algolia Index: parts_inventory)
    B -->|Search Query| C(Search API: /api/parts/search)
    C -->|Return Hits| D[Frontend: ProductListing]
```

## Step-by-Step Breakdown

| Step | Component | Source/Transform |
| ---- | --------- | ---------------- |
| 1. Indexing | `scripts/sync-to-algolia.ts` | Selects from `parts` table + related tables, denormalizes into Algolia record structure. |
| 2. Search | `api/parts/search` | Executes Algolia search query based on filter payload. |
| 3. Rendering| `src/components/ProductListing` | Receives raw hit data, sorts locally, and renders. |

**Current Limitation:** The pipeline does not currently return facet metadata to the frontend, necessitating local counting and filtering logic that should be handled by Algolia.
