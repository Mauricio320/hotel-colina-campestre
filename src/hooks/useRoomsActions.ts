import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/services/rooms/roomsApi';
import { useRoomHistory } from '@/hooks/useRoomHistory';
import { Room } from '@/types';

export const useRoomsActions = () => {
  const queryClient = useQueryClient();
  const { createRecord } = useRoomHistory();

  const updateRoomStatus = useMutation({
    mutationFn: ({ 
      roomId, 
      statusId, 
      selectedDate, 
      employeeId, 
      actionType, 
      observation,
      previousStatusId 
    }: {
      roomId: string;
      statusId: string;
      selectedDate: Date;
      employeeId: string;
      actionType: string;
      observation?: string;
      previousStatusId?: string;
    }) => roomsApi.updateStatus(roomId, statusId, selectedDate),
    onSuccess: async (data, variables) => {
      await createRecord.mutateAsync({
        room_id: variables.roomId,
        previous_status_id: variables.previousStatusId,
        new_status_id: variables.statusId,
        employee_id: variables.employeeId,
        action_type: variables.actionType,
        observation: variables.observation,
      });

      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  return {
    updateRoomStatus,
  };
};