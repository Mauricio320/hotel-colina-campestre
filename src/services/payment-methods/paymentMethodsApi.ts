import { supabase } from "@/config/supabase";
import { PaymentMethod } from "@/types";

export const paymentMethodsApi = {
  fetchAll: async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase.from("payment_methods").select("*").order("name");

    if (error) throw new Error(error.message);
    return data || [];
  },

  create: async (name: string): Promise<PaymentMethod> => {
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({ name })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id: string, name: string): Promise<PaymentMethod> => {
    const { data, error } = await supabase
      .from("payment_methods")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);

    if (error) throw new Error(error.message);
  },
};
