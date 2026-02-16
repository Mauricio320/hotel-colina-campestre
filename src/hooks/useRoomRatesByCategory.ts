import { useQuery } from "@tanstack/react-query";
import { roomRatesApi } from "@/services/room-rates/roomRatesApi";
import { Room } from "@/types";

export const useRoomRatesByCategory = (category: string | null) => {
  return useQuery<Room[]>({
    queryKey: ["room-rates-by-category", category],
    queryFn: () => roomRatesApi.fetchByCategory(category!),
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
};
