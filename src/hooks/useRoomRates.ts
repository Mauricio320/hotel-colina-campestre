import { useQuery } from "@tanstack/react-query";
import { roomRatesApi } from "@/services/room-rates/roomRatesApi";
import { RoomRate } from "@/types";

export const useRoomRates = (roomId: string | null) => {
  return useQuery<RoomRate[]>({
    queryKey: ["room-rates", roomId],
    queryFn: () => roomRatesApi.fetchByRoomId(roomId!),
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
  });
};
