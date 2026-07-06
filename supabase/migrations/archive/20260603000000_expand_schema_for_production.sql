-- Expand taxonomy tables for bilingual support
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS name_es VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS slug_es VARCHAR(255),
ADD COLUMN IF NOT EXISTS slug_en VARCHAR(255);

ALTER TABLE public.part_types 
ADD COLUMN IF NOT EXISTS name_es VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS slug_es VARCHAR(255),
ADD COLUMN IF NOT EXISTS slug_en VARCHAR(255);

-- Update parts table to link with taxonomy and support upserts
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS part_type_id UUID REFERENCES public.part_types(id) ON DELETE SET NULL;

-- Add unique constraint for seeding stability (optional but recommended for this script)
ALTER TABLE public.parts
DROP CONSTRAINT IF EXISTS parts_title_seller_id_key;

ALTER TABLE public.parts
ADD CONSTRAINT parts_title_seller_id_key UNIQUE (title, seller_id);
