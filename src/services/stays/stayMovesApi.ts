import { supabase } from "@/config/supabase";
import { RoomHistory } from "@/types";

export interface MoveStayParams {
  stayId: string;
  currentRoomId: string;
  newRoomId: string;
  newCheckInDate: string;
  newCheckOutDate: string;
  moveDate: string;
  employeeId: string;
  observation?: string;
  stayStatusId: string;
}

export interface ConflictingStay {
  id: string;
  order_number: number;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  room?: {
    id: string;
    room_number: string;
  };
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflictingStays?: ConflictingStay[];
}

export const checkRoomAvailability = async (
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeStayId?: string,
): Promise<AvailabilityCheckResult> => {
  let query = supabase
    .from("stays")
    .select(
      `id, order_number, check_in_date, check_out_date,
      guest:guests!stays_guest_id_fkey(first_name, last_name),
      room:rooms(id, room_number)`,
    )
    .eq("room_id", roomId)
    .eq("cancelled", false)
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate);

  if (excludeStayId) {
    query = query.neq("id", excludeStayId);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (data && data.length > 0) {
    return {
      available: false,
      conflictingStays: data.map((stay: any) => ({
        id: stay.id,
        order_number: stay.order_number,
        check_in_date: stay.check_in_date,
        check_out_date: stay.check_out_date,
        guest_name: stay.guest
          ? `${stay.guest.first_name} ${stay.guest.last_name}`
          : "Sin huésped",
        room: stay.room
          ? {
              id: stay.room.id,
              room_number: stay.room.room_number,
            }
          : undefined,
      })),
    };
  }

  return { available: true };
};

export const moveStay = async (params: MoveStayParams): Promise<void> => {
  const {
    stayId,
    currentRoomId,
    newRoomId,
    newCheckInDate,
    newCheckOutDate,
    moveDate,
    employeeId,
    observation,
  } = params;

  const isRoomChange = currentRoomId !== newRoomId;

  // Validar que los IDs de habitación no estén vacíos
  if (!currentRoomId || !newRoomId) {
    throw new Error("Los IDs de habitación son requeridos");
  }

  const { data: currentRoomStatus } = await supabase
    .from("rooms")
    .select("room_number")
    .eq("id", currentRoomId)
    .single();

  const { data: newRoomStatus } = await supabase
    .from("rooms")
    .select("room_number")
    .eq("id", newRoomId)
    .single();

  const { data: availableStatus } = await supabase
    .from("room_statuses")
    .select("id")
    .eq("name", "Disponible")
    .single();

  const { data: reservedStatus } = await supabase
    .from("room_statuses")
    .select("id")
    .eq("name", "Reservado")
    .single();

  const { data: occupiedStatus } = await supabase
    .from("room_statuses")
    .select("id")
    .eq("name", "Ocupado")
    .single();

  const { data: stay } = await supabase
    .from("stays")
    .select("status, check_in_date")
    .eq("id", stayId)
    .single();

  const isStayActive = stay?.status === "Active";

  const targetStatusId = isStayActive ? occupiedStatus?.id : reservedStatus?.id;

  const { error: updateStayError } = await supabase
    .from("stays")
    .update({
      room_id: newRoomId,
      check_in_date: newCheckInDate,
      check_out_date: newCheckOutDate,
      room_status_id: targetStatusId,
    })
    .eq("id", stayId);

  if (updateStayError) throw updateStayError;

  if (isRoomChange) {
    const historyRecordOldRoom: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: currentRoomId,
      stay_id: stayId,
      previous_status_id: reservedStatus?.id,
      new_status_id: availableStatus?.id,
      employee_id: employeeId,
      action_type: "CAMBIO HABITACION",
      observation: `Movimiento de reserva a habitación ${newRoomStatus.room_number}. Fecha del movimiento: ${moveDate} | ${observation}`,
    };

    const { error: historyOldError } = await supabase
      .from("room_history")
      .insert(historyRecordOldRoom);

    if (historyOldError) throw historyOldError;

    const historyRecordNewRoom: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: newRoomId,
      stay_id: stayId,
      previous_status_id: availableStatus?.id,
      new_status_id: targetStatusId,
      employee_id: employeeId,
      action_type: "CAMBIO HABITACION",
      observation: `Reserva recibida desde habitación ${currentRoomStatus.room_number}. Fecha del movimiento: ${moveDate}. Nuevas fechas: ${newCheckInDate} a ${newCheckOutDate} | ${observation}`,
    };

    const { error: historyNewError } = await supabase
      .from("room_history")
      .insert(historyRecordNewRoom);

    if (historyNewError) throw historyNewError;
  } else {
    const historyRecord: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: newRoomId,
      stay_id: stayId,
      previous_status_id: reservedStatus.id,
      new_status_id: targetStatusId,
      employee_id: employeeId,
      action_type: "CAMBIO FECHAS",
      observation: `Cambio de fechas de la reserva. Fecha del movimiento: ${moveDate}. Nuevas fechas: ${newCheckInDate} a ${newCheckOutDate} | ${observation}`,
    };

    const { error: historyError } = await supabase
      .from("room_history")
      .insert(historyRecord);

    if (historyError) throw historyError;
  }
};
