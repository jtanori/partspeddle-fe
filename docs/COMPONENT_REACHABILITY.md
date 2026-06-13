<!-- generated-by: gsd-doc-writer -->

# Component Reachability Audit

| Component                   | Status       | File Path                                           |
| :-------------------------- | :----------- | :-------------------------------------------------- |
| **ResultsGrid**             | ACTIVE       | `src/components/search/ResultsGrid.tsx`             |
| **SortDropdown**            | ACTIVE       | `src/components/search/SortDropdown.tsx`            |
| **FacetFilter**             | ACTIVE       | `src/components/search/FacetFilter.tsx`             |
| **ProductListing**          | **REPLACED** | `src/components/ProductListing.tsx`                 |
| **SectionHeader**           | ACTIVE       | `src/components/common/SectionHeader.tsx`           |
| **ViewAllButton**           | ACTIVE       | `src/components/common/ViewAllButton.tsx`           |
| **GuidedTour**              | ACTIVE       | `src/components/GuidedTour.tsx`                     |
| **SearchModal**             | ACTIVE       | `src/components/SearchModal.tsx`                    |
| **GridResultsView**         | ACTIVE       | `src/components/search/GridResultsView.tsx`         |
| **SearchResultsController** | ACTIVE       | `src/components/search/SearchResultsController.tsx` |
| **EmptyInventoryState**     | **ORPHANED** | `src/components/catalog/EmptyInventoryState.tsx`    |
| **ProductCard**             | **ORPHANED** | `src/components/catalog/ProductCard.tsx`            |
| **ConfidenceBadge**         | **ORPHANED** | `src/components/common/ConfidenceBadge.tsx`         |
| **ImageOptimizer**          | **ORPHANED** | `src/components/common/ImageOptimizer.tsx`          |
| **ProfileGridCard**         | **ORPHANED** | `src/components/common/ProfileGridCard.tsx`         |
| **AbortConfirmationModal**  | **ORPHANED** | `src/components/modals/AbortConfirmationModal.tsx`  |
| **SearchErrorBoundary**     | **ORPHANED** | `src/components/SearchErrorBoundary.tsx`            |

## Required Action

Delete **ORPHANED** components before promotion to clean up the codebase.

## Audit Verdict

**STATUS: FAIL** (Orphaned components detected)
