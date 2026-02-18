import { supabase } from "@/config/supabase";
import { Payment } from "@/types";

export interface PaymentWithRelations
  extends Omit<Payment, "payment_method" | "employee" | "stay"> {
  stay: {
    order_number: number;
    guest: {
      first_name: string;
      last_name: string;
    } | null;
    room: {
      room_number: string;
      category: string;
      accommodation_type_id: string;
    };
  };
  payment_method: {
    name: string;
  } | null;
  employee: {
    first_name: string;
    last_name: string;
  } | null;
}

export const fetchPaymentsByCategory = async (
  categoryId: string,
): Promise<PaymentWithRelations[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      stay:stays!inner(
        order_number,
        guest:guests!stays_guest_id_fkey(first_name, last_name),
        room:rooms!inner(room_number, category, accommodation_type_id)
      ),
      payment_method:payment_methods(name),
      employee:employees(first_name, last_name)
    `,
    )
    .eq("stay.room.accommodation_type_id", categoryId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data || [];
};
