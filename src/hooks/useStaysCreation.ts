import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { roomHistoryApi } from '@/services/room-history/roomHistoryApi';
import { roomsApi } from '@/services/rooms/roomsApi';
import { Stay } from '@/types';
import dayjs from 'dayjs';

interface CreateStayParams {
  room_id: string;
  guest_id: string;
  employee_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  observation?: string;
}

interface StayPaymentParams {
  stayData: CreateStayParams;
  paymentData: {
    amount: number;
    payment_method_id: string;
    employee_id?: string;
    context?: 'reservation' | 'checkin_direct';
    customObservation?: string;
  };
}

export const useStaysCreation = () => {
  const queryClient = useQueryClient();

  const createStay = useMutation({
    mutationFn: async (stayData: CreateStayParams) => {
      const { data: availableStatus } = await supabase
        .from('room_statuses')
        .select('id')
        .eq('name', 'Disponible')
        .single();

      const todayStr = dayjs().format('YYYY-MM-DD');

      const { data: currentStay } = await supabase
        .from('stays')
        .select('id')
        .eq('room_id', stayData.room_id)
        .eq('status', 'Active')
        .lte('check_in_date', todayStr)
        .gte('check_out_date', todayStr)
        .maybeSingle();

      const { data: roomBefore } = await supabase
        .from('rooms')
        .select('status_id')
        .eq('id', stayData.room_id)
        .single();

      const effectivePrevStatusId = currentStay
        ? roomBefore?.status_id
        : availableStatus?.id || roomBefore?.status_id;

      const { data: stay, error: stayError } = await supabase
        .from('stays')
        .insert(stayData)
        .select()
        .single();

      if (stayError) throw stayError;

      const statusName = stayData.status === 'Active' ? 'Ocupado' : 'Reservado';
      const { data: statusData } = await supabase
        .from('room_statuses')
        .select('id')
        .eq('name', statusName)
        .single();

      if (statusData) {
        const shouldUpdateRoom = stayData.check_in_date === todayStr || stayData.status === 'Active';

        if (shouldUpdateRoom) {
          await roomsApi.updateStatus(stayData.room_id, statusData.id, new Date());
        }

        await roomHistoryApi.createRecord({
          room_id: stayData.room_id,
          stay_id: stay.id,
          previous_status_id: effectivePrevStatusId,
          new_status_id: statusData.id,
          employee_id: stayData.employee_id,
          action_type: stayData.status === 'Active' ? 'CHECK-IN' : 'RESERVA',
          observation: stayData.observation || `Registro de ${statusName} desde Calendario`,
        });
      }

      return stay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
    },
  });

  return {
    createStay,
  };
};