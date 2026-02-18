import { supabase } from "@/config/supabase";
import { Stay, RoomHistory } from "@/types";

export const StayCreateService = (stayData: Stay) => {
  return supabase.from("stays").insert(stayData).select().single();
};

export interface CancelStayParams {
  stayId: string;
  roomId: string;
  observation: string;
  employeeId: string;
  availableStatusId: string;
  previous_status_id: string;
}

export const cancelStay = async (params: CancelStayParams): Promise<void> => {
  const {
    stayId,
    roomId,
    observation,
    employeeId,
    availableStatusId,
    previous_status_id,
  } = params;

  const observationWithPrefix = `[CANCELADO] ${new Date().toLocaleDateString()}: ${observation}`;

  const { error: stayError } = await supabase
    .from("stays")
    .update({
      status: "Cancelled",
      cancelled: true,
      observation: observationWithPrefix,
    })
    .eq("id", stayId);

  if (stayError) throw stayError;

  const { error: roomError } = await supabase
    .from("rooms")
    .update({ status_id: availableStatusId })
    .eq("id", roomId);

  if (roomError) throw roomError;

  const { error: historyError } = await supabase.from("room_history").insert({
    room_id: roomId,
    stay_id: stayId,
    new_status_id: availableStatusId,
    employee_id: employeeId,
    action_type: "Cancelacion",
    observation: observation,
    previous_status_id,
  });

  if (historyError) throw historyError;
};
