-- Migration: Add updated_at column to landing_page_state table
-- This is required for the upsert operation

ALTER TABLE landing_page_state
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_landing_page_state_updated_at ON landing_page_state;

CREATE TRIGGER update_landing_page_state_updated_at
    BEFORE UPDATE ON landing_page_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Also ensure html_content column exists (from previous migration)
ALTER TABLE landing_page_state
ADD COLUMN IF NOT EXISTS html_content text;

-- Add unique constraint on landing_page_id for upsert to work
ALTER TABLE landing_page_state
ADD CONSTRAINT IF NOT EXISTS landing_page_state_landing_page_id_key
UNIQUE (landing_page_id);
