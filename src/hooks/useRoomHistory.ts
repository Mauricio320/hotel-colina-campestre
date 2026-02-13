import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomHistoryApi } from "@/services/room-history/roomHistoryApi";
import { RoomHistory } from "@/types";

export const useCreateRoomHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<RoomHistory, "id" | "timestamp">) => {
      return roomHistoryApi.createRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};

export const useRoomHistory = () => {
  const queryClient = useQueryClient();

  const createRecord = useMutation({
    mutationFn: async (record: Omit<RoomHistory, "id" | "timestamp">) => {
      return roomHistoryApi.createRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  return { createRecord };
};
