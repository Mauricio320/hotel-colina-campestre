
-- ... (mismo contenido superior de database.sql)

INSERT INTO public.room_statuses (name, color) VALUES 
('Disponible', 'bg-green-500'),
('Ocupado', 'bg-red-500'),
('Reserved', 'bg-yellow-500'),
('Limpieza', 'bg-blue-500'),
('Mantenimiento', 'bg-gray-500')
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;

-- ... (resto del script database.sql igual)
