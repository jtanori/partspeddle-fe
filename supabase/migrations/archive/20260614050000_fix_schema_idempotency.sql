-- Final Schema Alignment (P1G - Idempotent Fix)
-- This script handles the case where part_specifications was already renamed
-- or listing_specifications already exists.

BEGIN;

-- 1. Ensure Table Naming is Canonical (listing_specifications)
DO $$ 
BEGIN
    -- If old table exists, rename it
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'part_specifications') THEN
        ALTER TABLE public.part_specifications RENAME TO listing_specifications;
    END IF;
    
    -- If target table doesn't exist, create it (safe fallback)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'listing_specifications') THEN
        CREATE TABLE public.listing_specifications (
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
    END IF;
END $$;

-- 2. Rename Column safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='listing_specifications' AND column_name='part_id') THEN
        ALTER TABLE public.listing_specifications RENAME COLUMN part_id TO listing_id;
    END IF;
END $$;

-- 3. Add Missing Category Template Metadata
ALTER TABLE public.catalog_categories 
ADD COLUMN IF NOT EXISTS search_template text,
ADD COLUMN IF NOT EXISTS wizard_template text,
ADD COLUMN IF NOT EXISTS pdp_template text;

-- 4. Rebuild Indices
DROP INDEX IF EXISTS idx_part_specifications_part_id;
DROP INDEX IF EXISTS idx_listing_specifications_listing_id;
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);

COMMIT;
