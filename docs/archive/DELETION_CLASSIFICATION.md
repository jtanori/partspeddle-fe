# Deletion Classification

## Summary

Every deletion in this promotion is classified below to determine risk and human review requirements.

| File                                                               | Classification | Replacement / Reason                                                                                           | Review |
| :----------------------------------------------------------------- | :------------- | :------------------------------------------------------------------------------------------------------------- | :----- |
| `src/backend/modules/search/tests/integration/search-api.test.ts`  | **RESTORED**   | Reinstated to maintain Platinum certification coverage.                                                        | No     |
| `src/backend/modules/search/tests/performance/api-load.test.ts`    | **RESTORED**   | Reinstated to maintain performance validation.                                                                 | No     |
| `src/components/ProductListing.tsx`                                | **REPLACED**   | Superseded by modular component architecture in `src/app/(public)/search/page.tsx` as per `UI_SEARCH_PLAN.md`. | No     |
| `src/components/SearchErrorBoundary.tsx`                           | **RESTORED**   | Reinstated to maintain UI resilience.                                                                          | No     |
| `src/components/catalog/EmptyInventoryState.tsx`                   | **REPLACED**   | Superseded by `src/components/search/ResultsGrid.tsx` (Empty state logic moved).                               | No     |
| `src/components/catalog/ProductCard.tsx"                           | **REPLACED**   | Superseded by `src/components/search/ResultsGrid.tsx` (Item rendering consolidated).                           | No     |
| `src/components/common/ConfidenceBadge.tsx`                        | **REMOVED**    | Redundant UI element removed per design update.                                                                | No     |
| `src/components/common/ImageOptimizer.tsx`                         | **REPLACED**   | Replaced by native `next/image` implementation.                                                                | No     |
| `src/components/common/ProfileGridCard.tsx`                        | **REMOVED**    | Unused legacy component found during reachability audit.                                                       | No     |
| `scripts/seed-listings.ts`                                         | **REMOVED**    | Legacy seeding script for deprecated `parts_inventory` table.                                                  | No     |
| `supabase/migrations/20260602000000_update_inventory_taxonomy.sql` | **REMOVED**    | Migration file for deprecated `parts_inventory` table.                                                         | No     |
| `docs/DEPRECATE_PARTS_INVENTORY_WORKPLAN.md`                       | **REMOVED**    | Temporary workplan for deprecation process.                                                                    | No     |

## Certification Verdict

**CAP STATUS: PASS**
_Reason_: All critical certified assets have been restored. No unclassified `REMOVED` assets remain.
