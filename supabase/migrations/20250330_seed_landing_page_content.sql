-- Migration: Seed default landing page content
-- Date: 2025-03-30
-- Description: Seeds default content for all 5 landing page sections

-- Get the section IDs first
DO $$
DECLARE
  hotel_section_id uuid;
  comfaboy_section_id uuid;
  turismo_section_id uuid;
  fotos_section_id uuid;
  contacto_section_id uuid;
BEGIN
  -- Get section IDs
  SELECT id INTO hotel_section_id FROM landing_page_sections WHERE section_type = 'hotel';
  SELECT id INTO comfaboy_section_id FROM landing_page_sections WHERE section_type = 'comfaboy';
  SELECT id INTO turismo_section_id FROM landing_page_sections WHERE section_type = 'turismo';
  SELECT id INTO fotos_section_id FROM landing_page_sections WHERE section_type = 'fotos';
  SELECT id INTO contacto_section_id FROM landing_page_sections WHERE section_type = 'contacto';

  -- Insert Hotel Section Content
  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (hotel_section_id, '{
    "hero": {
      "title": "Hotel ideal para familias, turistas y viajeros de negocios",
      "subtitle": "Experimente la serenidad de nuestro refugio campestre con todas las comodidades de la ciudad.",
      "background_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920",
      "cta_text": "Reservar ahora",
      "cta_link": "/reservar"
    },
    "about": {
      "label": "Nuestra Esencia",
      "title": "Un Santuario de Paz en el Corazón de la Naturaleza",
      "description_1": "En Hotel Colina Campestre, nuestra misión es ofrecer un equilibrio perfecto entre la calidez del hogar y la sofisticación de la hospitalidad moderna.",
      "description_2": "Ubicado entre colinas verdes, brindamos un ambiente donde la tranquilidad es la prioridad, asegurando que cada huésped, ya sea por negocios o placer, encuentre su propio espacio de renovación.",
      "image_1": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "image_2": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
    },
    "services": {
      "title": "Servicios Exclusivos",
      "items": [
        { "id": "1", "icon": "support_agent", "title": "Recepción 24 horas" },
        { "id": "2", "icon": "hotel", "title": "Habitaciones con closet, escritorio y TV" },
        { "id": "3", "icon": "tv", "title": "DirecTV" },
        { "id": "4", "icon": "ac_unit", "title": "Aire acondicionado" },
        { "id": "5", "icon": "local_bar", "title": "Bar" },
        { "id": "6", "icon": "luggage", "title": "Guarda equipaje" },
        { "id": "7", "icon": "sports_esports", "title": "Zona de juegos" },
        { "id": "8", "icon": "forest", "title": "Zonas de aire libre" },
        { "id": "9", "icon": "local_parking", "title": "Parqueadero gratuito" },
        { "id": "10", "icon": "wifi", "title": "Wifi de alta velocidad" }
      ]
    }
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

  -- Insert Comfaboy Section Content
  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (comfaboy_section_id, '{
    "hero": {
      "title": "Convenio Comfaboy",
      "background_image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920"
    },
    "description": "Hotel Colina Campestre tiene convenio con Comfaboy para brindar tarifas especiales a los afiliados y sus familias. Disfrute de descuentos exclusivos en hospedaje, alimentación y servicios adicionales.",
    "benefits": [
      { "id": "1", "icon": "percent", "title": "Descuentos especiales", "description": "Hasta 20% de descuento en tarifas de hospedaje" },
      { "id": "2", "icon": "family_restroom", "title": "Beneficios familiares", "description": "Aplica para el núcleo familiar del afiliado" },
      { "id": "3", "icon": "calendar_month", "title": "Vigencia continua", "description": "Convenio activo durante todo el año" },
      { "id": "4", "icon": "card_membership", "title": "Fácil acceso", "description": "Presente su carnet de afiliado vigente" }
    ]
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

  -- Insert Turismo Section Content
  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (turismo_section_id, '{
    "title": "Descubre Boyacá",
    "subtitle": "Explora los destinos turísticos más fascinantes cerca de nuestro hotel",
    "attractions": [
      {
        "id": "1",
        "name": "Villa de Leyva",
        "description": "Pueblo colonial con la plaza mayor más grande de Colombia, declarado Monumento Nacional.",
        "image": "https://images.unsplash.com/photo-1590001155093-da3cc66d2a44?w=600",
        "distance_km": 35
      },
      {
        "id": "2",
        "name": "Cascadas de la Periquera",
        "description": "Hermosas cascadas naturales ideales para ecoturismo y fotografía.",
        "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600",
        "distance_km": 12
      },
      {
        "id": "3",
        "name": "Museo del Chocolate",
        "description": "Conozca la historia del cacao y disfrute de degustaciones exclusivas.",
        "image": "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600",
        "distance_km": 8
      },
      {
        "id": "4",
        "name": "Pueblito Boyacense",
        "description": "Replica de las principales ciudades de Boyacá en un solo lugar.",
        "image": "https://images.unsplash.com/photo-1518182170546-0766bc6f9213?w=600",
        "distance_km": 5
      }
    ]
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

  -- Insert Fotos Section Content
  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (fotos_section_id, '{
    "title": "Galería de Fotos",
    "photos": [
      { "id": "1", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "caption": "Vista exterior del hotel", "alt": "Fachada del Hotel Colina Campestre" },
      { "id": "2", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", "caption": "Lobby principal", "alt": "Lobby con recepción 24 horas" },
      { "id": "3", "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", "caption": "Habitación premium", "alt": "Habitación con cama king size" },
      { "id": "4", "image_url": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800", "caption": "Áreas verdes", "alt": "Jardines del hotel" },
      { "id": "5", "image_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "caption": "Piscina", "alt": "Piscina al aire libre" },
      { "id": "6", "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "caption": "Restaurante", "alt": "Restaurante con vista a los jardines" }
    ]
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

  -- Insert Contacto Section Content
  INSERT INTO landing_page_content (section_id, content_json)
  VALUES (contacto_section_id, '{
    "title": "Contáctanos",
    "description": "Estamos aquí para ayudarte. Completa el formulario o utiliza nuestros canales de comunicación.",
    "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971!2d-73.3667!3d5.5333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzInMDAuMCJOIDczwrAyMicwMC4wIlc!5e0!3m2!1ses!2sco!4v1234567890",
    "contact_info": {
      "address": "Vía Principal Colina, Sector Campestre, Tunja, Boyacá",
      "phone": "+57 (8) 123-4567",
      "email": "info@colinacampestre.com",
      "hours": "Recepción: 24 horas | Check-in: 3:00 PM | Check-out: 12:00 PM"
    },
    "form_enabled": true
  }'::jsonb)
  ON CONFLICT (section_id) DO NOTHING;

END $$;
