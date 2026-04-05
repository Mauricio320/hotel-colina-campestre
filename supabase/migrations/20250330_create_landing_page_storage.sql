-- Migration: Create landing page storage bucket policies
-- Date: 2025-03-30
-- Description: Creates RLS policies for the landing-page-images storage bucket
-- Note: The bucket itself must be created via Supabase Dashboard or Storage API

-- Instructions for creating the bucket:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create new bucket named 'landing-page-images'
-- 3. Set as Public bucket
-- 4. Set file size limit to 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp

-- Or use Supabase CLI:
-- supabase storage create landing-page-images --public

-- RLS policies for storage.objects
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read landing-page-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin write landing-page-images" ON storage.objects;

-- Allow public read access to landing-page-images bucket
CREATE POLICY "Public read landing-page-images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'landing-page-images');

-- Allow admin write access to landing-page-images bucket
CREATE POLICY "Admin write landing-page-images" 
  ON storage.objects 
  FOR ALL 
  TO authenticated 
  USING (
    bucket_id = 'landing-page-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  )
  WITH CHECK (
    bucket_id = 'landing-page-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Note: To insert the bucket record directly (if needed):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'landing-page-images',
--   'landing-page-images', 
--   true,
--   5242880, -- 5MB in bytes
--   ARRAY['image/jpeg', 'image/png', 'image/webp']
-- )
-- ON CONFLICT (id) DO NOTHING;
