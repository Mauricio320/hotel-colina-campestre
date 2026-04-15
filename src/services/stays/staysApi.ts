import { supabase } from "@/config/supabase";
import { Stay, RoomHistory, Payment, PriceOverride, CreatePaymentDto, PaymentType } from "@/types";
import dayjs from "dayjs";

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
  const { stayId, roomId, observation, employeeId, availableStatusId, previous_status_id } = params;

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

export const staysApi = {
  fetchStays: async (signal?: AbortSignal): Promise<Stay[]> => {
    try {
      const { data, error } = await supabase
        .from("stays")
        .select("*, room:rooms(*), guest:guests!stays_guest_id_fkey(*)")
        .abortSignal(signal)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e: any) {
      if (e.name === "AbortError" || e.message?.includes("aborted")) {
        return [];
      }
      throw e;
    }
  },

  fetchStayById: async (stayId: string): Promise<Stay | null> => {
    const { data, error } = await supabase
      .from("stays")
      .select("*, room:rooms(*), guest:guests!stays_guest_id_fkey(*)")
      .eq("id", stayId)
      .single();

    if (error) throw error;
    return data;
  },

  fetchStayWithDetails: async (stayId: string): Promise<Stay | null> => {
    const { data, error } = await supabase
      .from("stays")
      .select(
        "*, guest:guests!stays_guest_id_fkey(*), room:rooms(*), accommodation_type:accommodation_types(*)"
      )
      .eq("id", stayId)
      .single();

    if (error) throw error;
    return data;
  },

  createStay: async (stayData: Partial<Stay>): Promise<Stay> => {
    const { data, error } = await supabase.from("stays").insert(stayData).select().single();

    if (error) throw error;
    return data;
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

  checkAvailability: async (
    accommodationTypeId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<{ data: any[] | null; error: any }> => {
    const { data: directStays, error: error1 } = await supabase
      .from("stays")
      .select("id,check_in_date, check_out_date, order_number, accommodation_types!inner(name)")
      .eq("active", true)
      .eq("accommodation_type_id", accommodationTypeId)
      .gte("check_out_date", checkInDate)
      .lte("check_in_date", checkOutDate);

    const { data: roomStays, error: error2 } = await supabase
      .from("stays")
      .select(
        `
        id,check_in_date, check_out_date, order_number,
        rooms!inner(
        room_number,
        accommodation_type_id
        )
      `
      )
      .eq("active", true)
      .eq("rooms.accommodation_type_id", accommodationTypeId)
      .gte("check_out_date", checkInDate)
      .lte("check_in_date", checkOutDate);

    if (error1 || error2) {
      return { data: null, error: error1 || error2 };
    }

    const allStays = [...(directStays || []), ...(roomStays || [])];
    const uniqueStays = Array.from(new Map(allStays.map((stay) => [stay.id, stay])).values());

    return { data: uniqueStays, error: null };
  },

  fetchStaysByAccommodationType: async (params: {
    accommodation_type_id: string;
    page?: number;
    pageSize?: number;
    orderNumber?: string;
    docNumber?: string;
    isReservation?: boolean | null;
  }): Promise<{ data: any[]; count: number }> => {
    // TODO: pendiente agregar filtros para mostrar solo las facturas activas
    const { data, error } = await supabase.rpc("get_stays_paginated", {
      p_accommodation_type_id: params.accommodation_type_id,
      p_page: params.page || 0,
      p_page_size: params.pageSize || 10,
      p_order_number: params.orderNumber || "",
      p_doc_number: params.docNumber || "",
      p_is_reservation: params.isReservation,
    });

    if (error) throw error;

    const result = data as { data: any[]; count: number };
    return { data: result.data || [], count: result.count || 0 };
  },

  fetchConflictingStays: async (params: {
    accommodationTypeId: string;
    checkInDate: string;
    checkOutDate: string;
    excludeStayId?: string;
  }): Promise<Stay[]> => {
    const { accommodationTypeId, checkInDate, checkOutDate, excludeStayId } = params;

    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id")
      .eq("accommodation_type_id", accommodationTypeId);

    if (roomsError) throw roomsError;

    const roomIds = rooms?.map((r) => r.id) || [];

    let query = supabase
      .from("stays")
      .select(`*, guest:guests!stays_guest_id_fkey(*), room:rooms(*)`)
      .eq("active", true)
      .lt("check_in_date", checkOutDate)
      .gt("check_out_date", checkInDate);

    if (roomIds.length > 0) {
      query = query.or(
        `room_id.in.(${roomIds.join(",")}),accommodation_type_id.eq.${accommodationTypeId}`
      );
    } else {
      query = query.eq("accommodation_type_id", accommodationTypeId);
    }

    if (excludeStayId) {
      query = query.neq("id", excludeStayId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};

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

export interface RegisterCheckInParams {
  stayId: string;
  employeeId?: string;
  roomId: string;
  previous_status_id: string;
}

export interface CreateStayWithPaymentParams {
  stayData: any;
  paymentData: {
    amount: number;
    payment_method_id: string;
    employee_id?: string;
    context?: "reservation" | "checkin_direct";
    customObservation?: string;
  };
}
