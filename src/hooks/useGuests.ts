
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { Guest } from '@/types';

export const useGuests = () => {
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('guests').select('*').order('last_name');
      if (error) throw error;
      return data as Guest[];
    },
  });

  const findGuestByDoc = async (docNumber: string) => {
    const { data, error } = await supabase.from('guests').select('*').eq('doc_number', docNumber).maybeSingle();
    if (error) throw error;
    return data as Guest | null;
  };

  const upsertGuest = useMutation({
    mutationFn: async (guestData: Partial<Guest>) => {
      const { data, error } = await supabase.from('guests').upsert(guestData, { onConflict: 'doc_number' }).select().single();
      if (error) throw error;
      return data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  return { guestsQuery, findGuestByDoc, upsertGuest };
};
