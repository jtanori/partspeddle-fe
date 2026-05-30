-- Performance-oriented schema for fitment and taxonomy

-- Drop the flat MVP table
DROP TABLE IF EXISTS public.vehicle_models CASCADE;

-- 1. Taxonomy Tables (Optimized)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.part_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- 2. Normalized Fitment Tables
CREATE TABLE public.makes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make_id UUID REFERENCES public.makes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(make_id, name)
);

CREATE TABLE public.vehicle_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    UNIQUE(model_id, year)
);

-- 3. Junction Table for Parts <-> Fitment
CREATE TABLE public.part_fitment (
    part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE,
    vehicle_variant_id UUID REFERENCES public.vehicle_variants(id) ON DELETE CASCADE,
    PRIMARY KEY (part_id, vehicle_variant_id)
);

-- Indexes for performance
CREATE INDEX idx_models_make_id ON public.models(make_id);
CREATE INDEX idx_variants_model_id ON public.vehicle_variants(model_id);
CREATE INDEX idx_part_fitment_vehicle_id ON public.part_fitment(vehicle_variant_id);
CREATE INDEX idx_part_fitment_part_id ON public.part_fitment(part_id);

-- Enable RLS
ALTER TABLE public.makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_fitment ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read access for taxonomy and fitment" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for part_types" ON public.part_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access for makes" ON public.makes FOR SELECT USING (true);
CREATE POLICY "Allow public read access for models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Allow public read access for variants" ON public.vehicle_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read access for part_fitment" ON public.part_fitment FOR SELECT USING (true);
