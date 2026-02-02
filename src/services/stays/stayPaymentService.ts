import { paymentApi, paymentHelpers } from '@/services/payment/paymentApi';
import { roomHistoryApi } from '@/services/room-history/roomHistoryApi';
import { supabase } from '@/config/supabase';
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

export const useStayPaymentService = () => {
  const createStayPaymentRecord = async (params: StayPaymentRecordParams) => {
    const stay = await getStayDetails(params.stayId);
    const totalPrice = stay.total_price || 0;
    const checkInDate = new Date(stay.check_in_date);

    const paymentType = paymentHelpers.determinePaymentType(
      params.amount,
      totalPrice,
      'calendar_payment',
      checkInDate,
    );

    const observation = params.customObservation ||
      paymentHelpers.generateObservation(paymentType, params.amount, totalPrice);

    await paymentApi.createPayment({
      stay_id: params.stayId,
      payment_method_id: params.paymentMethodId,
      employee_id: params.employeeId || '',
      amount: params.amount,
      payment_type: paymentType,
      observation,
    });

    const paymentSummary = await paymentApi.getStayPaymentSummary(params.stayId);
    const newPaidAmount = paymentSummary.totalPaid + params.amount;
    const pending = totalPrice - newPaidAmount;
    const isFullyPaid = pending <= 0;

    await updateStayPaymentStatus(params.stayId, newPaidAmount, stay, isFullyPaid);

    if (params.roomId && params.employeeId) {
      await createPaymentHistoryRecord(params, paymentType, observation, totalPrice);
    }

    return {
      isFullyPaid,
      paymentType,
      newPaidAmount,
      pendingAmount: pending,
    };
  };

  const getStayDetails = async (stayId: string) => {
    const { data: stay, error: fetchErr } = await supabase
      .from('stays')
      .select('*, room:rooms(*)')
      .eq('id', stayId)
      .single();

    if (fetchErr || !stay) {
      throw new Error('No se pudo encontrar la estancia');
    }

    return stay;
  };

  const updateStayPaymentStatus = async (stayId: string, newPaidAmount: number, stay: any, isFullyPaid: boolean) => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const newStatus = isFullyPaid && stay.check_in_date <= todayStr ? 'Active' : stay.status;

    const { error: updateStayErr } = await supabase
      .from('stays')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq('id', stayId);

    if (updateStayErr) throw updateStayErr;
  };

  const createPaymentHistoryRecord = async (params: StayPaymentRecordParams, paymentType: PaymentType, observation: string, totalPrice: number) => {
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
  };

  return {
    createStayPaymentRecord,
  };
};