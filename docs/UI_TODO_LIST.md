# SEARCH_UI_MODERNIZATION_TODO_LIST

## Certification Rules (Non-Negotiable)

- **NO MODIFICATION** of Search API, Repository, or Backend Logic.
- **AUTHORITATIVE STATE** is URL-driven (q, sort, page, view).
- **CERTIFICATION** requires 100% adherence to mockups while maintaining platform certification status.

---

## Task Itemization

### Phase 1: Core Layout & Containers (Presentation Shell)

- [x] **T1: Create SearchSidebarContainer**
  - Visual shell for filters (Clear All, Filter By, FacetFilter).
- [x] **T2: Create SearchSidebarDisabled**
  - Non-interactive initial layout state to prevent layout shift.
- [x] **T3: Implement SearchResultsHeader**
  - Display "X Results for Y" using existing `hits.length` and `query`.
- [x] **T4: Implement ViewToggle**
  - Grid/List mode state toggler (Local UI state only).

### Phase 2: Results Presentation

- [x] **T5: Implement GridResultsView**
  - 4-column desktop grid for `Part[]`.
- [x] **T6: Implement ListResultsView**
  - Row-based listing view for `Part[]`.
- [x] **T7: Create SearchListItem**
  - List-mode representation using existing result data.
- [x] **T8: Enhance Result Cards**
  - Update styling for existing `ProductGridCard`/`ProductListCard` (Spacing, Typography, Badges).

### Phase 3: State & Interactive Features

- [x] **T9: Implement ActiveFiltersBar**
  - Chips UI for applied filters (Remove single/Clear all).
- [ ] **T10: Integrate Pagination Styling**
  - Apply approved styles to existing pagination flow.

### Phase 4: Initial & Empty States

- [x] **T11: Implement SearchInitialState**
  - Display when `!query`.
- [x] **T12: Implement SearchNoResults**
  - Display when `query && hits.length === 0` (Includes Clear Search CTA).

### Phase 5: Responsive & Drawer

- [x] **T13: Mobile Filter Drawer**
  - Use `shadcn/ui Sheet` to wrap `SearchSidebarContainer` for mobile.

### Phase 7: Mobile Adaptation (Responsive)

- [x] **T20: Create MobileFilterSheet**
  - Create `shadcn/ui Sheet` wrapper around `ProductSidebar`.
- [x] **T21: Integrate MobileFilterSheet**
  - Update `ProductListing` to toggle drawer on mobile.
- [x] **T22: Implement Sticky Filter Action Bar**
  - Sticky bottom trigger for mobile drawer.
- [x] **T23: Responsive Grid/List Adaptation**
  - Adjust column counts and list item density for mobile.
- [x] **T24: Product Card Mobile Density**
  - Responsive spacing and typography scaling for mobile cards.
- [x] **T25: Toolbar & Header Responsive**
  - Adjust gap and layout for mobile/tablet.
- [x] **T26: Pagination Compaction**
  - Implement responsive siblingCount logic for mobile.

---

## Certification Status

- **AIC**: PASS
- **Sanitation**: PASS
- **CAP**: PASS
- **Promotion**: Pending
- **Status**: Tablet Adaptation In Progress
