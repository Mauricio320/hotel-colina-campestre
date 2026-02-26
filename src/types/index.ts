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
  accommodation_types?: AccommodationType;
  beds_double: number;
  beds_single: number;
  observation?: string;
  status_id: string;
  status_date?: string; // Fecha en la que el estado actual tiene validez visual
  is_active: boolean;
  rates?: RoomRate[];
  status?: RoomStatus;
  stays?: Stay[];
  cleaning_log?: CleaningLog[];
}

export interface RoomRate {
  id: string;
  room_id: string;
  person_count: number;
  rate: number;
}

export interface RoomRateHistory {
  id: string;
  room_id: string;
  person_count: number;
  old_rate: number;
  new_rate: number;
  employee_id: string;
  created_at: string;
  room?: Room;
  employee?: Employee;
}

export interface BulkRateUpdate {
  room_id: string;
  person_count: number;
  old_rate: number;
  new_rate: number;
  rate_id: string;
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
  room_statuses?: RoomStatus;
  additional_guests?: StayGuest[];
  cancelled?: boolean;
  created_at: string;
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

export interface StayGuest {
  stay_id: string;
  guest_id: string;
  is_primary_guest: boolean;
  created_at: string;
  guest?: Guest;
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

export interface CleaningLog {
  id: string;
  room_id: string;
  stay_id?: string;
  employee_id: string;
  cleaning_type: "Aseo parcial" | "Aseo general";
  date: string;
  observation?: string;
  created_at: string;
  room?: Room;
  stay?: Stay;
  employee?: Employee;
}

export type CleaningType = "Aseo parcial" | "Aseo general";

export interface MaintenanceCategory {
  id: string;
  name: "General" | "Electricidad" | "Agua" | "Aire acondicionado";
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface MaintenanceSubcategory {
  id: string;
  category_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  category?: MaintenanceCategory;
}

export interface MaintenanceLog {
  id: string;
  room_id: string;
  stay_id?: string;
  employee_id: string;
  category_id: string;
  subcategory_id: string;
  observation?: string;
  date: string;
  created_at: string;
  room?: Room;
  stay?: Stay;
  employee?: Employee;
  category?: MaintenanceCategory;
  subcategory?: MaintenanceSubcategory;
}

export interface CreateMaintenanceLogDto {
  room_id: string;
  stay_id?: string;
  employee_id: string;
  category_id: string;
  subcategory_id: string;
  observation?: string;
  date: string;
}

// Landing Page Types
export interface LandingPage {
  id: string;
  name: string;
  last_edited_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageState {
  id: string;
  landing_page_id: string;
  nodes_json: Record<string, unknown>;
  global_styles: GlobalStyles;
  html_content?: string;
  created_at: string;
}

export interface CraftJsState {
  [nodeId: string]: CraftJsNode;
}

export interface CraftJsNode {
  id: string;
  data: {
    type: string | { resolvedName: string };
    props: Record<string, unknown>;
    displayName?: string;
    isCanvas?: boolean;
    parent?: string;
    linkedNodes?: Record<string, string>;
    nodes?: string[];
    hidden?: boolean;
    custom?: Record<string, unknown>;
  };
  rules?: {
    canDrag?: boolean;
    canDropIn?: boolean;
    canMoveIn?: boolean;
  };
}

export interface GlobalStyles {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  baseFontSize?: number;
}

// Component-specific prop types
export interface ContainerProps {
  background?: string;
  padding?: number;
  margin?: number;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: number;
}

export interface TextProps {
  text: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  margin?: number;
}

export interface ImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaVariant?: 'primary' | 'secondary' | 'outline';
  minHeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
}

export interface CardsProps {
  columns: 1 | 2 | 3 | 4;
  gap?: number;
  cards: Array<{
    id: string;
    icon?: string;
    title: string;
    description: string;
  }>;
}

export interface GalleryProps {
  columns: 2 | 3 | 4;
  gap?: number;
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

export interface ButtonProps {
  text: string;
  url?: string;
  variant: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  onClickAction?: 'link' | 'scroll' | 'modal';
}

export interface SpacerProps {
  height: number;
}

export interface VideoProps {
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  autoplay?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
}

export interface FormProps {
  title?: string;
  fields: Array<{
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea';
    label: string;
    required?: boolean;
    placeholder?: string;
  }>;
  submitText: string;
  successMessage?: string;
  recipientEmail?: string;
}

export interface NewsletterProps {
  title: string;
  description?: string;
  buttonText: string;
  successMessage?: string;
}
