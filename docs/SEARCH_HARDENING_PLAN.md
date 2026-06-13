# Search Hardening Implementation Plan

## Phase 1: Search Correctness & Stability
- **Objective**: Eliminate race conditions and ensure consistent UI state.
- **Tasks**:
  1. Implement `AbortController` in `ProductListing` for `supabaseDb.searchParts` calls.
  2. Implement `requestId` tracking to discard stale responses.
  3. Wrap critical search components in `ErrorBoundary`.

## Phase 2: Infrastructure & Caching
- **Objective**: Reduce API load and improve response times.
- **Tasks**:
  1. Install `TanStack Query`.
  2. Refactor `ProductListing` to use `useQuery` for search operations.
  3. Implement the `draftFilters` / `committedFilters` pattern.

## Phase 3: Analytics & Observability
- **Objective**: Establish visibility and feedback loops.
- **Tasks**:
  1. Create a `SearchAnalyticsService`.
  2. Instrument `SEARCH_EXECUTED` (on fetch start).
  3. Instrument `RESULT_CLICKED` (on item click).
  4. Instrument `FILTER_APPLIED` (on filter update).

---
**Approval Required**: Please confirm if this implementation plan meets your requirements to begin Phase 1.
