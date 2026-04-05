-- Migration: Create landing_page_content table
-- Date: 2025-03-30
-- Description: Creates the landing_page_content table to store JSON content for each section

-- Create landing_page_content table
CREATE TABLE IF NOT EXISTS landing_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  content_json jsonb NOT NULL DEFAULT '{}',
  last_edited_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_section_content UNIQUE (section_id)
);

-- Add comments for documentation
COMMENT ON TABLE landing_page_content IS 'Stores the JSON content for each landing page section';
COMMENT ON COLUMN landing_page_content.content_json IS 'JSON object containing all section-specific content';
COMMENT ON COLUMN landing_page_content.last_edited_by IS 'Reference to the employee who last edited this content';

-- Create index for faster lookups by section_id
CREATE INDEX IF NOT EXISTS idx_landing_page_content_section_id 
  ON landing_page_content(section_id);

-- Enable Row Level Security
ALTER TABLE landing_page_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public read landing_page_content" ON landing_page_content;
DROP POLICY IF EXISTS "Admin modify landing_page_content" ON landing_page_content;

-- Create RLS policies
CREATE POLICY "Public read landing_page_content" 
  ON landing_page_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin modify landing_page_content"
  ON landing_page_content 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_landing_page_content_updated_at ON landing_page_content;
CREATE TRIGGER update_landing_page_content_updated_at
  BEFORE UPDATE ON landing_page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
