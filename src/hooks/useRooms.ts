import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { Room, RoomRate } from "@/types";

export const useRooms = (category?: string) => {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ["rooms", category],
    queryFn: async ({ signal }) => {
      try {
        let query = supabase
          .from("rooms")
          .select("*, status:room_statuses(*), rates:room_rates(*)")
          .eq("is_active", true)
          .abortSignal(signal); // Vinculamos la señal de aborto

        if (category) query = query.eq("category", category);

        const { data, error } = await query.order("room_number");

        if (error) throw error;
        return data as Room[];
      } catch (e: any) {
        // Captura silenciosa si la petición fue abortada por el sistema
        if (e.name === "AbortError" || e.message?.includes("aborted")) {
          console.debug("Rooms fetch aborted");
          return [];
        }
        throw e;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const upsertRoom = useMutation({
    mutationFn: async ({
      room,
      rates,
    }: {
      room: Partial<Room>;
      rates: Partial<RoomRate>[];
    }) => {
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
        const { error: ratesError } = await supabase
          .from("room_rates")
          .insert(ratesToInsert);
        if (ratesError) throw ratesError;
      }

      return savedRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      roomId,
      statusId,
      observation,
      actionType,
      employeeId,
      statusDate,
      stayId,
    }: {
      roomId: string;
      statusId: string;
      observation?: string;
      actionType: string;
      employeeId?: string;
      statusDate?: string;
      stayId?: string;
    }) => {
      const { data: currentRoom } = await supabase
        .from("rooms")
        .select("status_id, status_date")
        .eq("id", roomId)
        .single();
      const targetDate = statusDate || new Date().toLocaleDateString("sv-SE");

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
          observation ||
          `Cambio de estado manual a ${actionType} para el día ${targetDate}`,
        employee_id: employeeId,
      });
      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["stays"] });
    },
  });

  return { roomsQuery, updateStatus, upsertRoom };
};

export const RoomsQueryCtegory = (id: string) => {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: async ({ signal }) => {
      const { data: accommodationType } = await supabase
        .from("stays")
        .select(
          `*, 
          room:rooms(*),  
          guest:guests(*),
          room_statuses(*)`,
        )
        .eq("accommodation_type_id", id)
        .eq("active", true)
        .abortSignal(signal);

      const { data } = await supabase
        .from("rooms")
        .select(
          `*, 
          status:room_statuses(*), 
          rates:room_rates(*), 
          stays(*, 
            room:rooms(*),  
            guest:guests(*),
            room_statuses(*)
          ),
          accommodation_types(*)`,
        )
        .eq("is_active", true)
        .eq("accommodation_type_id", id)
        .eq("stays.active", true)
        .abortSignal(signal)
        .order("room_number");

      return (data as unknown as Room[]).map((room) => {
        accommodationType.forEach((stay) => {
          room.stays.push(stay);
        });
        return room;
      });
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};

export const useRoomById = (roomId: string | null) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const { data, error } = await supabase
        .from("rooms")
        .select("*, rates:room_rates(*)")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data as Room;
    },
    enabled: !!roomId,
    staleTime: 0,
  });
};

export const useRoomHistory = (roomId: string | null) => {
  return useQuery({
    queryKey: ["room_history", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("room_history")
        .select(
          "*, employee:employees(*), new_status:room_statuses!new_status_id(*), prev_status:room_statuses!previous_status_id(*), stay:stays(*)",
        )
        .eq("room_id", roomId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!roomId,
    staleTime: 0,
  });
};
