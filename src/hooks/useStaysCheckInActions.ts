import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { roomsApi } from '@/services/rooms/roomsApi';
import { roomHistoryApi } from '@/services/room-history/roomHistoryApi';
import { Stay } from '@/types';
import dayjs from 'dayjs';

interface CheckInParams {
  stay?: Stay;
  roomId: string;
  employeeId: string;
  observation?: string;
  selectedDate: Date;
}

export const useStaysCheckInActions = () => {
  const queryClient = useQueryClient();

  const performCheckIn = useMutation({
    mutationFn: async (params: CheckInParams) => {
      const occupiedStatus = await supabase
        .from('room_statuses')
        .select('id')
        .eq('name', 'Ocupado')
        .single();

      if (!occupiedStatus.data) {
        throw new Error('Estado Ocupado no encontrado');
      }

      const currentRoom = await supabase
        .from('rooms')
        .select('status_id')
        .eq('id', params.roomId)
        .single();

      const promises = [];
      
      if (params.stay) {
        promises.push(
          supabase.from('stays').update({ status: 'Active' }).eq('id', params.stay.id)
        );
      }

      promises.push(
        roomsApi.updateStatus(params.roomId, occupiedStatus.data.id, params.selectedDate)
      );

      await Promise.all(promises);

      await roomHistoryApi.createRecord({
        room_id: params.roomId,
        stay_id: params.stay?.id,
        previous_status_id: currentRoom.data?.status_id,
        new_status_id: occupiedStatus.data.id,
        employee_id: params.employeeId,
        action_type: params.stay ? 'CHECK-IN-RESERVA' : 'CHECK-IN-DIRECTO',
        observation: params.observation || 'Check-in sin observación',
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['stays'] });
    },
  });

  return {
    performCheckIn,
  };
};