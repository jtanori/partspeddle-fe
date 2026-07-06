-- Add Missing Category Template Metadata
ALTER TABLE public.catalog_categories 
ADD COLUMN IF NOT EXISTS search_template text,
ADD COLUMN IF NOT EXISTS wizard_template text,
ADD COLUMN IF NOT EXISTS pdp_template text;
