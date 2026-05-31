-- 1. Create the storage bucket for yard assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('yard-assets', 'yard-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row-Level Security on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public read access to all yard assets (for buyer transparency)
CREATE POLICY "Public Access for Yard Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'yard-assets');

-- 4. Policy: Allow authenticated yard owners to insert assets only into their own folder
CREATE POLICY "Sellers Can Upload Own Assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'yard-assets' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Policy: Allow owners to delete or update their own assets
CREATE POLICY "Sellers Can Modify Own Assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'yard-assets' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
