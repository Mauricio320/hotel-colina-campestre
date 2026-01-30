-- Migration: Add configuration fields to stays table
-- Purpose: Store historical configuration data for each stay

-- Add IVA percentage field
ALTER TABLE stays ADD COLUMN iva_percentage INTEGER DEFAULT 19;

-- Add person count field
ALTER TABLE stays ADD COLUMN person_count INTEGER DEFAULT 1;

-- Add extra mattress count field
ALTER TABLE stays ADD COLUMN extra_mattress_count INTEGER DEFAULT 0;

-- Add extra mattress unit price field
ALTER TABLE stays ADD COLUMN extra_mattress_unit_price INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN stays.iva_percentage IS 'IVA percentage used at time of stay creation (e.g., 19 for 19%)';
COMMENT ON COLUMN stays.person_count IS 'Number of guests staying in the room';
COMMENT ON COLUMN stays.extra_mattress_count IS 'Number of extra mattresses requested';
COMMENT ON COLUMN stays.extra_mattress_unit_price IS 'Unit price per extra mattress at time of stay creation';