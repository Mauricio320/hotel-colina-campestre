import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCleaningLogs,
  fetchCleaningLogsByRoom,
  createCleaningLog,
  CreateCleaningLogDto,
} from "@/services/cleaning-logs/cleaningLogsApi";
import { CleaningLog } from "@/types";

export const useCleaningLogs = () => {
  return useQuery({
    queryKey: ["cleaning_logs"],
    queryFn: fetchCleaningLogs,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};

export const useCleaningLogsByRoom = (roomId: string | null) => {
  return useQuery({
    queryKey: ["cleaning_logs", "room", roomId],
    queryFn: () => fetchCleaningLogsByRoom(roomId!),
    enabled: !!roomId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};

export const useCreateCleaningLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCleaningLogDto) => createCleaningLog(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaning_logs"] });
    },
  });
};
