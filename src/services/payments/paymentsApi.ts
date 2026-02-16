import { supabase } from "@/config/supabase";
import { Payment } from "@/types";

export interface PaymentWithRelations extends Payment {
  stay: {
    order_number: number;
    guest: {
      first_name: string;
      last_name: string;
    } | null;
    room: {
      room_number: string;
      category: string;
    };
  } | null;
  payment_method: {
    name: string;
  } | null;
  employee: {
    first_name: string;
    last_name: string;
  } | null;
}

export const fetchPaymentsByCategory = async (
  category: string,
): Promise<PaymentWithRelations[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      stay:stays(
        order_number,
        guest:guests!stays_guest_id_fkey(first_name, last_name),
        room:rooms!inner(room_number, category)
      ),
      payment_method:payment_methods(name),
      employee:employees(first_name, last_name)
    `,
    )
    .eq("stay.room.category", category)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data || [];
};
