# Search Architecture Audit - PartsPeddle

## 1. Overview
This audit evaluates the existing search infrastructure against the goal of a fully dynamic, registry-driven search experience.

## 2. Findings

### A. Infrastructure Discrepancy (Critical)
There is a significant mismatch between the database schema and the search indexing service:
*   **Database:** Defines table `listings` (`src/supabase/migrations/..._initial_schema.sql`).
*   **Indexing Service (`scripts/sync-to-algolia.ts`):** Queries a table named `parts`.
*   **Impact:** The search index is likely not updating with new inventory, or it is syncing stale data from an obsolete `parts` table.

### B. Algolia Configuration
`scripts/configure-algolia.ts` currently defines faceted attributes (`category`, `part_type`, `make`, `model`, `year`, `price`) that are close to, but not fully aligned with, the new `SEARCH_FACETS` registry requirement.

### C. Search Service API Contract
The current service (`supabaseDb.searchParts`) and its corresponding API endpoint only return the hits array. It must be updated to return a response structure containing both `hits` and a `facets` object to satisfy the data-driven sidebar requirement.

## 3. Remediation Roadmap
1.  **Sync Schema:** Resolve the `parts` vs `listings` table discrepancy.
2.  **Algolia Re-indexing:** Update the indexing pipeline to utilize the `listings` table and denormalize the fields required for the dynamic facets.
3.  **API Response Refactoring:** Update the search API endpoint to return the `hits` and `facets` object.
4.  **Registry Alignment:** Ensure `src/search/search-facets.ts` matches the attributes indexed in Algolia.
