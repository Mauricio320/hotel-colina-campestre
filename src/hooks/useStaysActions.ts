import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { roomHistoryApi } from '@/services/room-history/roomHistoryApi';
import { Stay, PaymentType } from '@/types';
import dayjs from 'dayjs';

interface StayPaymentRecordParams {
  stayId: string;
  amount: number;
  paymentMethodId: string;
  employeeId?: string;
  roomId?: string;
  customObservation?: string;
}

export const useStaysActions = () => {
  const queryClient = useQueryClient();

  const createStayPaymentRecord = async (params: StayPaymentRecordParams) => {
    const { data: stay, error: fetchErr } = await supabase
      .from('stays')
      .select('*, room:rooms(*)')
      .eq('id', params.stayId)
      .single();

    if (fetchErr || !stay) {
      throw new Error('No se pudo encontrar la estancia');
    }

    const todayStr = dayjs().format('YYYY-MM-DD');
    const totalPrice = stay.total_price || 0;
    const checkInDate = new Date(stay.check_in_date);

    const paymentType = params.amount >= totalPrice 
      ? (checkInDate <= new Date() ? PaymentType.ANTICIPADO_COMPLETO : PaymentType.PAGO_COMPLETO_RESERVA)
      : PaymentType.ABONO_RESERVA;

    const observation = params.customObservation ||
      `${paymentType}: ${params.amount.toLocaleString()} de ${totalPrice.toLocaleString()}`;

    const paymentData = {
      stay_id: params.stayId,
      payment_method_id: params.paymentMethodId,
      employee_id: params.employeeId || '',
      amount: params.amount,
      payment_type: paymentType,
      observation,
      payment_date: todayStr,
    };

    await supabase.from('payments').insert(paymentData);

    const { data: currentPaidAmount } = await supabase
      .from('payments')
      .select('amount')
      .eq('stay_id', params.stayId);

    const totalPaid = (currentPaidAmount || []).reduce((sum, p) => sum + Number(p.amount), 0) + params.amount;
    const pending = totalPrice - totalPaid;
    const isFullyPaid = pending <= 0;

    const newStatus = isFullyPaid && stay.check_in_date <= todayStr ? 'Active' : stay.status;

    const { error: updateStayErr } = await supabase
      .from('stays')
      .update({
        paid_amount: totalPaid,
        status: newStatus,
      })
      .eq('id', params.stayId);

    if (updateStayErr) throw updateStayErr;

    if (params.roomId && params.employeeId) {
      const { data: currentRoomStatus } = await supabase
        .from('rooms')
        .select('status_id')
        .eq('id', params.roomId)
        .single();

      await roomHistoryApi.createRecord({
        room_id: params.roomId,
        stay_id: params.stayId,
        previous_status_id: currentRoomStatus?.status_id,
        new_status_id: currentRoomStatus?.status_id,
        employee_id: params.employeeId,
        action_type: paymentType === PaymentType.ABONO_RESERVA
          ? 'ABONO-RESERVA'
          : 'PAGO-COMPLETO-RESERVA',
        observation: observation || `${paymentType}: ${params.amount.toLocaleString()} de ${totalPrice.toLocaleString()}`,
      });
    }

    return {
      isFullyPaid,
      paymentType,
      newPaidAmount: totalPaid,
      pendingAmount: pending,
    };
  };

  const registerPayment = useMutation({
    mutationFn: createStayPaymentRecord,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({
        queryKey: ['payments', 'summary', variables.stayId],
      });
    },
  });

  const registerCheckInReserva = useMutation({
    mutationFn: async ({
      stayId,
      employeeId,
      roomId,
      previous_status_id,
    }: {
      stayId: string;
      employeeId?: string;
      roomId: string;
      previous_status_id: string;
    }) => {
      const { error: stayUpdateError } = await supabase
        .from('stays')
        .update({ status: 'Active' })
        .eq('id', stayId);

      if (stayUpdateError) throw stayUpdateError;

      const { data: occupiedStatus } = await supabase
        .from('room_statuses')
        .select('id')
        .eq('name', 'Ocupado')
        .single();

      if (!occupiedStatus) {
        throw new Error('Estado Ocupado no encontrado');
      }

      await supabase.from('room_history').insert({
        room_id: roomId,
        stay_id: stayId,
        previous_status_id,
        new_status_id: occupiedStatus.id,
        employee_id: employeeId || '',
        action_type: 'RESERVA CHECK IN',
        observation: 'Check-in de reserva realizado',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stays'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room_history'] });
    },
  });

  return {
    registerPayment,
    registerCheckInReserva,
  };
};