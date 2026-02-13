import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelStay, CancelStayParams } from "@/services/stays/staysApi";

export const useCancelStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelStayParams) => cancelStay(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};
