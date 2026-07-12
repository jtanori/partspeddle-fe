# Search Command Surface V2: Implementation Plan

## Objective

Extend the search capability to support VIN, Part Number, and Vehicle intent detection while keeping the existing search core immutable.

## Constraints (Strictly Immutable)

- No changes to `algolia-search-repository.ts`
- No changes to `search-api-handler.ts`
- No changes to `SearchResultsController`
- No changes to `src/app/(public)/search/page.tsx`
- No changes to existing DB Schema or Result UI

---

## 1. Module Structure (`src/search/intelligence/`)

```
src/search/intelligence/
├── vin-detector.ts
├── part-number-detector.ts
├── vehicle-detector.ts
├── intent-resolver.ts
├── registry/
│   └── vehicle-alias-registry.ts
└── types/
    └── intent.ts
```

## 2. Intent Model

```typescript
export interface SearchIntent {
  type: 'vin' | 'part_number' | 'vehicle' | 'keyword';
  confidence: number;
  payload?: unknown;
}
```

## 3. Implementation Phases

| Phase | Goal            | Focus                                                                     |
| :---- | :-------------- | :------------------------------------------------------------------------ |
| **1** | **Foundation**  | Define types, registry, and base resolvers (`src/search/intelligence/`).  |
| **2** | **VIN**         | Implement detection, resolution, and UI banner.                           |
| **3** | **Part Number** | Implement detection, resolution (Algolia search), and UI banner.          |
| **4** | **Vehicle**     | Implement alias registry, tokenizer, and high/med/low confidence banners. |
| **5** | **UI/UX**       | Integrate `<SearchIntentBanner />` into existing search dropdown.         |
| **6** | **Context**     | Integrate `SearchContext` into the Results Page.                          |

## 4. Detection Priority

1. `VIN`
2. `Part Number`
3. `Vehicle`
4. `Keyword` (Default)

---

## 5. Certification Requirements (Phase 8 Checkpoints)

- **Detection**: VIN/Part/Vehicle detection accuracy & verification.
- **Search**: Zero regression on current search/URL/filters.
- **UX**: Banner rendering, keyboard/mobile compatibility.
- **Performance**: Intent detection & projection overhead < 5ms (p95).
