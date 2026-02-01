
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestApi } from '@/services/guests/guestApi';
import { Guest } from '@/types';

export const useGuests = () => {
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ['guests'],
    queryFn: () => guestApi.fetchAll(),
    staleTime: 1000 * 60 * 5
  });

  const findGuestByDoc = async (docNumber: string) => {
    return guestApi.findByDocNumber(docNumber);
  };

  const upsertGuest = useMutation({
    mutationFn: (guestData: Partial<Guest>) => {
      return guestApi.upsert(guestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  return { guestsQuery, findGuestByDoc, upsertGuest };
};
