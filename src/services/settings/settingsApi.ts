import { supabase } from "@/config/supabase";

export const getSettings = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("*");

  if (error) {
    throw error;
  }

  return data || [];
};

export const getPaymentMethods = async () => {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*");

  if (error) {
    throw error;
  }

  return data || [];
};