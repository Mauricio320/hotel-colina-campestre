import { supabase } from '@/config/supabase';
import { RoomStatus } from '@/types';

export const roomStatusesApi = {
  fetchAll: async (): Promise<RoomStatus[]> => {
    const { data, error } = await supabase
      .from('room_statuses')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }
};