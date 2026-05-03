-- Storage Bucket Policies for Performance Gym
-- Run this in your Supabase SQL Editor to fix image visibility issues
-- This makes all storage bucket objects publicly readable

-- ============================================================
-- OPTION 1 (Recommended): Make the bucket itself public
-- Run this in the Supabase Dashboard:
--   Storage → Your Bucket → Edit → Toggle "Public bucket" ON
-- This is the easiest fix and requires no SQL.
-- ============================================================

-- ============================================================
-- OPTION 2: Storage policies via SQL (if keeping bucket private)
-- Replace 'your-bucket-name' with your actual bucket name
-- e.g., 'gallery', 'images', 'gym-images', etc.
-- ============================================================

-- Allow anyone to view/download objects (public read)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'your-bucket-name');

-- Allow anon (admin panel) to upload images
CREATE POLICY "Allow anon uploads"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'your-bucket-name');

-- Allow anon (admin panel) to delete images
CREATE POLICY "Allow anon deletes"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'your-bucket-name');

-- ============================================================
-- OPTION 3: Quick fix — use direct public URLs
-- In Supabase Dashboard → Storage → your bucket → select file
-- → Copy the public URL and use that directly in gallery_images.url
-- Public URL format:
-- https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<filename>
-- ============================================================
