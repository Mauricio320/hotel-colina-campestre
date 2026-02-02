import { supabase } from '@/config/supabase';
import { Guest } from '@/types';

export const guestApi = {
  fetchAll: async (): Promise<Guest[]> => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('last_name');
    if (error) throw error;
    return data || [];
  },

  findByDocNumber: async (docNumber: string): Promise<Guest | null> => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('doc_number', docNumber)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  upsert: async (guestData: Partial<Guest>): Promise<Guest> => {
    const { data, error } = await supabase
      .from('guests')
      .upsert(guestData, { onConflict: 'doc_number' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};