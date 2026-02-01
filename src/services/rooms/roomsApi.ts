import { supabase } from "@/config/supabase";
import { Room } from "@/types";
import dayjs from "dayjs";

export const roomsApi = {
  updateStatus: async (
    roomId: string,
    statusId: string,
    selectedDate: Date,
  ): Promise<Room> => {
    const { data, error } = await supabase
      .from("rooms")
      .update({
        status_id: statusId,
        status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
      })
      .eq("id", roomId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const fetchRoomById = async (id: string): Promise<Room> => {
  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
        *,
        room_statuses(name, color)
      `,
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
};
