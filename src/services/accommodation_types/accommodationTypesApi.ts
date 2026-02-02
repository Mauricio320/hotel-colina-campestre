import { supabase } from "@/config/supabase";
import { AccommodationType } from "@/types";

export const accommodationTypesApi = {
  fetchAll: async (): Promise<AccommodationType[]> => {
    const { data, error } = await supabase
      .from("accommodation_types")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },
};

export const fetchAccommodationTypeById = async (
  id: string,
): Promise<AccommodationType> => {
  const { data, error } = await supabase
    .from("accommodation_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};
