-- Migration: Rename cleaning_date to date and add index
-- Description: Rename column for URL parameter compatibility
-- Created: 2025-02-13

-- Rename column if exists (for tables already created)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cleaning_logs' AND column_name = 'cleaning_date'
    ) THEN
        ALTER TABLE cleaning_logs RENAME COLUMN cleaning_date TO date;
    END IF;
END $$;

-- Add column if table was just created with old migration
ALTER TABLE cleaning_logs 
    ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_date ON cleaning_logs(date DESC);

-- Update comment
COMMENT ON COLUMN cleaning_logs.date IS 'Fecha en que se realizó la limpieza (puede venir por URL param)';
