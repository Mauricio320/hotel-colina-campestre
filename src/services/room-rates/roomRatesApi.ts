import { supabase } from "@/config/supabase";
import { BulkRateUpdate, Room, RoomRate } from "@/types";

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

  fetchByCategory: async (category: string): Promise<Room[]> => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*, rates:room_rates(*)")
      .eq("category", category)
      .eq("is_active", true)
      .order("room_number");

    if (error) throw new Error(error.message);
    return data || [];
  },

  updateRate: async (rateId: string, newRate: number): Promise<void> => {
    const { error } = await supabase.from("room_rates").update({ rate: newRate }).eq("id", rateId);

    if (error) throw new Error(error.message);
  },

  bulkUpdateRates: async (updates: BulkRateUpdate[]): Promise<void> => {
    for (const update of updates) {
      const { error } = await supabase
        .from("room_rates")
        .update({ rate: update.new_rate })
        .eq("id", update.rate_id);

      if (error) throw new Error(error.message);
    }
  },
};
