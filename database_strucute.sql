-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  doc_type text DEFAULT 'Cédula de Ciudadanía'::text,
  doc_number text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  city text,
  address text,
  email text NOT NULL,
  role_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  activo boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.guests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doc_type text NOT NULL,
  doc_number text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  city text,
  address text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT guests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id)
);

CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.room_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  stay_id uuid,
  previous_status_id uuid,
  new_status_id uuid,
  employee_id uuid,
  action_type text NOT NULL,
  observation text,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT room_history_pkey PRIMARY KEY (id),
  CONSTRAINT room_history_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT room_history_stay_id_fkey FOREIGN KEY (stay_id) REFERENCES public.stays(id),
  CONSTRAINT room_history_previous_status_id_fkey FOREIGN KEY (previous_status_id) REFERENCES public.room_statuses(id),
  CONSTRAINT room_history_new_status_id_fkey FOREIGN KEY (new_status_id) REFERENCES public.room_statuses(id),
  CONSTRAINT room_history_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.room_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  person_count integer NOT NULL,
  rate numeric NOT NULL,
  CONSTRAINT room_rates_pkey PRIMARY KEY (id),
  CONSTRAINT room_rates_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.room_statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  CONSTRAINT room_statuses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_number text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Hotel'::text, 'Apartamento'::text, 'Casa 1'::text, 'Casa 2'::text])),
  beds_double integer DEFAULT 0,
  beds_single integer DEFAULT 0,
  observation text,
  status_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  status_date date DEFAULT CURRENT_DATE,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.room_statuses(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value numeric NOT NULL,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('stays_order_number_seq'::regclass) UNIQUE,
  room_id uuid,
  guest_id uuid,
  employee_id uuid,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['Active'::text, 'Reserved'::text, 'Completed'::text, 'Cancelled'::text, 'Moved'::text])),
  total_price numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  payment_method_id uuid,
  has_extra_mattress boolean DEFAULT false,
  is_invoice_requested boolean DEFAULT false,
  iva_amount numeric DEFAULT 0,
  custom_rate_applied boolean DEFAULT false,
  observation text,
  created_at timestamp with time zone DEFAULT now(),
  extra_mattress_price numeric DEFAULT 0,
  origin_was_reservation boolean DEFAULT false,
  CONSTRAINT stays_pkey PRIMARY KEY (id),
  CONSTRAINT stays_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT stays_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id),
  CONSTRAINT stays_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT stays_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);