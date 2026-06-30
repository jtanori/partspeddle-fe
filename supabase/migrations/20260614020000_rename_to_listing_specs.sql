-- Rename to Listing Abstraction
ALTER TABLE public.part_specifications RENAME TO listing_specifications;
ALTER TABLE public.listing_specifications RENAME COLUMN part_id TO listing_id;
DROP INDEX IF EXISTS idx_part_specifications_part_id;
CREATE INDEX IF NOT EXISTS idx_listing_specifications_listing_id ON public.listing_specifications(listing_id);
