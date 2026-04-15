import { supabase } from "@/config/supabase";
import { roomStatusesApi } from "@/services/room-statuses/roomStatusesApi";
import { paymentApi, paymentHelpers } from "@/services/payment/paymentApi";
import { CreatePaymentDto, PaymentType, Stay } from "@/types";
import dayjs from "dayjs";

export interface RegisterPaymentParams {
  stayId: string;
  amount: number;
  paymentMethodId: string;
  employeeId?: string;
  roomId?: string;
  customObservation?: string;
  status_id?: string;
}

export interface RegisterPaymentResult {
  isFullyPaid: boolean;
  paymentType: PaymentType;
  newPaidAmount: number;
  pendingAmount: number;
}

export const staysActionsApi = {
  registerPayment: async (params: RegisterPaymentParams): Promise<RegisterPaymentResult> => {
    const { stayId, amount, paymentMethodId, employeeId, roomId, customObservation, status_id } =
      params;

    const { data: stay, error: fetchErr } = await supabase
      .from("stays")
      .select("*, room:rooms(*)")
      .eq("id", stayId)
      .single();

    if (fetchErr || !stay) throw new Error("No se pudo encontrar la estancia");

    const todayStr = dayjs().format("YYYY-MM-DD");
    const totalPrice = stay.total_price || 0;
    const checkInDate = new Date(stay.check_in_date);

    const paymentType = paymentHelpers.determinePaymentType(
      amount,
      totalPrice,
      "calendar_payment",
      checkInDate
    );

    const observation =
      customObservation || paymentHelpers.generateObservation(paymentType, amount, totalPrice);

    const paymentData: CreatePaymentDto = {
      stay_id: stayId,
      payment_method_id: paymentMethodId,
      employee_id: employeeId || "",
      amount,
      payment_type: paymentType,
      observation,
    };

    await paymentApi.createPayment(paymentData);

    const currentPaidAmount = await paymentApi.getStayPaymentSummary(stayId);
    const newPaidAmount = currentPaidAmount.totalPaid + amount;
    const pending = totalPrice - newPaidAmount;
    const isFullyPaid = pending <= 0;

    const { error: updateStayErr } = await supabase
      .from("stays")
      .update({
        paid_amount: newPaidAmount,
        status: isFullyPaid && stay.check_in_date <= todayStr ? "Active" : stay.status,
      })
      .eq("id", stayId);

    if (updateStayErr) throw updateStayErr;

    if (roomId && employeeId) {
      const { data: currentRoomStatus } = await supabase
        .from("rooms")
        .select("status_id")
        .eq("id", roomId)
        .single();

      const { data: reservedStatus } = await supabase
        .from("room_statuses")
        .select("id")
        .eq("name", "Reserved")
        .single();

      await supabase.from("room_history").insert({
        room_id: roomId,
        stay_id: stayId,
        previous_status_id: status_id || currentRoomStatus?.status_id || reservedStatus?.id,
        new_status_id: status_id || currentRoomStatus?.status_id || reservedStatus?.id,
        employee_id: employeeId,
        action_type:
          paymentType === PaymentType.ABONO_RESERVA ? "ABONO-RESERVA" : "PAGO-COMPLETO-RESERVA",
        observation:
          observation ||
          `${paymentType}: ${amount.toLocaleString()} de ${totalPrice.toLocaleString()}`,
      });
    }

    return {
      isFullyPaid,
      paymentType,
      newPaidAmount,
      pendingAmount: pending,
    };
  },

  registerCheckInReserva: async (params: {
    stayId: string;
    employeeId?: string;
    roomId: string;
    previous_status_id: string;
  }): Promise<void> => {
    const { stayId, employeeId, roomId, previous_status_id } = params;

    const { error: updateError } = await supabase
      .from("stays")
      .update({ status: "Active" })
      .eq("id", stayId);

    if (updateError) throw updateError;

    const occupiedStatus = await roomStatusesApi.getStatusByName("Ocupado");

    await supabase.from("room_history").insert({
      observation: `Check-in de reserva realizado`,
      previous_status_id: previous_status_id,
      new_status_id: occupiedStatus?.id,
      action_type: "RESERVA CHECK IN",
      employee_id: employeeId,
      room_id: roomId,
      stay_id: stayId,
    });
  },

  createStayWithPayment: async (data: {
    stayData: any;
    paymentData: {
      amount: number;
      payment_method_id: string;
      employee_id?: string;
      context?: "reservation" | "checkin_direct";
      customObservation?: string;
    };
  }): Promise<{ stay: Stay; paymentType: PaymentType }> => {
    const paymentType = paymentHelpers.determinePaymentType(
      data.paymentData.amount,
      data.stayData.total_price || 0,
      data.paymentData.context || "reservation",
      data.stayData.check_in_date ? new Date(data.stayData.check_in_date) : undefined
    );

    const observation =
      data.paymentData.customObservation ||
      paymentHelpers.generateObservation(
        paymentType,
        data.paymentData.amount,
        data.stayData.total_price || 0
      );

    const statusName = data.stayData.status === "Active" ? "Ocupado" : "Reservado";
    const statusData = await roomStatusesApi.getStatusByName(statusName);

    const { data: stay, error: stayError } = await supabase
      .from("stays")
      .insert({
        ...data.stayData,
        room_status_id: statusData?.id,
      })
      .select()
      .single();

    if (stayError) throw stayError;

    const paymentData: CreatePaymentDto = {
      stay_id: stay.id,
      payment_method_id: data.paymentData.payment_method_id,
      employee_id: data.paymentData.employee_id || "",
      amount: data.paymentData.amount,
      payment_type: paymentType,
      observation,
    };

    await paymentApi.createPayment(paymentData);

    const todayStr = dayjs().format("YYYY-MM-DD");
    const isRoomStay = !!data.stayData.room_id;
    const accommodationId = data.stayData.room_id || data.stayData.accommodation_type_id;

    if (statusData && accommodationId) {
      if (isRoomStay) {
        const shouldUpdateRoomStatus =
          data.stayData.check_in_date === todayStr || data.stayData.status === "Active";

        if (shouldUpdateRoomStatus) {
          await supabase
            .from("rooms")
            .update({
              status_id: statusData.id,
              status_date: todayStr,
            })
            .eq("id", accommodationId);
        }
      }

      const availableStatus = await roomStatusesApi.getStatusByName("Disponible");

      let previousStatusId = availableStatus?.id;
      if (isRoomStay) {
        const { data: currentRoomStatus } = await supabase
          .from("rooms")
          .select("status_id")
          .eq("id", accommodationId)
          .single();
        if (currentRoomStatus) previousStatusId = currentRoomStatus.status_id;
      }

      await supabase.from("room_history").insert({
        room_id: isRoomStay ? accommodationId : null,
        accommodation_type_id: isRoomStay ? null : accommodationId,
        stay_id: stay.id,
        previous_status_id: previousStatusId,
        new_status_id: statusData.id,
        employee_id: data.paymentData.employee_id,
        action_type: paymentType === PaymentType.PAGO_CHECKIN_DIRECTO ? "CHECK-IN" : "RESERVA",
        observation: observation || `Registro de ${statusName} con pago`,
      });
    }

    return { stay, paymentType };
  },

  updateStay: async (id: string, updates: Partial<Stay>): Promise<Stay> => {
    const { data, error } = await supabase
      .from("stays")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  performCheckOut: async (params: {
    stayId: string;
    observation: string;
    finalPayment: number;
    employeeId?: string;
    roomId?: string;
    accommodationTypeId?: string;
  }): Promise<void> => {
    const { stayId, observation, finalPayment, employeeId, roomId, accommodationTypeId } = params;

    const disponibleStatus = await roomStatusesApi.getStatusByName("Disponible");
    const occupiedStatus = await roomStatusesApi.getStatusByName("Ocupado");

    const { error: stayError } = await supabase
      .from("stays")
      .update({
        status: "Completed",
        observation,
        active: false,
      })
      .eq("id", stayId);

    if (stayError) throw stayError;

    const finalObservation =
      `Check-out realizado${finalPayment > 0 ? ". Pago final: $" + finalPayment.toLocaleString() : ""}${observation ? ". " + observation : ""}`.trim();

    const keyId = accommodationTypeId
      ? { accommodation_type_id: accommodationTypeId }
      : { room_id: roomId };

    const { error: historyError } = await supabase.from("room_history").insert({
      ...keyId,
      stay_id: stayId,
      previous_status_id: occupiedStatus.id,
      new_status_id: disponibleStatus.id,
      action_type: "CHECK-OUT",
      observation: finalObservation,
      employee_id: employeeId,
    });

    if (historyError) throw historyError;
  },
};
