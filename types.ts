
export enum Role {
  Admin = 'Admin',
  Recepcionista = 'Recepcionista',
  Limpieza = 'Limpieza',
  Mantenimiento = 'Mantenimiento'
}

export interface RoomStatus {
  id: string;
  name: 'Ocupado' | 'Disponible' | 'Reservado' | 'Limpieza' | 'Mantenimiento';
  color: string;
}

export interface Room {
  id: string;
  room_number: string;
  category: 'Hotel' | 'Apartamento' | 'Casa 1' | 'Casa 2';
  beds_double: number;
  beds_single: number;
  observation?: string;
  status_id: string;
  status_date?: string; // Fecha en la que el estado actual tiene validez visual
  is_active: boolean;
  rates?: RoomRate[];
  status?: RoomStatus;
}

export interface RoomRate {
  id: string;
  room_id: string;
  person_count: number;
  rate: number;
}

export interface Guest {
  id: string;
  doc_type: string;
  doc_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
}

export interface Employee {
  id: string;
  doc_type: string;
  doc_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  role_id: string;
  role?: { name: string };
}

export interface Stay {
  id: string;
  order_number: number;
  room_id: string;
  guest_id: string;
  employee_id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Reserved';
  total_price: number;
  paid_amount: number;
  payment_method_id: string;
  has_extra_mattress: boolean;
  extra_mattress_price: number;
  is_invoice_requested: boolean;
  iva_amount: number;
  observation?: string;
  origin_was_reservation: boolean;
  room?: Room;
  guest?: Guest;
}

export interface RoomLog {
  id: string;
  room_id: string;
  stay_id?: string;
  previous_status_id?: string;
  new_status_id: string;
  employee_id: string;
  action_type: string;
  observation?: string;
  timestamp: string;
  employee?: Employee;
}
