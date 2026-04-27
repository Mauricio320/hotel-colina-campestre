ALTER TABLE landing_page_sections
  DROP CONSTRAINT valid_section_type,
  ADD CONSTRAINT valid_section_type CHECK (
    section_type IN ('hero', 'about', 'services', 'gallery', 'tourism', 'contact', 'balneario')
  );

INSERT INTO landing_page_sections (section_type, display_order, is_active)
VALUES ('balneario', 7, true)
ON CONFLICT (section_type) DO NOTHING;

DO $$
DECLARE
  balneario_id uuid;
BEGIN
  SELECT id INTO balneario_id FROM landing_page_sections WHERE section_type = 'balneario';

  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (
    balneario_id,
    '{"title": "Balneario", "description": "", "gallery_alt": "Balneario del hotel", "items": []}'::jsonb
  )
  ON CONFLICT (section_id) DO NOTHING;
END $$;
