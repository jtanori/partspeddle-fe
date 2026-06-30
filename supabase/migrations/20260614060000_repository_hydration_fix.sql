-- Final Repository Hydration Schema Fix (Phase P4.1)
BEGIN;

-- 1. Ensure canonical table naming
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'part_specifications') THEN
        ALTER TABLE public.part_specifications RENAME TO listing_specifications;
    END IF;
END $$;

-- 2. Add missing currency column
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- 3. Ensure Indexing
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);

COMMIT;
