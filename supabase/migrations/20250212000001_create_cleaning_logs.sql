-- Migration: Create cleaning_logs table
-- Description: Table to store cleaning records separate from room_history
-- Created: 2025-02-12

-- Create cleaning_logs table
CREATE TABLE IF NOT EXISTS cleaning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES stays(id) ON DELETE SET NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    cleaning_type TEXT NOT NULL CHECK (cleaning_type IN ('Aseo parcial', 'Aseo general')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by room
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_room_id ON cleaning_logs(room_id);

-- Create index for faster queries by employee
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_employee_id ON cleaning_logs(employee_id);

-- Create index for faster queries by stay
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_stay_id ON cleaning_logs(stay_id);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_created_at ON cleaning_logs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE cleaning_logs IS 'Registros de limpieza realizadas en las habitaciones';
COMMENT ON COLUMN cleaning_logs.room_id IS 'Habitación que fue limpiada';
COMMENT ON COLUMN cleaning_logs.stay_id IS 'Estancia asociada (opcional)';
COMMENT ON COLUMN cleaning_logs.employee_id IS 'Empleado de limpieza que realizó el aseo';
COMMENT ON COLUMN cleaning_logs.cleaning_type IS 'Tipo de limpieza: Aseo parcial o Aseo general';
COMMENT ON COLUMN cleaning_logs.date IS 'Fecha en que se realizó la limpieza (puede venir por URL)';
COMMENT ON COLUMN cleaning_logs.observation IS 'Observaciones adicionales sobre la limpieza';

-- Enable RLS
ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on cleaning_logs" 
    ON cleaning_logs 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON cleaning_logs TO authenticated;
