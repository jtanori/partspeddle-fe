# Catalog Foundation Certification (C1-V2)

**Goal**: Prove the Specification Framework can model diverse categories with typed values, category hierarchies, and metadata governance.

---

## 1. Revised Schema Architecture

### Core Tables
- `parts` (Universal Attributes)
- `catalog_categories` (Hierarchical taxonomy)
- `catalog_spec_definitions` (Governance & Metadata)
- `catalog_category_specs` (Bridge table for inheritance)
- `part_specifications` (EAV store)

### Proposed Data Structure

```sql
-- 1. Taxonomy
CREATE TABLE public.catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.catalog_categories(id),
  slug text NOT NULL UNIQUE,
  name text NOT NULL
);

-- 2. Metadata Governance
CREATE TABLE public.catalog_spec_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  label text NOT NULL,
  data_type text NOT NULL, -- 'text' | 'number' | 'boolean'
  unit text,
  searchable boolean DEFAULT false,
  filterable boolean DEFAULT false
);

-- 3. Category Inheritance Bridge
CREATE TABLE public.catalog_category_specs (
  category_id uuid REFERENCES public.catalog_categories(id),
  spec_definition_id uuid REFERENCES public.catalog_spec_definitions(id),
  required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  PRIMARY KEY (category_id, spec_definition_id)
);

-- 4. Typed EAV Store
CREATE TABLE public.part_specifications (
  part_id uuid REFERENCES public.parts(id),
  spec_definition_id uuid REFERENCES public.catalog_spec_definitions(id),
  value_text text,
  value_number decimal,
  value_boolean boolean,
  PRIMARY KEY (part_id, spec_definition_id)
);
```

---

## 2. Example Records (Proving Multi-Category Parity)

| Category | Spec Key | Label | DataType | Value Type | Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alternator** | `voltage` | Voltage | text | text | 12V |
| **Alternator** | `amperage` | Amperage | text | number | 120 |
| **Engine** | `cylinders` | Cylinder Count| number | number | 8 |
| **Wheel** | `diameter` | Diameter | number | number | 18 |

---

## 3. Future-Proofing Note (MarketplaceListing)

This architecture is designed to support the transition to `MarketplaceListing` as a root object:
- `parts` table retains universal fields.
- `listings` (future) will hold the shared audit/seller/price metadata.
- `part_specifications` will link to the `listing_id` or `part_id` seamlessly once that refactor occurs.

---

## 4. Search Implementation Plan
- **No Search Duplication**: `part_specifications` remains the canonical source.
- **Search Projection**: Algolia indexer service queries the EAV table and flattens into a `SearchDocument` (e.g., `{"voltage": "12V", "amperage": 120}`) upon update/write to `part_specifications`.

---
**Verdict**: Awaiting final approval to proceed with Phase P1 migration execution.
