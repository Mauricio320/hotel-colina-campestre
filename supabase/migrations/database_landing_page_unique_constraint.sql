-- Migration: Add unique constraint on landing_page_id for upsert to work

-- First, ensure updated_at column exists
ALTER TABLE landing_page_state
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add html_content column if not exists
ALTER TABLE landing_page_state
ADD COLUMN IF NOT EXISTS html_content text;

-- Delete duplicates first if any exist (keep the first one created)
DELETE FROM landing_page_state a
USING landing_page_state b
WHERE a.created_at > b.created_at
AND a.landing_page_id = b.landing_page_id;

-- Now add the unique constraint
ALTER TABLE landing_page_state
ADD CONSTRAINT landing_page_state_landing_page_id_key
UNIQUE (landing_page_id);

-- Create index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_landing_page_state_html_content
ON landing_page_state(id)
WHERE html_content IS NOT NULL;

COMMENT ON COLUMN landing_page_state.html_content IS 'Pre-rendered HTML content for static serving (SEO optimized)';
