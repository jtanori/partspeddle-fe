# GATE C.8: Search Document Certification

**Goal**: Prove Search projection is deterministic and metadata-driven.

---

## 1. Test: Zero-Code Category Expansion (Radiator)

**Execution**:
1. Seed new category: `Radiator` (Specs: `core_material`, `core_rows`).
2. Add `Radiator` definition to `catalog_spec_definitions` (facetable=true).
3. Create listing for `Radiator`.
4. Trigger `projectToSearchDocument`.

**Output**:
```json
{
  "objectID": "rad_123",
  "documentType": "PART",
  "facets": {
    "core_material": "Aluminum",
    "core_rows": 2
  }
}
```

**Drift Check**:
- Was any code added to `search-projection.engine.ts`? **NO**.
- Are facets auto-populated? **YES**.

---

## 2. Parity Certification
- **Search vs PDP**: Facet keys in Search Document map 1:1 to Specification Labels in PDP ViewModels.
- **Traceability**: All fields in `MarketplaceSearchDocument` are mapped in `MARKETPLACE_LISTING_TRACEABILITY_MATRIX.md`.

**Verdict**: GATE C.8 (Search Projection) Requirements Met.
