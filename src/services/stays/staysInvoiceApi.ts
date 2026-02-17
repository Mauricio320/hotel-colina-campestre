import { supabase } from "@/config/supabase";
import { Payment } from "@/types";

export interface StayInvoiceData {
  id: string;
  order_number: number;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  iva_amount: number;
  extra_mattress_price: number;
  extra_mattress_count: number;
  person_count: number;
  has_extra_mattress: boolean;
  is_invoice_requested: boolean;
  created_at: string;
  observation?: string;
  guest?: {
    first_name: string;
    last_name: string;
    doc_type?: string;
    doc_number?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
  } | null;
  room?: {
    room_number: string;
    category: string;
  } | null;
  payment_method?: {
    name: string;
  } | null;
  price_override?: Array<{
    original_price: number;
    discount_amount: number;
    employee?: {
      first_name: string;
      last_name: string;
    } | null;
  }> | null;
}

export const staysInvoiceApi = {
  fetchStayWithInvoiceData: async (stayId: string): Promise<StayInvoiceData> => {
    const { data, error } = await supabase
      .from("stays")
      .select(
        `
        *,
        guest:guests!stays_guest_id_fkey(*),
        room:rooms(*),
        payment_method:payment_methods(name),
        price_override:price_overrides(*,employee:employees(first_name, last_name))
      `,
      )
      .eq("id", stayId)
      .single();

    if (error) throw error;
    return data as StayInvoiceData;
  },

  fetchPaymentsByStayId: async (stayId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name)
      `,
      )
      .eq("stay_id", stayId)
      .order("payment_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
