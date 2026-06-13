# Search Page UI Audit Report

## Overview
This report documents the current implementation status of the Search Page UI. The design follows a modular approach using `shadcn/ui` and existing project theme standards.

## Component Inventory

### 1. `SearchPageContent` (Page Wrapper)
*   **Location**: `src/app/(public)/search/page.tsx`
*   **Responsibility**: Orchestrates search state (query, filters, sorting), manages data flow, and defines layout.
*   **State Management**: Holds `filters` (Record<string, string[]>), `hits` (Part[]), and `facets` (any). Manages URL-driven `sortBy`.

### 2. `FacetFilter`
*   **Location**: `src/components/search/FacetFilter.tsx`
*   **Responsibility**: Displays facet groups and handles user selection.
*   **Props**: `title`, `type`, `isOpen`, `onToggle`, `options`, `selectedValues`, `onChange`, `isDisabled`.

### 3. `SortDropdown`
*   **Location**: `src/components/search/SortDropdown.tsx`
*   **Responsibility**: UI control for sorting.
*   **Props**: `value`, `onChange`.

### 4. `ResultsGrid`
*   **Location**: `src/components/search/ResultsGrid.tsx`
*   **Responsibility**: Manages backend API interaction.
*   **Props**: `query`, `filters`, `sortBy`, `onResults`.

---

## API Communication Flow
The architecture follows a unidirectional data flow orchestrated by `SearchPageContent`:

1.  **Trigger**: User interactions (Filter checkbox, Sort change) update the `SearchPageContent` state or URL parameters.
2.  **Request**: `ResultsGrid` (via `useEffect`) detects changes in `query`, `filters`, or `sortBy` and calls `supabaseDb.searchParts`.
3.  **Endpoint**: API request is routed to `POST /api/search/parts`.
4.  **Response**: The backend repository queries the Algolia `parts` index and returns `{ hits, facets }`.
5.  **State Update**: `ResultsGrid` invokes the `onResults` callback, passing the data back to `SearchPageContent`, which updates `hits` and `facets` state.
6.  **Re-render**: `SearchPageContent` updates the Sidebar (`FacetFilter` options) and Main (`ResultsGrid` display).

---

## Component Events & State Orchestration

| Event Source | Event Type | Orchestrator Action |
| :--- | :--- | :--- |
| `FacetFilter` | `onChange` | Updates filter state in `SearchPageContent` -> triggers API refetch. |
| `SortDropdown` | `onChange` | Updates URL `sort` param via `router.push` -> triggers re-render + refetch. |
| `ResultsGrid` | `onResults` | Updates `hits` and `facets` state -> Sidebar/Main refresh. |

---

## Current Implementation State
- **URL-Driven State**: Sorting and query parameters are managed via URL `searchParams`.
- **Backend Integration**: Fully integrated with the consolidated `parts` index API.
- **Visuals**: Basic card structure, condition badges, and seller verification indicators are implemented.

## Missing UI Features
- **Empty State UI**: Currently displays a simple text message when no results are found.
- **Mobile Responsive Layout**: Sidebar toggle functionality is not yet implemented for mobile screens.
- **Sophisticated Card Details**: Result cards could be enhanced with fitment previews or additional metadata.
- **Filter Chips**: Currently, chips showing *active* filters are missing, forcing users to interact only with the sidebar.
- **View Toggle**: The UI structure supports it, but the toggle between 'List' and 'Grid' views is not implemented.
