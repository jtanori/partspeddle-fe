-- PDP Modernization Schema: Marketplace Listing Architecture (Phase P1A.1 Revised)
-- Idempotent version using IF NOT EXISTS

BEGIN;

-- 1. Root Listing Abstraction
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.seller_profiles(user_id),
  listing_type text NOT NULL CHECK (listing_type IN ('PART', 'DONOR_VEHICLE')),
  status text DEFAULT 'draft'::text CHECK (status IN ('draft', 'pending_review', 'available', 'reserved', 'sold', 'removed', 'archived')),
  price decimal NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Taxonomy Hierarchy
CREATE TABLE IF NOT EXISTS public.catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.catalog_categories(id),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Metadata Governance & Validation
CREATE TABLE IF NOT EXISTS public.catalog_spec_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('text', 'number', 'boolean', 'enum')),
  unit text,
  searchable boolean DEFAULT false,
  filterable boolean DEFAULT false,
  facetable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Enum Option Values
CREATE TABLE IF NOT EXISTS public.catalog_spec_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  value text NOT NULL,
  label text NOT NULL,
  display_order integer DEFAULT 0,
  UNIQUE(spec_definition_id, value)
);

-- 5. Category Inheritance Bridge
CREATE TABLE IF NOT EXISTS public.catalog_category_specs (
  category_id uuid NOT NULL REFERENCES public.catalog_categories(id) ON DELETE CASCADE,
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  group_name text,
  PRIMARY KEY (category_id, spec_definition_id)
);

-- 6. Typed EAV Store (Owned by Listing)
CREATE TABLE IF NOT EXISTS public.listing_specifications (
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  spec_definition_id uuid NOT NULL REFERENCES public.catalog_spec_definitions(id) ON DELETE CASCADE,
  value_text text,
  value_number decimal,
  value_boolean boolean,
  PRIMARY KEY (listing_id, spec_definition_id),
  CONSTRAINT one_value_populated CHECK (
    (CASE WHEN value_text IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN value_number IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN value_boolean IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- 7. Link existing parts to listings
-- Note: This is an additive schema change.
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES public.listings(id),
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.catalog_categories(id);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON public.parts(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

COMMIT;
