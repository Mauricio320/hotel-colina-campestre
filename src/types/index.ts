export enum Role {
  Admin = "Admin",
  Recepcionista = "Recepcionista",
  Limpieza = "Limpieza",
  Mantenimiento = "Mantenimiento",
}

export enum PaymentType {
  ABONO_RESERVA = "ABONO_RESERVA", // Abono parcial de reserva
  PAGO_COMPLETO_RESERVA = "PAGO_COMPLETO_RESERVA", // Pago completo de reserva
  PAGO_CHECKIN_DIRECTO = "PAGO_CHECKIN_DIRECTO", // Pago completo check-in directo
  ANTICIPADO_COMPLETO = "ANTICIPADO_COMPLETO", // Pago completo anticipado
}

export interface RoomStatus {
  id: string;
  name: "Ocupado" | "Disponible" | "Reservado" | "Limpieza" | "Mantenimiento";
  color: string;
}

export interface Room {
  id: string;
  room_number: string;
  category: "Hotel" | "Apartamento" | "Casa 1" | "Casa 2"; // LEGACY - solo para compatibilidad
  accommodation_type_id: string; // Nuevo campo para relación con accommodation_types
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
  password?: string;
}

export interface Stay {
  id?: string;
  order_number?: number;
  room_id?: string;
  guest_id: string;
  employee_id: string;
  check_in_date: string;
  check_out_date: string;
  status: "Active" | "Completed" | "Cancelled" | "Reserved";
  total_price: number;
  paid_amount: number;
  payment_method_id: string;
  has_extra_mattress: boolean;
  extra_mattress_price: number;
  is_invoice_requested: boolean;
  iva_amount: number;
  observation?: string;
  origin_was_reservation: boolean;
  // New configuration fields
  iva_percentage: number;
  person_count: number;
  extra_mattress_count: number;
  extra_mattress_unit_price: number;
  room?: Room;
  guest?: Guest;
  accommodation_type_id?: string;
  room_status_id?: string;
  active?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Payment {
  id?: string;
  stay_id?: string;
  payment_method_id: string;
  employee_id: string;
  amount: number;
  payment_date: string;
  observation?: string;
  payment_type: PaymentType;
  created_at: string;
  payment_method?: PaymentMethod;
  employee?: Employee;
  accommodation_type_id?: string;
  accommodation_type?: AccommodationType;
}

export interface CreatePaymentDto {
  stay_id: string;
  payment_method_id: string;
  employee_id: string;
  amount: number;
  payment_type: PaymentType;
  observation?: string;
}

export interface StayWithPaymentDto {
  stayData: any;
  paymentData: CreatePaymentDto;
}

export interface PaymentSummary {
  totalPaid: number;
  totalAmount: number;
  pendingAmount: number;
  payments: Payment[];
  isFullyPaid: boolean;
}

export interface AccommodationType {
  id: string;
  name: string;
  price: number;
  is_rentable: boolean;
  created_at: string;
}

export interface AccommodationType {
  id: string;
  name: string;
  price: number;
  is_rentable: boolean;
  created_at: string;
}

export interface RoomStatus {
  id: string;
  name: "Ocupado" | "Disponible" | "Reservado" | "Limpieza" | "Mantenimiento";
  color: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface RoomHistory {
  id: string;
  room_id?: string;
  stay_id?: string;
  previous_status_id?: string;
  new_status_id: string;
  employee_id: string;
  action_type: string;
  observation?: string;
  timestamp: string;
  accommodation_type_id?: string;
  accommodation_type?: AccommodationType;
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

export interface PriceOverride {
  id?: string;
  stay_id?: string;
  original_price: number;
  discount_amount: number;
  final_price: number;
  authorized_by: string;
  created_at?: string;
}
