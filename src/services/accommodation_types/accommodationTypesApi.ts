import { supabase } from '@/config/supabase';
import { AccommodationType } from '@/types';

export const accommodationTypesApi = {
  fetchAll: async (): Promise<AccommodationType[]> => {
    const { data, error } = await supabase
      .from('accommodation_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
};