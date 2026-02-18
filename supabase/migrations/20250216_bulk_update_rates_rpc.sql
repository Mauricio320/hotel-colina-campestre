-- RPC para actualizar tarifas masivamente con historial
-- Ejecutar esto en el SQL Editor de Supabase

-- Primero eliminamos la función si existe (para poder cambiar la firma)
DROP FUNCTION IF EXISTS bulk_update_room_rates_with_history(jsonb, uuid);
DROP FUNCTION IF EXISTS bulk_update_room_rates_with_history(text, uuid);

CREATE OR REPLACE FUNCTION bulk_update_room_rates_with_history(
  updates TEXT,
  employee_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  update_record JSONB;
  updates_jsonb JSONB;
  affected_count INTEGER := 0;
BEGIN
  -- Convertir el texto JSON a JSONB
  updates_jsonb := updates::JSONB;

  -- Iterar sobre cada actualización
  FOR update_record IN SELECT * FROM jsonb_array_elements(updates_jsonb)
  LOOP
    -- 1. Insertar en historial
    INSERT INTO room_rate_history (
      room_id,
      person_count,
      old_rate,
      new_rate,
      employee_id
    ) VALUES (
      (update_record->>'room_id')::UUID,
      (update_record->>'person_count')::INTEGER,
      (update_record->>'old_rate')::NUMERIC,
      (update_record->>'new_rate')::NUMERIC,
      employee_id
    );

    -- 2. Actualizar la tarifa
    UPDATE room_rates
    SET rate = (update_record->>'new_rate')::NUMERIC
    WHERE id = (update_record->>'rate_id')::UUID;

    affected_count := affected_count + 1;
  END LOOP;

  -- Log para debugging (opcional)
  RAISE NOTICE 'Updated % room rates with history', affected_count;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION bulk_update_room_rates_with_history IS
'Actualiza masivamente tarifas de habitaciones y registra el historial de cambios.

Parámetros:
  - updates: Array JSONB con objetos que contienen room_id, person_count, old_rate, new_rate, rate_id
  - employee_id: UUID del empleado que realiza los cambios

Ejemplo de uso:
  SELECT bulk_update_room_rates_with_history(
    ''[{"room_id": "uuid", "person_count": 2, "old_rate": 100000, "new_rate": 120000, "rate_id": "uuid"}]''::jsonb,
    ''uuid-del-empleado''::uuid
  );';
