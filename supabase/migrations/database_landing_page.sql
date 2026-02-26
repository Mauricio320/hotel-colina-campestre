-- Landing pages table (singleton pattern)
CREATE TABLE IF NOT EXISTS landing_pages (
  id text PRIMARY KEY DEFAULT 'default',
  name text DEFAULT 'Página Principal',
  last_edited_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landing page state storage
CREATE TABLE IF NOT EXISTS landing_page_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id text REFERENCES landing_pages(id) ON DELETE CASCADE,
  nodes_json jsonb NOT NULL,
  global_styles jsonb DEFAULT '{}',
  html_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT landing_page_state_landing_page_id_key UNIQUE (landing_page_id)
);

-- Insert default landing page
INSERT INTO landing_pages (id, name)
VALUES ('default', 'Página Principal')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_state ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow all read landing_pages" ON landing_pages;
DROP POLICY IF EXISTS "Allow all read landing_page_state" ON landing_page_state;
DROP POLICY IF EXISTS "Only admins can modify landing_pages" ON landing_pages;
DROP POLICY IF EXISTS "Only admins can modify landing_page_state" ON landing_page_state;

-- Policies
CREATE POLICY "Allow all read landing_pages"
  ON landing_pages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all read landing_page_state"
  ON landing_page_state
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify landing_pages"
  ON landing_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );

CREATE POLICY "Only admins can modify landing_page_state"
  ON landing_page_state
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_id = auth.uid() AND r.name = 'Admin'
    )
  );
