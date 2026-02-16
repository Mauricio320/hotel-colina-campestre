import { supabase } from "@/config/supabase";
import { RoomRateHistory } from "@/types";

export interface RoomRateHistoryInsert {
  room_id: string;
  person_count: number;
  old_rate: number;
  new_rate: number;
  employee_id: string;
}

export const roomRateHistoryApi = {
  create: async (historyData: RoomRateHistoryInsert[]): Promise<void> => {
    const { error } = await supabase
      .from("room_rate_history")
      .insert(historyData);

    if (error) throw new Error(error.message);
  },

  fetchByRoomId: async (roomId: string): Promise<RoomRateHistory[]> => {
    const { data, error } = await supabase
      .from("room_rate_history")
      .select("*, room:rooms(*), employee:employees(*)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  fetchAll: async (): Promise<RoomRateHistory[]> => {
    const { data, error } = await supabase
      .from("room_rate_history")
      .select("*, room:rooms(*), employee:employees(*)")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },
};
