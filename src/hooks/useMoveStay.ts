import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveStay, MoveStayParams } from "@/services/stays/stayMovesApi";

export const useMoveStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveStayParams) => moveStay(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};
