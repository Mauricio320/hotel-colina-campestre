-- ============================================================================
-- Migration: Landing Page CMS Schema
-- Date: 2026-04-07
-- Description: Creates tables for editable landing page content, a dedicated
--              images table, and a public Supabase Storage bucket.
-- ============================================================================

-- Drop old enum type if it exists from previous migrations
DROP TYPE IF EXISTS section_type;

-- ============================================================================
-- 1. landing_page_sections
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_section_type UNIQUE (section_type),
  CONSTRAINT valid_section_type CHECK (
    section_type IN ('hero', 'about', 'services', 'gallery', 'tourism', 'contact')
  )
);

-- RLS
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read landing_page_sections" ON landing_page_sections;
CREATE POLICY "Public read landing_page_sections"
  ON landing_page_sections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin modify landing_page_sections" ON landing_page_sections;
CREATE POLICY "Admin modify landing_page_sections"
  ON landing_page_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- ============================================================================
-- 2. landing_page_content
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  content_json jsonb NOT NULL DEFAULT '{}',
  last_edited_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_section_content UNIQUE (section_id)
);

CREATE INDEX IF NOT EXISTS idx_landing_page_content_section_id
  ON landing_page_content(section_id);

-- RLS
ALTER TABLE landing_page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read landing_page_content" ON landing_page_content;
CREATE POLICY "Public read landing_page_content"
  ON landing_page_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin modify landing_page_content" ON landing_page_content;
CREATE POLICY "Admin modify landing_page_content"
  ON landing_page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- ============================================================================
-- 3. landing_page_images
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  alt_text text,
  title text,
  description text,
  category text,
  badge text,
  featured boolean DEFAULT false,
  slot text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_page_images_section_order
  ON landing_page_images(section_id, display_order);

CREATE INDEX IF NOT EXISTS idx_landing_page_images_section_category
  ON landing_page_images(section_id, category);

-- RLS
ALTER TABLE landing_page_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read landing_page_images" ON landing_page_images;
CREATE POLICY "Public read landing_page_images"
  ON landing_page_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin modify landing_page_images" ON landing_page_images;
CREATE POLICY "Admin modify landing_page_images"
  ON landing_page_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- ============================================================================
-- 4. Triggers (updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_landing_page_sections_updated_at ON landing_page_sections;
CREATE TRIGGER update_landing_page_sections_updated_at
  BEFORE UPDATE ON landing_page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_page_content_updated_at ON landing_page_content;
CREATE TRIGGER update_landing_page_content_updated_at
  BEFORE UPDATE ON landing_page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_page_images_updated_at ON landing_page_images;
CREATE TRIGGER update_landing_page_images_updated_at
  BEFORE UPDATE ON landing_page_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Storage bucket: landing-page-images
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'landing-page-images',
  'landing-page-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Public read landing-page-images" ON storage.objects;
CREATE POLICY "Public read landing-page-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'landing-page-images');

DROP POLICY IF EXISTS "Admin write landing-page-images" ON storage.objects;
CREATE POLICY "Admin write landing-page-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'landing-page-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

DROP POLICY IF EXISTS "Admin update landing-page-images" ON storage.objects;
CREATE POLICY "Admin update landing-page-images"
  ON storage.objects FOR UPDATE
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

DROP POLICY IF EXISTS "Admin delete landing-page-images" ON storage.objects;
CREATE POLICY "Admin delete landing-page-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'landing-page-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- ============================================================================
-- 6. Seed data
-- ============================================================================

INSERT INTO landing_page_sections (section_type, display_order, is_active) VALUES
  ('hero', 1, true),
  ('about', 2, true),
  ('services', 3, true),
  ('gallery', 4, true),
  ('tourism', 5, true),
  ('contact', 6, true)
ON CONFLICT (section_type) DO NOTHING;

DO $$
DECLARE
  hero_id uuid;
  services_id uuid;
BEGIN
  SELECT id INTO hero_id FROM landing_page_sections WHERE section_type = 'hero';
  SELECT id INTO services_id FROM landing_page_sections WHERE section_type = 'services';

  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (hero_id, '{
    "title": "Hotel ideal para familias, turistas y viajeros de negocios",
    "subtitle": "Experimente la serenidad de nuestro refugio campestre con todas las comodidades de la ciudad.",
    "cta_text": "Reservar ahora",
    "cta_link": "/reservar"
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (services_id, '{
    "title": "Nuestros Servicios",
    "items": [
      {"id": "1", "icon": "pi-clock", "title": "Recepción 24 horas"},
      {"id": "2", "icon": "pi-home", "title": "Habitaciones equipadas"},
      {"id": "3", "icon": "pi-desktop", "title": "TV Cable"},
      {"id": "4", "icon": "pi-cog", "title": "Aire acondicionado"},
      {"id": "5", "icon": "pi-heart", "title": "Bar"},
      {"id": "6", "icon": "pi-briefcase", "title": "Guarda equipaje"},
      {"id": "7", "icon": "pi-star", "title": "Zona de juegos"},
      {"id": "8", "icon": "pi-globe", "title": "Zonas de aire libre"},
      {"id": "9", "icon": "pi-car", "title": "Parqueadero gratuito"},
      {"id": "10", "icon": "pi-wifi", "title": "Wifi"}
    ]
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;
END $$;
