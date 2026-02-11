import { supabase } from "@/config/supabase";
import { RoomRate } from "@/types";

export const roomRatesApi = {
  fetchByRoomId: async (roomId: string): Promise<RoomRate[]> => {
    const { data, error } = await supabase
      .from("room_rates")
      .select("*")
      .eq("room_id", roomId)
      .order("person_count", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },
};
