-- Migration: Add html_content column to landing_page_state table
-- This allows storing pre-rendered HTML for better performance and SEO

ALTER TABLE landing_page_state
ADD COLUMN IF NOT EXISTS html_content text;

-- Create index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_landing_page_state_html_content
ON landing_page_state(id)
WHERE html_content IS NOT NULL;

COMMENT ON COLUMN landing_page_state.html_content IS 'Pre-rendered HTML content for static serving (SEO optimized)';
