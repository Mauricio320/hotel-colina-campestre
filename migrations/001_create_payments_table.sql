-- Migration: Create payments table for detailed payment tracking
-- Date: 2025-01-28
-- Description: Adds detailed payment tracking system with proper types and relationships

-- Create the payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stay_id uuid NOT NULL,
  payment_method_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_date timestamp with time zone DEFAULT now(),
  observation text,
  payment_type text NOT NULL CHECK (
    payment_type = ANY (ARRAY[
      'ABONO_RESERVA'::text, 
      'PAGO_COMPLETO_RESERVA'::text, 
      'PAGO_CHECKIN_DIRECTO'::text,
      'ANTICIPADO_COMPLETO'::text
    ])
  ),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_stay_id_fkey FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE CASCADE,
  CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
  CONSTRAINT payments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

-- Add indexes for better performance
CREATE INDEX idx_payments_stay_id ON public.payments(stay_id);
CREATE INDEX idx_payments_employee_id ON public.payments(employee_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_payment_type ON public.payments(payment_type);

-- Add comments for documentation
COMMENT ON TABLE public.payments IS 'Detailed payment tracking for hotel stays and reservations';
COMMENT ON COLUMN public.payments.stay_id IS 'Reference to the stay/reservation this payment belongs to';
COMMENT ON COLUMN public.payments.payment_method_id IS 'Payment method used (cash, card, transfer, etc.)';
COMMENT ON COLUMN public.payments.employee_id IS 'Employee who registered this payment';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount in local currency';
COMMENT ON COLUMN public.payments.payment_date IS 'When the payment was made';
COMMENT ON COLUMN public.payments.observation IS 'Additional notes about this payment';
COMMENT ON COLUMN public.payments.payment_type IS 'Type of payment: ABONO_RESERVA, PAGO_COMPLETO_RESERVA, PAGO_CHECKIN_DIRECTO, ANTICIPADO_COMPLETO';