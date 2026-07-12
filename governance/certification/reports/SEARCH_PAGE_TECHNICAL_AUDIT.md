# Search Page Technical Audit Report

## 1. Overview
The Search Page (`src/app/(public)/search/page.tsx`) acts as the primary user interface for discovering auto parts. It is a Client Component wrapper around `ProductListing`, providing a URL-synchronized experience that leverages Algolia-backed search queries.

## 2. Component Structure
- **`SearchPage` (Container)**: Wraps `SearchPageContent` in a `Suspense` boundary for lazy loading.
- **`SearchPageContent`**: Reads URL search parameters (`q`, `category`) and drives `ProductListing`.
- **`ProductListing` (Core)**: 
    - Manages complex filter state (`SearchFilters`) locally using `useState`.
    - Synchronizes filter state with URL parameters using `useRouter` and `URLSearchParams` on every change.
    - Manages view modes (List/Grid) via `localStorage`.
    - Handles fetching via `supabaseDb.searchParts(filters)`.
- **`ProductSidebar`**: Renders filter facets (Category, Part Type, Price, Condition, Fitment, Seller).

## 3. Data Flow & Request Lifecycle
1. **Initiation**: `SearchPage` triggers `ProductListing` with initial query params.
2. **Sync**: `ProductListing` reads `useSearchParams` on mount to initialize filter state.
3. **Execution**: On filter change, `setAndSyncFilters` updates URL params (triggers URL change) and updates local state.
4. **Fetching**: `useEffect` in `ProductListing` watches `filters` state and triggers `supabaseDb.searchParts(filters)` with a 300ms debounce.
5. **Backend**: `supabaseDb` calls `POST /api/parts/search`.
6. **Search**: `POST /api/parts/search` invokes `AlgoliaSearchRepository` for query execution, plus optional `VehicleFitmentSearchService` to filter by part fitment if vehicle details are provided.
7. **Response**: Hits are mapped back to `Part` objects and rendered.

## 4. Current Facets & Filters
- **Sort**: Relevance, Price (L-H, H-L), Newest, Mileage, Seller Rating.
- **Category**: Taxonomical hierarchy (System -> Subsystem -> Part Type).
- **Price**: Dual-input slider (0-500+).
- **Condition**: OEM Original, Excellent, Good, For Parts (checkboxes).
- **Seller Type**: All vs. Trusted.
- **Fitment**: Make, Model, Year, Engine.

## 5. Technical Observations & Recommendations
- **Debounced Fetching**: Current 300ms debounce is good for UX but potentially inefficient if the API isn't cached properly.
- **Algolia Usage**: The API currently does filtering via `AlgoliaSearchRepository.search` but does not fully leverage Algolia's faceting capabilities (it seems to be handling some client-side filtering via fitment services).
- **State Sync**: Syncing every single filter change to the URL on every keystroke/toggle can be very noisy and create browser history bloat.

## 6. Recommendations for Refinement
1. **Algolia Faceting**: Offload more filtering logic to Algolia's native faceting to reduce API latency and client-side processing.
2. **Fitment Precision**: The current `VehicleFitmentSearchService` acts as a bottleneck for large result sets. This should be moved into Algolia facet filters as soon as taxonomies are fully synced.
3. **Optimized Sync**: Use a more efficient way to sync filters, perhaps only updating the URL on a short delay or upon user interaction completion (e.g., slider release).
