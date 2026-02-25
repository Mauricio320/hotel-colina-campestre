import { supabase } from "@/config/supabase";
import { RoomStatus } from "@/types";

export const roomStatusesApi = {
  fetchAll: async (): Promise<RoomStatus[]> => {
    const { data, error } = await supabase.from("room_statuses").select("*");

    if (error) throw new Error(error.message);
    return data || [];
  },

  getStatusByName: async (name: string): Promise<RoomStatus> => {
    const { data, error } = await supabase
      .from("room_statuses")
      .select("id")
      .eq("name", name)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error(`Status '${name}' not found`);
    return data;
  },
};
