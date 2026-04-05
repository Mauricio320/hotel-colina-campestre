-- Migration: Create landing_page_sections table
-- Date: 2025-03-30
-- Description: Creates the landing_page_sections table with enum type for section categories

-- Create enum type for section types
CREATE TYPE section_type AS ENUM ('hotel', 'comfaboy', 'turismo', 'fotos', 'contacto');

-- Create landing_page_sections table
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type section_type NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_section_type UNIQUE (section_type)
);

-- Add comment for documentation
COMMENT ON TABLE landing_page_sections IS 'Stores the available landing page sections';
COMMENT ON COLUMN landing_page_sections.section_type IS 'Type of section: hotel, comfaboy, turismo, fotos, contacto';

-- Seed all 5 sections with proper ordering
INSERT INTO landing_page_sections (section_type, display_order, is_active) VALUES 
  ('hotel', 1, true),
  ('comfaboy', 2, true), 
  ('turismo', 3, true),
  ('fotos', 4, true),
  ('contacto', 5, true)
ON CONFLICT (section_type) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public read landing_page_sections" ON landing_page_sections;
DROP POLICY IF EXISTS "Admin modify landing_page_sections" ON landing_page_sections;

-- Create RLS policies
CREATE POLICY "Public read landing_page_sections" 
  ON landing_page_sections 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin modify landing_page_sections"
  ON landing_page_sections 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_landing_page_sections_updated_at ON landing_page_sections;
CREATE TRIGGER update_landing_page_sections_updated_at
  BEFORE UPDATE ON landing_page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
