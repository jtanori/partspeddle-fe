# Catalog Specification Architecture (P1.5)

**Phase**: P1 Schema & Catalog Architecture  
**Status**: Master Specification Framework

---

## 1. Objective
To prevent "Specification Bloat" in the `parts` table and provide a deterministic way for Search and PDP to render category-specific data without hardcoded if/else logic.

---

## 2. Specification Modeling
Every catalog attribute is modeled as a `SpecificationDefinition`.

```ts
interface SpecificationDefinition {
  key: string;            // e.g. "voltage"
  label: string;          // e.g. "Voltage"
  unit?: string;          // e.g. "V"
  dataType: 'text' | 'integer' | 'decimal' | 'enum';
  governance: 'catalog' | 'marketplace';
  categories: string[];   // Array of Part Category IDs this applies to
}
```

---

## 3. Storage Strategy
- **Standard Attributes**: High-frequency fields (`brand`, `mileage`, `condition`) remain first-class columns in the `parts` table for search performance.
- **Extended Attributes**: Category-specific fields (`rotation`, `connector_count`) are stored in the `parts.ai_data` (JSONB) field but governed by the `SpecificationDictionary`.

---

## 4. Governance Rules
- **Catalog Controlled**: Attributes that describe the manufacturer's original spec (Brand, OEM Part Number, Voltage). These should match the manufacturer database.
- **Marketplace Controlled**: Attributes describing the specific instance (Mileage, Condition, Warranty). These are unique to the seller's listing.

---

## 5. Implementation Path
1.  Register all design requirements in `SPECIFICATION_DICTIONARY.md`.
2.  Update `PartViewModelBuilder` to hydrate the `specifications[]` array by looking up keys in the dictionary.
3.  Expose the dictionary to the AI Listing Wizard to ensure producers use correct keys.
