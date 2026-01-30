-- Seed payment methods if they don't exist
-- This should be executed after creating the payments table

INSERT INTO public.payment_methods (id, name) 
VALUES 
  (gen_random_uuid(), 'Efectivo'),
  (gen_random_uuid(), 'Transferencia Bancaria'),
  (gen_random_uuid(), 'Tarjeta de Crédito/Débito'),
  (gen_random_uuid(), 'Nequi'),
  (gen_random_uuid(), 'Pago Móvil')
ON CONFLICT (name) DO NOTHING;