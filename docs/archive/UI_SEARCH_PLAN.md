# Search Input & Live Results UX Specification

## Objective

Transform the primary search input into a predictive, structured **Search Command Surface** capable of:

- Suggesting products, categories, vehicles, and manufacturers
- Supporting robust keyboard navigation
- Executing instant search
- Maintaining compatibility with certified Algolia indexing

> **CRITICAL CONSTRAINT**: DO NOT MODIFY CERTIFIED SEARCH INFRASTRUCTURE. The search backend, API contracts, and existing search page routing are immutable.

---

## 1. State Machine

| Current State | Event         | Next State |
| :------------ | :------------ | :--------- |
| Pristine      | Focus         | Focused    |
| Focused       | Type          | Loading    |
| Loading       | Results Found | Results    |
| Loading       | No Results    | No Results |
| Results       | Arrow Key     | Navigating |
| Navigating    | Enter         | Executed   |
| Any           | Escape        | Pristine   |
| Any           | Clear         | Focused    |

### State Definitions

- **Pristine**: Input empty, dropdown hidden.
- **Focused**: Input has focus, showing Recent/Popular searches.
- **Loading**: Typing/Debounced, searching Algolia.
- **Results**: Algolia returns hits, dropdown structured by group.
- **Navigating**: Keyboard-driven selection.
- **No Results**: No matches found, offering "Search anyway" CTA.
- **Executed**: Search performed, dropdown closes, URL updates.

---

## 2. Search Query Pipeline

- **Debounce**: 150ms mandatory.
- **Minimum Length**: 1 character.
- **Cancellation**: Use `AbortController` (or equivalent) to cancel stale inflight requests.

---

## 3. Result Grouping & Layout

Algolia hits must be mapped into:

```ts
{
  products: [],
  vehicles: [],
  categories: [],
  manufacturers: []
}
```

### Layout Constraints

- **Width**: Matches search input (Desktop: 100% of navbar search container).
- **Max Height**: 720px (with internal scroll).
- **Scroll**: Internal scroll only; page scroll disabled while active.

---

## 4. Interaction & Features

### Recent/Popular Searches

- **Recent**: Stored in LocalStorage (`recent-searches`), 10 max, FIFO.
- **Popular**: Fallback from `constants/popular-searches.ts`.

### Special Detection

- **VIN (17-char)**: Top-priority row: "VIN Detected: Decode Vehicle".
- **Part Number**: Top-priority row: "Part Number Match: Search This Part".

### Keyboard Navigation

- **Arrows**: Move selection.
- **Enter**: Execute selected item.
- **Escape**: Close.
- **Tab**: Accept selection.
- **Accessibility**: Uses `role="listbox"` and `role="option"`.

### Performance Targets

- **Suggestion Response**: <100ms p95.
- **Search Execution**: <250ms p95.
- **Dropdown Render**: <16ms.

---

## 5. Implementation Plan

### Phase 1: Architectural Foundation

- Introduce `SearchDropdownController` and `SearchResultsDropdown`.
- Keep existing `SearchInput` for rendering only.

### Phase 2: Logic & State

- Implement `SearchStateMachine`.
- Integrate `AbortController` logic.

### Phase 3: Results & UX

- Algolia response mapper.
- Keyboard navigation hooks.
- Mobile drawer-based sheet (`MobileFilterSheet`).
