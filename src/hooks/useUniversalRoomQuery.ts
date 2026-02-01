import { fetchAccommodationTypeById } from "@/services/accommodation_types/accommodationTypesApi";
import { fetchRoomById } from "@/services/rooms/roomsApi";
import { AccommodationTypeEnum } from "@/util/enums/status-rooms.enum";
import { useQuery } from "@tanstack/react-query";

export const useUniversalRoomQuery = (
  id: string,
  action: AccommodationTypeEnum,
) => {
  return useQuery({
    queryKey: ["accommodation_type", id, action],
    queryFn: async () => {
      if (action === AccommodationTypeEnum.APARTAMENTO) {
        return await fetchAccommodationTypeById(id);
      } else {
        return await fetchRoomById(id);
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};
