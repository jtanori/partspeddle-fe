-- Hardening RLS for Taxonomy tables
-- Step 1: Remove conflicting/duplicate policies
DROP POLICY IF EXISTS "Allow public read access for taxonomy and fitment" ON public.categories;
DROP POLICY IF EXISTS "Public read access" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access for part_types" ON public.part_types;
DROP POLICY IF EXISTS "Public read access" ON public.part_types;
DROP POLICY IF EXISTS "Allow public read access for makes" ON public.makes;
DROP POLICY IF EXISTS "Public read access" ON public.makes;
DROP POLICY IF EXISTS "Allow public read access for models" ON public.models;
DROP POLICY IF EXISTS "Public read access" ON public.models;
DROP POLICY IF EXISTS "Allow public read access for variants" ON public.vehicle_variants;
DROP POLICY IF EXISTS "Public read access" ON public.vehicle_variants;
DROP POLICY IF EXISTS "Allow public read access for part_fitment" ON public.part_fitment;
DROP POLICY IF EXISTS "Public read access" ON public.part_fitment;

-- Step 2: Create unified 'Public read' policies
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.part_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.makes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.models FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.vehicle_variants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.part_fitment FOR SELECT USING (true);
