-- Fix missing group_name column
ALTER TABLE public.catalog_category_specs ADD COLUMN IF NOT EXISTS group_name text;
