-- Migration: Add cancelled field to stays table
-- Created: 2026-02-13

-- ==========================================
-- 1. Agregar columna cancelled a stays
-- ==========================================
ALTER TABLE stays 
ADD COLUMN IF NOT EXISTS cancelled boolean DEFAULT false;

-- ==========================================
-- 2. Actualizar registros existentes
-- ==========================================
UPDATE stays 
SET cancelled = true 
WHERE status = 'Cancelled';

-- ==========================================
-- 3. Indice para consultas filtradas
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_stays_cancelled ON stays(cancelled);

-- ==========================================
-- 4. Comentario de documentacion
-- ==========================================
COMMENT ON COLUMN stays.cancelled IS 'Indica si la estancia fue cancelada (true) o esta activa/completada (false)';
