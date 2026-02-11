import { useQuery } from "@tanstack/react-query";
import { stayGuestsApi } from "@/services/stay-guests/stayGuestsApi";
import { StayGuest } from "@/types";

export const useStayGuests = (stayId: string | null) => {
  return useQuery<StayGuest[]>({
    queryKey: ['stay-guests', stayId],
    queryFn: () => stayGuestsApi.fetchStayGuests(stayId!),
    enabled: !!stayId,
    staleTime: 1000 * 60 * 5,
  });
};