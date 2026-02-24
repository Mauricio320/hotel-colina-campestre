import { supabase } from "@/config/supabase";

export const deleteRoomRate = async (roomId: string, personCount: number): Promise<void> => {
  const { error } = await supabase
    .from("room_rates")
    .delete()
    .eq("room_id", roomId)
    .eq("person_count", personCount);

  if (error) throw error;
};
