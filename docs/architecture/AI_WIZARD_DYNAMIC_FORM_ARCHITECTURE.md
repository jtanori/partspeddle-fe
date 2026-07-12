# AI Wizard Dynamic Form Architecture

**Goal**: Enable dynamic UI form generation for listings.

---

## 1. Flow
1. **User Selection**: User selects `Category` (e.g., "Alternator").
2. **Metadata Fetch**: Frontend fetches from `catalog_category_specs` via API.
3. **Form Rendering**:
   - `required: true` fields marked as `required`.
   - `data_type` ('text' | 'number' | 'enum') mapped to input component.
   - If `enum`, fetch options from `catalog_spec_options`.

## 2. Producer Matrix (Example: Alternator)

| Input Field | Source | Data Type | Constraint |
| :--- | :--- | :--- | :--- |
| **Voltage** | Category Definition | enum | Required |
| **Amperage** | Category Definition | number | Required |
| **Rotation** | Category Definition | enum | Optional |
