-- Final Schema Alignment (P1G)
-- Canonicalizing EAV table naming and Category Metadata fields.

BEGIN;

-- 1. Ensure Table Naming is Canonical (listing_specifications)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'part_specifications') THEN
        ALTER TABLE public.part_specifications RENAME TO listing_specifications;
    END IF;
END $$;

-- 2. Add Missing Category Template Metadata
ALTER TABLE public.catalog_categories 
ADD COLUMN IF NOT EXISTS search_template text,
ADD COLUMN IF NOT EXISTS wizard_template text,
ADD COLUMN IF NOT EXISTS pdp_template text;

-- 3. Ensure Indices exist on canonical name
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);

COMMIT;
