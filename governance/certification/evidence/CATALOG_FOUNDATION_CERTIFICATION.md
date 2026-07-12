# Catalog Foundation Certification (C1)

**Goal**: Prove the EAV Specification Framework can model diverse marketplace categories using a unified schema.

---

## 1. Proposed Schema Architecture

### Core Tables
- `parts` (Universal Attributes)
- `catalog_spec_definitions` (Metadata definition)
- `part_specifications` (EAV store)

### Proposed Data Structure

```sql
-- 1. Universal Table
CREATE TABLE public.parts (
  id uuid PRIMARY KEY,
  title text,
  brand text,
  condition text,
  price decimal,
  -- ... other universal fields
);

-- 2. Metadata Definition
CREATE TABLE public.catalog_spec_definitions (
  id uuid PRIMARY KEY,
  key text NOT NULL,
  label text NOT NULL,
  data_type text NOT NULL, -- 'text', 'integer', 'decimal', 'enum'
  category_slug text NOT NULL
);

-- 3. EAV Store
CREATE TABLE public.part_specifications (
  id uuid PRIMARY KEY,
  part_id uuid REFERENCES public.parts(id),
  spec_definition_id uuid REFERENCES public.catalog_spec_definitions(id),
  value text NOT NULL
);
```

---

## 2. Example Records (Multi-Category Parity)

| Category | Spec Key | Label | DataType | Part ID | Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alternator** | `voltage` | Voltage | text | `alt_123` | 12V |
| **Alternator** | `amperage` | Amperage | text | `alt_123` | 120A |
| **Engine** | `cylinders` | Cylinder Count| integer | `eng_456` | 8 |
| **Engine** | `fuel_type` | Fuel Type | enum | `eng_456` | Gasoline |
| **Door** | `side` | Side | enum | `door_789`| Driver |
| **Door** | `material` | Material | text | `door_789`| Steel |
| **Wheel** | `diameter` | Diameter | integer | `wheel_000`| 18 |
| **Wheel** | `bolt_pattern`| Bolt Pattern| text | `wheel_000`| 5x114.3 |

---

## 3. Search Implications
- **Searchable Specs**: Any spec marked `searchable` in the definition will be flattened into a searchable JSONB column (`parts.searchable_specs`) or dedicated index to allow filtering: 
  - `WHERE specs->>'voltage' = '12V'`
- **Facet Generation**: Algolia indices will be updated to include category-specific attributes dynamically from the definition library.

---

## 4. AI Wizard Implications
- **Dynamic Form Ingestion**: Wizard fetches `catalog_spec_definitions` for a `category_slug`.
- **Form Generation**: `data_type` dictates the input component (text input, number input, or select dropdown).

---

## 5. PDP Implications
- **Component Consumption**: The `DescriptionFitmentPanel` and `TabSystem` will map `PartSpecifications[]` to UI labels without hardcoded logic.
- **Display Order**: The `display_order` column in `catalog_spec_definitions` ensures consistent UI layout across categories.

---

## 6. Migration Plan
1. **Bootstrap**: Create `catalog_spec_definitions` and `part_specifications` tables.
2. **Migration**: Insert initial definitions for the 20 categories.
3. **Data Loading**: Migrate existing specifications from `parts` columns (where applicable) into the EAV store.
4. **Validation**: Run integration tests to confirm querying an alternator returns voltage, but querying an engine does not.

---
**Verdict**: Awaiting approval to proceed with Phase P0.5/P1 implementation.
