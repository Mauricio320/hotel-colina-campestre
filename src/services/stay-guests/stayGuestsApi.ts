import { supabase } from "@/config/supabase";
import { StayGuest } from "@/types";

export const stayGuestsApi = {
  addMultipleGuests: async (stayId: string, guests: { guest_id: string; is_primary_guest: boolean }[]) => {
    const data = guests.map(g => ({ stay_id: stayId, ...g }));
    const { data: result, error } = await supabase
      .from('stay_guests')
      .insert(data)
      .select();
    if (error) throw error;
    return result;
  },

  fetchStayGuests: async (stayId: string): Promise<StayGuest[]> => {
    const { data, error } = await supabase
      .from('stay_guests')
      .select('*, guests(*)')
      .eq('stay_id', stayId);
    if (error) throw error;
    return data || [];
  }
};