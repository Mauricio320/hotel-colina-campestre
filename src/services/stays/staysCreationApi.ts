import { supabase } from "@/config/supabase";
import { roomsApi } from "@/services/rooms/roomsApi";
import { roomHistoryApi } from "@/services/room-history/roomHistoryApi";
import { roomStatusesApi } from "@/services/room-statuses/roomStatusesApi";
import { Stay, PaymentType } from "@/types";
import dayjs from "dayjs";

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

export const staysCreationApi = {
  createStay: async (stayData: CreateStayParams): Promise<Stay> => {
    const availableStatus = await roomStatusesApi.getStatusByName("Disponible");
    const todayStr = dayjs().format("YYYY-MM-DD");

    const { data: currentStay } = await supabase
      .from("stays")
      .select("id")
      .eq("room_id", stayData.room_id)
      .eq("status", "Active")
      .lte("check_in_date", todayStr)
      .gte("check_out_date", todayStr)
      .maybeSingle();

    const { data: roomBefore } = await supabase
      .from("rooms")
      .select("status_id")
      .eq("id", stayData.room_id)
      .single();

    const effectivePrevStatusId = currentStay
      ? roomBefore?.status_id
      : availableStatus?.id || roomBefore?.status_id;

    const { data: stay, error: stayError } = await supabase
      .from("stays")
      .insert(stayData)
      .select()
      .single();

    if (stayError) throw stayError;

    const statusName = stayData.status === "Active" ? "Ocupado" : "Reservado";
    const statusData = await roomStatusesApi.getStatusByName(statusName);

    if (statusData) {
      const shouldUpdateRoom =
        stayData.check_in_date === todayStr || stayData.status === "Active";

      if (shouldUpdateRoom) {
        await roomsApi.updateStatus(stayData.room_id, statusData.id, new Date());
      }

      await roomHistoryApi.createRecord({
        room_id: stayData.room_id,
        stay_id: stay.id,
        previous_status_id: effectivePrevStatusId,
        new_status_id: statusData.id,
        employee_id: stayData.employee_id,
        action_type: stayData.status === "Active" ? "CHECK-IN" : "RESERVA",
        observation: stayData.observation || `Registro de ${statusName} desde Calendario`,
      });
    }

    return stay;
  },

  performCheckIn: async (params: {
    stay?: Stay;
    roomId: string;
    employeeId: string;
    observation?: string;
    selectedDate: Date;
  }): Promise<{ success: boolean }> => {
    const occupiedStatus = await roomStatusesApi.getStatusByName("Ocupado");

    const { data: currentRoom } = await supabase
      .from("rooms")
      .select("status_id")
      .eq("id", params.roomId)
      .single();

    const promises: Promise<any>[] = [];

    if (params.stay) {
      promises.push(
        supabase.from("stays").update({ status: "Active" }).eq("id", params.stay.id)
      );
    }

    promises.push(roomsApi.updateStatus(params.roomId, occupiedStatus.id, params.selectedDate));

    await Promise.all(promises);

    await roomHistoryApi.createRecord({
      room_id: params.roomId,
      stay_id: params.stay?.id,
      previous_status_id: currentRoom.data?.status_id,
      new_status_id: occupiedStatus.id,
      employee_id: params.employeeId,
      action_type: params.stay ? "CHECK-IN-RESERVA" : "CHECK-IN-DIRECTO",
      observation: params.observation || "Check-in sin observación",
    });

    return { success: true };
  },

  createStayPaymentRecord: async (params: {
    stayId: string;
    amount: number;
    paymentMethodId: string;
    employeeId?: string;
    roomId?: string;
    customObservation?: string;
  }): Promise<{
    isFullyPaid: boolean;
    paymentType: PaymentType;
    newPaidAmount: number;
    pendingAmount: number;
  }> => {
    const { stayId, amount, paymentMethodId, employeeId, roomId, customObservation } = params;

    const { data: stay, error: fetchErr } = await supabase
      .from("stays")
      .select("*, room:rooms(*)")
      .eq("id", stayId)
      .single();

    if (fetchErr || !stay) {
      throw new Error("No se pudo encontrar la estancia");
    }

    const todayStr = dayjs().format("YYYY-MM-DD");
    const totalPrice = stay.total_price || 0;
    const checkInDate = new Date(stay.check_in_date);

    const paymentType =
      amount >= totalPrice
        ? checkInDate <= new Date()
          ? PaymentType.ANTICIPADO_COMPLETO
          : PaymentType.PAGO_COMPLETO_RESERVA
        : PaymentType.ABONO_RESERVA;

    const observation =
      customObservation ||
      `${paymentType}: ${amount.toLocaleString()} de ${totalPrice.toLocaleString()}`;

    const paymentData = {
      stay_id: stayId,
      payment_method_id: paymentMethodId,
      employee_id: employeeId || "",
      amount,
      payment_type: paymentType,
      observation,
      payment_date: todayStr,
    };

    await supabase.from("payments").insert(paymentData);

    const { data: currentPaidAmount } = await supabase
      .from("payments")
      .select("amount")
      .eq("stay_id", stayId);

    const totalPaid =
      (currentPaidAmount || []).reduce((sum, p) => sum + Number(p.amount), 0) + amount;
    const pending = totalPrice - totalPaid;
    const isFullyPaid = pending <= 0;

    const newStatus = isFullyPaid && stay.check_in_date <= todayStr ? "Active" : stay.status;

    const { error: updateStayErr } = await supabase
      .from("stays")
      .update({
        paid_amount: totalPaid,
        status: newStatus,
      })
      .eq("id", stayId);

    if (updateStayErr) throw updateStayErr;

    if (roomId && employeeId) {
      const { data: currentRoomStatus } = await supabase
        .from("rooms")
        .select("status_id")
        .eq("id", roomId)
        .single();

      await roomHistoryApi.createRecord({
        room_id: roomId,
        stay_id: stayId,
        previous_status_id: currentRoomStatus?.status_id,
        new_status_id: currentRoomStatus?.status_id,
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
      newPaidAmount: totalPaid,
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

    const { error: stayUpdateError } = await supabase
      .from("stays")
      .update({ status: "Active" })
      .eq("id", stayId);

    if (stayUpdateError) throw stayUpdateError;

    const occupiedStatus = await roomStatusesApi.getStatusByName("Ocupado");

    if (!occupiedStatus) {
      throw new Error("Estado Ocupado no encontrado");
    }

    await supabase.from("room_history").insert({
      room_id: roomId,
      stay_id: stayId,
      previous_status_id,
      new_status_id: occupiedStatus.id,
      employee_id: employeeId || "",
      action_type: "RESERVA CHECK IN",
      observation: "Check-in de reserva realizado",
    });
  },
};
