-- Rebaseline storage bucket and RLS policies for yard assets.
-- The default `supabase db dump` excludes the internal `storage` schema, so
-- the application-specific bucket and policies are recreated here.

-- 1. Create the yard-assets bucket if it does not exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('yard-assets', 'yard-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to yard-assets objects.
DROP POLICY IF EXISTS "Public Access for Yard Assets" ON storage.objects;
CREATE POLICY "Public Access for Yard Assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'yard-assets');

-- 4. Allow authenticated sellers to upload assets into their own folder.
DROP POLICY IF EXISTS "Sellers Can Upload Own Assets" ON storage.objects;
CREATE POLICY "Sellers Can Upload Own Assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'yard-assets'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Allow authenticated sellers to modify/delete their own assets.
DROP POLICY IF EXISTS "Sellers Can Modify Own Assets" ON storage.objects;
CREATE POLICY "Sellers Can Modify Own Assets"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'yard-assets'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
