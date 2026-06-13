# SEARCH_SOURCE_OF_TRUTH.md

## Findings
The marketplace currently has a critical schema inconsistency:

1.  **Canonical Table:** The database contains a `parts` table (confirmed via migration `20260603020000_refactor_parts_and_cascades.sql`) which holds the live inventory.
2.  **Naming Ambiguity:** There is a `listings` table present in the schema, but analysis shows the search indexing pipeline (`scripts/sync-to-algolia.ts`) and the Supabase DB service (`src/services/supabase-db.ts`) are currently interacting with the `parts` table.
3.  **Status:** The `parts` table is the current Source of Truth for marketplace inventory. The `listings` table is likely an unused legacy artifact or an improperly named table that should be either merged into `parts` or made the canonical table.

**Action Required:** Perform a full schema audit to align table naming across the entire codebase and migrations.
