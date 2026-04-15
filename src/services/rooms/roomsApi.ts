import { supabase } from "@/config/supabase";
import { Room, RoomRate, Stay } from "@/types";
import dayjs from "dayjs";

export const roomsApi = {
  updateStatus: async (roomId: string, statusId: string, selectedDate: Date): Promise<Room> => {
    const { data, error } = await supabase
      .from("rooms")
      .update({
        status_id: statusId,
        status_date: dayjs(selectedDate).format("YYYY-MM-DD"),
      })
      .eq("id", roomId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  fetchRooms: async (signal?: AbortSignal, category?: string): Promise<Room[]> => {
    let query = supabase
      .from("rooms")
      .select("*, status:room_statuses(*), rates:room_rates(*)")
      .eq("is_active", true)
      .abortSignal(signal);

    if (category) query = query.eq("category", category);

    const { data, error } = await query.order("room_number");

    if (error) {
      if (error.message?.includes("aborted")) return [];
      throw error;
    }
    return data || [];
  },

  fetchRoomById: async (roomId: string): Promise<Room | null> => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*, rates:room_rates(*), accommodation_types(name)")
      .eq("id", roomId)
      .single();

    if (error) throw error;
    return data;
  },

  fetchRoomWithStatus: async (id: string): Promise<Room> => {
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `
        *,
        room_statuses(name, color)
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  },

  fetchRoomsByAccommodationType: async (
    accommodationTypeId: string,
    signal?: AbortSignal
  ): Promise<Room[]> => {
    const { data, error } = await supabase
      .from("rooms")
      .select(`*, accommodation_types(*)`)
      .eq("is_active", true)
      .eq("accommodation_type_id", accommodationTypeId)
      .abortSignal(signal)
      .order("room_number");

    if (error) throw error;
    return (data as unknown as Room[]) || [];
  },

  fetchRoomsWithStays: async (
    accommodationTypeId: string,
    startDate: string,
    endDate: string,
    signal?: AbortSignal
  ): Promise<Room[]> => {
    const todayStr = dayjs().format("YYYY-MM-DD");

    const { data: accommodationType } = await supabase
      .from("stays")
      .select(
        `id, status, order_number, room_id, cancelled, guest_id, employee_id, check_in_date, check_out_date, total_price, paid_amount, payment_method_id, has_extra_mattress, extra_mattress_price, is_invoice_requested, iva_amount, observation, origin_was_reservation, iva_percentage, person_count, extra_mattress_count, extra_mattress_unit_price, accommodation_type_id, room_status_id, active,
          room:rooms(*),
          guest:guests!stays_guest_id_fkey(*),
          room_statuses(*)`
      )
      .eq("accommodation_type_id", accommodationTypeId)
      .eq("cancelled", false)
      .lte("check_in_date", endDate)
      .gte("check_out_date", startDate)
      .abortSignal(signal);

    const { data } = await supabase
      .from("rooms")
      .select(
        `
          *,
          status:room_statuses(*),
          rates:room_rates(*),
          stays!stays_room_id_fkey(
            id, status, order_number, room_id, guest_id, employee_id, check_in_date, check_out_date, total_price, paid_amount, payment_method_id, has_extra_mattress, extra_mattress_price, is_invoice_requested, iva_amount, observation, origin_was_reservation, iva_percentage, person_count, extra_mattress_count, extra_mattress_unit_price, accommodation_type_id, room_status_id, active,
            room:rooms(*),
            guest:guests!stays_guest_id_fkey(*),
            room_statuses(*)
          ),
          cleaning_log: cleaning_logs(id),
          accommodation_types(*)
        `
      )
      .eq("is_active", true)
      .eq("accommodation_type_id", accommodationTypeId)
      .eq("stays.cancelled", false)
      .lte("stays.check_in_date", endDate)
      .gte("stays.check_out_date", startDate)
      .eq("cleaning_log.date", todayStr)
      .abortSignal(signal)
      .order("room_number");

    return ((data as unknown as Room[]) || []).map((room) => {
      if (!room.cleaning_log) {
        room.cleaning_log = [];
      }
      const roomStayIds = new Set(room.stays.map((s) => s.id));
      accommodationType?.forEach((stay) => {
        if (!roomStayIds.has(stay.id)) {
          room.stays.push(stay as unknown as Stay);
        }
      });
      room.stays.sort((a, b) => a.check_in_date.localeCompare(b.check_in_date));
      return room;
    });
  },

  upsertRoom: async (room: Partial<Room>, rates: Partial<RoomRate>[]): Promise<Room> => {
    const { data: savedRoom, error: roomError } = await supabase
      .from("rooms")
      .upsert(room)
      .select()
      .single();

    if (roomError) throw roomError;

    if (rates && savedRoom.id) {
      await supabase.from("room_rates").delete().eq("room_id", savedRoom.id);
      const ratesToInsert = rates.map((r) => ({
        room_id: savedRoom.id,
        person_count: r.person_count,
        rate: r.rate,
      }));
      const { error: ratesError } = await supabase.from("room_rates").insert(ratesToInsert);
      if (ratesError) throw ratesError;
    }

    return savedRoom;
  },

  updateRoomStatus: async (
    roomId: string,
    statusId: string,
    observation: string,
    actionType: string,
    employeeId?: string,
    statusDate?: string,
    stayId?: string
  ): Promise<void> => {
    const { data: currentRoom } = await supabase
      .from("rooms")
      .select("status_id, status_date")
      .eq("id", roomId)
      .single();
    const targetDate = statusDate || dayjs().format("YYYY-MM-DD");

    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status_id: statusId,
        status_date: targetDate,
      })
      .eq("id", roomId);

    if (roomError) throw roomError;

    const { error: logError } = await supabase.from("room_history").insert({
      room_id: roomId,
      stay_id: stayId || null,
      previous_status_id: currentRoom?.status_id,
      new_status_id: statusId,
      action_type: actionType,
      observation:
        observation || `Cambio de estado manual a ${actionType} para el día ${targetDate}`,
      employee_id: employeeId,
    });
    if (logError) throw logError;
  },
};

export const fetchRoomById = async (id: string): Promise<Room> => {
  return roomsApi.fetchRoomWithStatus(id);
};
