import { useQuery } from '@tanstack/react-query';
import { roomStatusesApi } from '@/services/room-statuses/roomStatusesApi';
import { RoomStatus } from '@/types';

export const useRoomStatuses = () => {
  const fetchAll = useQuery({
    queryKey: ['room_statuses'],
    queryFn: () => roomStatusesApi.fetchAll(),
    staleTime: 1000 * 60 * 30,
  });

  return {
    fetchAll,
  };
};