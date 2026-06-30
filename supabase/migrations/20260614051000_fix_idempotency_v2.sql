-- Final Idempotent Repair Script
BEGIN;

-- 1. Canonical table naming
DO $$ 
BEGIN
    -- Only rename if the old table exists AND the new one does NOT exist
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'part_specifications') AND
       NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'listing_specifications') THEN
        ALTER TABLE public.part_specifications RENAME TO listing_specifications;
    END IF;
END $$;

-- 2. Ensure table exists (if it was renamed/created by a previous run)
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

-- 3. Add Missing Category Template Metadata
ALTER TABLE public.catalog_categories 
ADD COLUMN IF NOT EXISTS search_template text,
ADD COLUMN IF NOT EXISTS wizard_template text,
ADD COLUMN IF NOT EXISTS pdp_template text;

-- 4. Rebuild Indices
DROP INDEX IF EXISTS idx_part_specifications_part_id;
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);

COMMIT;
