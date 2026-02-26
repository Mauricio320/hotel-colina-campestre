import { supabase } from "@/config/supabase";

export interface Setting {
  key: string;
  value: number;
}

export const getSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase.from("settings").select("*");

  if (error) {
    throw error;
  }

  return data || [];
};

export const updateSetting = async (key: string, value: number): Promise<void> => {
  const { error } = await supabase.from("settings").update({ value }).eq("key", key);

  if (error) throw error;
};

export const getPaymentMethods = async () => {
  const { data, error } = await supabase.from("payment_methods").select("*");

  if (error) {
    throw error;
  }

  return data || [];
};

export const settingsApi = {
  getSettings,
  updateSetting,
  getPaymentMethods,
};
