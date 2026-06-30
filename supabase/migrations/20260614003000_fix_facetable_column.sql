-- Fix missing facetable column
ALTER TABLE public.catalog_spec_definitions ADD COLUMN IF NOT EXISTS facetable boolean DEFAULT false;
