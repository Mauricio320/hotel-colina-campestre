-- Migración para implementar sistema de casas completas
-- Fecha: 2026-01-29
-- Autor: Claude Code

-- 1. Crear tabla house_rates
CREATE TABLE public.house_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category = ANY (ARRAY['Casa 1'::text, 'Casa 2'::text])),
  fixed_rate numeric NOT NULL,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.employees(id),
  CONSTRAINT house_rates_pkey PRIMARY KEY (id)
);

-- 2. Crear tabla house_rate_history
CREATE TABLE public.house_rate_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  house_rate_id uuid NOT NULL REFERENCES public.house_rates(id),
  old_rate numeric NOT NULL,
  new_rate numeric NOT NULL,
  change_reason text,
  changed_by uuid REFERENCES public.employees(id),
  changed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT house_rate_history_pkey PRIMARY KEY (id)
);

-- 3. Insertar datos iniciales de tarifas de casas
INSERT INTO public.house_rates (id, category, fixed_rate, valid_from, created_by) VALUES
(gen_random_uuid(), 'Casa 1', 600000, CURRENT_DATE, (SELECT id FROM public.employees WHERE email = 'admin@hotel.com' LIMIT 1)),
(gen_random_uuid(), 'Casa 2', 500000, CURRENT_DATE, (SELECT id FROM public.employees WHERE email = 'admin@hotel.com' LIMIT 1));

-- 4. Verificar datos existentes (opcional, para validación)
-- Contar habitaciones activas por categoría
SELECT category, COUNT(*) as active_room_count
FROM public.rooms
WHERE is_active = true AND category IN ('Casa 1', 'Casa 2')
GROUP BY category;

-- 5. Verificar que existen las categorías de casas
SELECT DISTINCT category FROM public.rooms WHERE category IN ('Casa 1', 'Casa 2');

-- 6. Crear índices para mejorar performance (opcional)
CREATE INDEX idx_house_rates_category ON public.house_rates(category);
CREATE INDEX idx_house_rates_valid_from ON public.house_rates(valid_from);
CREATE INDEX idx_house_rate_history_house_rate_id ON public.house_rate_history(house_rate_id);

-- 7. Agregar comentarios a las tablas (opcional)
COMMENT ON TABLE public.house_rates IS 'Tarifas fijas para casas completas';
COMMENT ON TABLE public.house_rate_history IS 'Historial de cambios de tarifas de casas';

-- 8. Agregar constraint para validar que solo existan las categorías permitidas
-- (ya está en el CHECK constraint de la tabla house_rates)

-- 9. Crear función para obtener tarifa vigente (opcional, para uso futuro)
-- CREATE OR REPLACE FUNCTION get_current_house_rate(category text)
-- RETURNS numeric AS $$
--   SELECT fixed_rate FROM public.house_rates
--   WHERE category = $1 AND valid_from <= CURRENT_DATE
--   AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
--   ORDER BY valid_from DESC LIMIT 1;
-- $$ LANGUAGE sql;

-- Fin de la migración