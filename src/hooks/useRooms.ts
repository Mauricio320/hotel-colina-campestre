import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "@/services/rooms/roomsApi";
import { roomHistoryApi } from "@/services/room-history/roomHistoryApi";
import { Room, RoomRate } from "@/types";
import dayjs from "dayjs";

export const useRooms = (category?: string) => {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ["rooms", category],
    queryFn: ({ signal }) => roomsApi.fetchRooms(signal, category),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });

  const upsertRoom = useMutation({
    mutationFn: ({ room, rates }: { room: Partial<Room>; rates: Partial<RoomRate>[] }) =>
      roomsApi.upsertRoom(room, rates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
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
    }) =>
      roomsApi.updateRoomStatus(
        roomId,
        statusId,
        observation || `Cambio de estado manual a ${actionType} para el día ${statusDate || dayjs().format("YYYY-MM-DD")}`,
        actionType,
        employeeId,
        statusDate,
        stayId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["stays"] });
    },
  });

  return { roomsQuery, updateStatus, upsertRoom };
};

interface RoomsQueryCategoryParams {
  id: string;
  startDate: string;
  endDate: string;
}

export const RoomsQueryAndStayCategory = ({ id, startDate, endDate }: RoomsQueryCategoryParams) => {
  return useQuery({
    queryKey: ["rooms", id, startDate, endDate],
    queryFn: ({ signal }) => roomsApi.fetchRoomsWithStays(id, startDate, endDate, signal),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
};

export const RoomsQueryCategory = (id: string) => {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: ({ signal }) => roomsApi.fetchRoomsByAccommodationType(id, signal),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });
};

export const useRoomById = (roomId: string | null) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.fetchRoomById(roomId!),
    enabled: !!roomId,
    staleTime: 0,
  });
};

export const useRoomHistory = (roomId: string | null) => {
  return useQuery({
    queryKey: ["room_history", roomId],
    queryFn: () => roomHistoryApi.fetchRoomHistory(roomId!),
    enabled: !!roomId,
    staleTime: 0,
  });
};
