CREATE TABLE IF NOT EXISTS landing_page_image_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_page_image_categories_order
  ON landing_page_image_categories (display_order);

ALTER TABLE landing_page_image_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "landing_image_categories_public_read" ON landing_page_image_categories;
CREATE POLICY "landing_image_categories_public_read"
  ON landing_page_image_categories FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "landing_image_categories_admin_write" ON landing_page_image_categories;
CREATE POLICY "landing_image_categories_admin_write"
  ON landing_page_image_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON r.id = e.role_id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON r.id = e.role_id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

INSERT INTO landing_page_image_categories (name, display_order) VALUES
  ('Hotel', 0),
  ('Habitaciones', 1),
  ('Paisajes', 2)
ON CONFLICT (name) DO NOTHING;
