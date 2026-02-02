-- Ejecuta este script en el SQL Editor de Supabase para actualizar la función con el nuevo filtro
-- Agregamos el parámetro p_is_reservation para filtrar por origen de reserva

CREATE OR REPLACE FUNCTION get_stays_paginated(
  p_accommodation_type_id uuid,
  p_page int,
  p_page_size int,
  p_order_number text DEFAULT '',
  p_doc_number text DEFAULT '',
  p_is_reservation boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
  v_total bigint;
  v_offset int := p_page * p_page_size;
BEGIN
  -- 1. Calcular total de registros que coinciden con los filtros
  SELECT COUNT(s.id) INTO v_total
  FROM stays s
  LEFT JOIN rooms r ON s.room_id = r.id
  JOIN guests g ON s.guest_id = g.id
  WHERE 
    (s.accommodation_type_id = p_accommodation_type_id OR r.accommodation_type_id = p_accommodation_type_id)
    AND (p_order_number IS NULL OR p_order_number = '' OR s.order_number::text ILIKE '%' || p_order_number || '%')
    AND (p_doc_number IS NULL OR p_doc_number = '' OR g.doc_number::text ILIKE '%' || p_doc_number || '%')
    AND (p_is_reservation IS NULL OR s.origin_was_reservation = p_is_reservation);

  -- 2. Obtener los datos paginados
  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT 
      s.*,
      json_build_object('room_number', r.room_number, 'accommodation_type_id', r.accommodation_type_id) as room,
      json_build_object('first_name', g.first_name, 'last_name', g.last_name, 'doc_number', g.doc_number, 'doc_type', g.doc_type) as guest
    FROM stays s
    LEFT JOIN rooms r ON s.room_id = r.id
    JOIN guests g ON s.guest_id = g.id
    WHERE 
      (s.accommodation_type_id = p_accommodation_type_id OR r.accommodation_type_id = p_accommodation_type_id)
      AND (p_order_number IS NULL OR p_order_number = '' OR s.order_number::text ILIKE '%' || p_order_number || '%')
      AND (p_doc_number IS NULL OR p_doc_number = '' OR g.doc_number::text ILIKE '%' || p_doc_number || '%')
      AND (p_is_reservation IS NULL OR s.origin_was_reservation = p_is_reservation)
    ORDER BY s.created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) t;

  -- 3. Retornar estructura
  RETURN json_build_object(
    'data', COALESCE(v_result, '[]'::json),
    'count', v_total
  );
END;
$$;
