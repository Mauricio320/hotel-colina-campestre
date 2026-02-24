import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoomRate } from "@/services/rooms/roomRatesApi";

export const useDeleteRoomRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, personCount }: { roomId: string; personCount: number }) =>
      deleteRoomRate(roomId, personCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};
