-- Migration: Create maintenance tables
-- Created: 2026-02-12

-- ==========================================
-- 1. Tabla de categorias de mantenimiento
-- ==========================================
CREATE TABLE maintenance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. Tabla de subcategorias de mantenimiento
-- ==========================================
CREATE TABLE maintenance_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES maintenance_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

-- ==========================================
-- 3. Tabla de registros de mantenimiento
-- ==========================================
CREATE TABLE maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id),
  stay_id uuid REFERENCES stays(id),
  employee_id uuid NOT NULL REFERENCES employees(id),
  category_id uuid NOT NULL REFERENCES maintenance_categories(id),
  subcategory_id uuid NOT NULL REFERENCES maintenance_subcategories(id),
  observation text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 4. Indices
-- ==========================================
CREATE INDEX idx_maintenance_logs_room_id ON maintenance_logs(room_id);
CREATE INDEX idx_maintenance_logs_date ON maintenance_logs(date);
CREATE INDEX idx_maintenance_logs_employee_id ON maintenance_logs(employee_id);
CREATE INDEX idx_maintenance_logs_category_id ON maintenance_logs(category_id);
CREATE INDEX idx_maintenance_subcategories_category_id ON maintenance_subcategories(category_id);

-- ==========================================
-- 5. Seed data: Categorias
-- ==========================================
INSERT INTO maintenance_categories (name, color) VALUES
  ('General', '#6b7280'),
  ('Electricidad', '#f59e0b'),
  ('Agua', '#3b82f6'),
  ('Aire acondicionado', '#06b6d4');

-- ==========================================
-- 6. Seed data: Subcategorias para General
-- ==========================================
DO $$
DECLARE
  v_general_id uuid;
BEGIN
  SELECT id INTO v_general_id FROM maintenance_categories WHERE name = 'General';
  
  INSERT INTO maintenance_subcategories (category_id, name) VALUES
    (v_general_id, 'No enciende / No funciona'),
    (v_general_id, 'Funciona mal'),
    (v_general_id, 'Roto / Danado'),
    (v_general_id, 'Hace ruido'),
    (v_general_id, 'Fuga / Goteo'),
    (v_general_id, 'Flojo / Suelto'),
    (v_general_id, 'Falta / Perdido'),
    (v_general_id, 'Sucio'),
    (v_general_id, 'Otro');
END $$;

-- ==========================================
-- 7. Seed data: Subcategorias para Electricidad
-- ==========================================
DO $$
DECLARE
  v_electricidad_id uuid;
BEGIN
  SELECT id INTO v_electricidad_id FROM maintenance_categories WHERE name = 'Electricidad';
  
  INSERT INTO maintenance_subcategories (category_id, name) VALUES
    (v_electricidad_id, 'No enciende'),
    (v_electricidad_id, 'Parpadea'),
    (v_electricidad_id, 'Sin energia'),
    (v_electricidad_id, 'Chispas / Olor'),
    (v_electricidad_id, 'Otro');
END $$;

-- ==========================================
-- 8. Seed data: Subcategorias para Agua (bano)
-- ==========================================
DO $$
DECLARE
  v_agua_id uuid;
BEGIN
  SELECT id INTO v_agua_id FROM maintenance_categories WHERE name = 'Agua';
  
  INSERT INTO maintenance_subcategories (category_id, name) VALUES
    (v_agua_id, 'Gotea'),
    (v_agua_id, 'No sale agua'),
    (v_agua_id, 'Baja presion'),
    (v_agua_id, 'Agua fria'),
    (v_agua_id, 'Tapado'),
    (v_agua_id, 'Otro');
END $$;

-- ==========================================
-- 9. Seed data: Subcategorias para Aire acondicionado
-- ==========================================
DO $$
DECLARE
  v_ac_id uuid;
BEGIN
  SELECT id INTO v_ac_id FROM maintenance_categories WHERE name = 'Aire acondicionado';
  
  INSERT INTO maintenance_subcategories (category_id, name) VALUES
    (v_ac_id, 'No enfria'),
    (v_ac_id, 'No enciende'),
    (v_ac_id, 'Hace ruido'),
    (v_ac_id, 'Gotea agua'),
    (v_ac_id, 'Control no funciona'),
    (v_ac_id, 'Otro');
END $$;

-- ==========================================
-- 10. RLS Policies (opcional, si se usa RLS)
-- ==========================================
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON maintenance_logs
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);
