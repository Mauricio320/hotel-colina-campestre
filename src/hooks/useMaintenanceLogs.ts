import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMaintenanceLog,
  fetchMaintenanceLogsByRoom,
  fetchMaintenanceLogsByDate,
} from "@/services/maintenance/maintenanceLogsApi";
import { CreateMaintenanceLogDto } from "@/types";

export const useMaintenanceLogsByRoom = (roomId: string | null) => {
  return useQuery({
    queryKey: ["maintenance-logs", "room", roomId],
    queryFn: () => fetchMaintenanceLogsByRoom(roomId!),
    enabled: !!roomId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 1,
  });
};

export const useMaintenanceLogsByDate = (date: string | null) => {
  return useQuery({
    queryKey: ["maintenance-logs", "date", date],
    queryFn: () => fetchMaintenanceLogsByDate(date!),
    enabled: !!date,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMaintenanceLogDto) => createMaintenanceLog(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance-logs", "room", variables.room_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-logs", "date", variables.date],
      });
    },
  });
};
