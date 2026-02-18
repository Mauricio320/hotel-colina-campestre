import { useQuery } from "@tanstack/react-query";
import { roomRateHistoryApi } from "@/services/room-rates/roomRateHistoryApi";
import { RoomRateHistory } from "@/types";

export const useRoomRateHistory = (roomId?: string | null) => {
  return useQuery<RoomRateHistory[]>({
    queryKey: ["room-rate-history", roomId],
    queryFn: () =>
      roomId
        ? roomRateHistoryApi.fetchByRoomId(roomId)
        : roomRateHistoryApi.fetchAll(),
    staleTime: 1000 * 60 * 5,
  });
};
