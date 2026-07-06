-- PDP Modernization Schema: Catalog Specification Framework (Phase P1A)
-- This migration bootstraps the EAV infrastructure only. No catalog data is seeded.

BEGIN;

-- 1. Taxonomy Hierarchy
CREATE TABLE public.catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.catalog_categories(id),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Metadata Governance & Validation
CREATE TABLE public.catalog_spec_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  label text NOT NULL,
  data_type text NOT NULL, -- 'text' | 'number' | 'boolean' | 'enum'
  unit text,
  searchable boolean DEFAULT false,
  filterable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Enum Option Values for 'enum' data_type
CREATE TABLE public.catalog_spec_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  value text NOT NULL,
  label text NOT NULL,
  display_order integer DEFAULT 0
);

-- 4. Category Inheritance Bridge
CREATE TABLE public.catalog_category_specs (
  category_id uuid NOT NULL REFERENCES public.catalog_categories(id) ON DELETE CASCADE,
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  PRIMARY KEY (category_id, spec_definition_id)
);

-- 5. Typed EAV Store
CREATE TABLE public.part_specifications (
  part_id uuid NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  value_text text,
  value_number decimal,
  value_boolean boolean,
  PRIMARY KEY (part_id, spec_definition_id),
  -- Constraint to ensure exactly one value column is populated
  CONSTRAINT one_value_populated CHECK (
    (CASE WHEN value_text IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN value_number IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN value_boolean IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Add Indexing for performance
CREATE INDEX idx_part_specifications_part_id ON public.part_specifications(part_id);
CREATE INDEX idx_part_specifications_spec_definition_id ON public.part_specifications(spec_definition_id);

COMMIT;
