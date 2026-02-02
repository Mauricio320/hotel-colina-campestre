import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomHistoryApi } from '@/services/room-history/roomHistoryApi';
import { RoomHistory } from '@/types';

export const useRoomHistory = () => {
  const queryClient = useQueryClient();

  const createRecord = useMutation({
    mutationFn: (record: Omit<RoomHistory, 'id' | 'timestamp'>) =>
      roomHistoryApi.createRecord(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  return {
    createRecord,
  };
};