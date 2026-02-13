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

export interface AvailabilityCheckResult {
  available: boolean;
  conflictingStays?: Array<{
    id: string;
    order_number: number;
    guest_name: string;
  }>;
}

export const checkRoomAvailability = async (
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeStayId: string,
): Promise<AvailabilityCheckResult> => {
  const { data, error } = await supabase
    .from("stays")
    .select("id, order_number, guest:guests!stays_guest_id_fkey(first_name, last_name)")
    .eq("room_id", roomId)
    .eq("active", true)
    .neq("id", excludeStayId)
    .or(`status.eq.Active,status.eq.Reserved`)
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate);

  if (error) throw error;

  if (data && data.length > 0) {
    return {
      available: false,
      conflictingStays: data.map((stay: any) => ({
        id: stay.id,
        order_number: stay.order_number,
        guest_name: stay.guest
          ? `${stay.guest.first_name} ${stay.guest.last_name}`
          : "Sin huésped",
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
    stayStatusId,
  } = params;

  const isRoomChange = currentRoomId !== newRoomId;

  const availability = await checkRoomAvailability(
    newRoomId,
    newCheckInDate,
    newCheckOutDate,
    stayId,
  );

  if (!availability.available) {
    throw new Error(
      `La habitación no está disponible para las fechas seleccionadas. Conflicto con reserva #${availability.conflictingStays?.[0]?.order_number}`,
    );
  }

  const { data: currentRoomStatus } = await supabase
    .from("rooms")
    .select("status_id")
    .eq("id", currentRoomId)
    .single();

  const { data: newRoomStatus } = await supabase
    .from("rooms")
    .select("status_id")
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

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const isStayActive = stay?.status === "Active";
  const isCheckInToday = stay?.check_in_date === todayStr;

  const targetStatusId = isStayActive
    ? occupiedStatus?.id
    : reservedStatus?.id;

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
    const { error: updateOldRoomError } = await supabase
      .from("rooms")
      .update({
        status_id: availableStatus?.id,
      })
      .eq("id", currentRoomId);

    if (updateOldRoomError) throw updateOldRoomError;

    const { error: updateNewRoomError } = await supabase
      .from("rooms")
      .update({
        status_id: targetStatusId,
      })
      .eq("id", newRoomId);

    if (updateNewRoomError) throw updateNewRoomError;

    const historyRecordOldRoom: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: currentRoomId,
      stay_id: stayId,
      previous_status_id: currentRoomStatus?.status_id,
      new_status_id: availableStatus?.id,
      employee_id: employeeId,
      action_type: "CAMBIO HABITACION",
      observation:
        observation ||
        `Movimiento de reserva a habitación nueva. Fecha del movimiento: ${moveDate}`,
    };

    const { error: historyOldError } = await supabase
      .from("room_history")
      .insert(historyRecordOldRoom);

    if (historyOldError) throw historyOldError;

    const historyRecordNewRoom: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: newRoomId,
      stay_id: stayId,
      previous_status_id: newRoomStatus?.status_id,
      new_status_id: targetStatusId,
      employee_id: employeeId,
      action_type: "CAMBIO HABITACION",
      observation:
        observation ||
        `Reserva recibida desde habitación anterior. Fecha del movimiento: ${moveDate}. Nuevas fechas: ${newCheckInDate} a ${newCheckOutDate}`,
    };

    const { error: historyNewError } = await supabase
      .from("room_history")
      .insert(historyRecordNewRoom);

    if (historyNewError) throw historyNewError;
  } else {
    const historyRecord: Omit<RoomHistory, "id" | "timestamp"> = {
      room_id: newRoomId,
      stay_id: stayId,
      previous_status_id: currentRoomStatus?.status_id,
      new_status_id: targetStatusId,
      employee_id: employeeId,
      action_type: "CAMBIO FECHAS",
      observation:
        observation ||
        `Cambio de fechas de la reserva. Fecha del movimiento: ${moveDate}. Nuevas fechas: ${newCheckInDate} a ${newCheckOutDate}`,
    };

    const { error: historyError } = await supabase
      .from("room_history")
      .insert(historyRecord);

    if (historyError) throw historyError;
  }
};
