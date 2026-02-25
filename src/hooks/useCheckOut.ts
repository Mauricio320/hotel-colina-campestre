import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysActionsApi } from "@/services/stays/staysActionsApi";

interface CheckOutParams {
  stayId: string;
  observation: string;
  finalPayment: number;
  employeeId?: string;
  roomId?: string;
  accommodationTypeId?: string;
}

export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CheckOutParams) => staysActionsApi.performCheckOut(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};
