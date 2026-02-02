import { supabase } from "@/config/supabase";
import { Stay } from "@/types";

export const StayCreateService = (stayData: Stay) => {
  return supabase.from("stays").insert(stayData).select().single();
};
