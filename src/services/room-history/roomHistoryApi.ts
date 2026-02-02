import { supabase } from "@/config/supabase";
import { RoomHistory } from "@/types";

export const roomHistoryApi = {
  createRecord: async (
    record: Omit<RoomHistory, "id" | "timestamp">,
  ): Promise<RoomHistory> => {
    const { data, error } = await supabase
      .from("room_history")
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const CreateRoomHistory = async (
  record: Omit<RoomHistory, "id" | "timestamp">,
): Promise<RoomHistory> => {
  return supabase
    .from("room_history")
    .insert(record)
    .select()
    .single() as unknown as Promise<RoomHistory>;
};
