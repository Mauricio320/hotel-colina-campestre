import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysActionsApi } from "@/services/stays/staysActionsApi";
import { Stay } from "@/types";

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

    onMutate: async (params) => {
      const { stayId } = params;

      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);

      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return old;
        return old.map((stay) =>
          stay.id === stayId ? { ...stay, status: "Completed", active: false } : stay
        );
      });

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        refetchType: "active",
      });

      return { previousStays };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};
