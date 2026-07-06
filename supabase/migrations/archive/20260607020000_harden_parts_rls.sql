-- Hardening RLS for 'parts' table
-- Step 1: Remove conflicting policies
DROP POLICY IF EXISTS "public_parts_view" ON public.parts;
DROP POLICY IF EXISTS "Public read access" ON public.parts;
DROP POLICY IF EXISTS "Sellers can manage their own parts" ON public.parts;

-- Step 2: Create a unified policy set

-- Policy 1: Public can only view available parts
CREATE POLICY "Public read active parts"
ON public.parts
FOR SELECT
USING (status = 'available'::text);

-- Policy 2: Sellers can manage their own parts (full CRUD)
CREATE POLICY "Sellers manage own parts"
ON public.parts
FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);
