import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelStay, CancelStayParams } from "@/services/stays/staysApi";
import { Stay } from "@/types";

export const useCancelStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelStayParams) => cancelStay(params),

    onMutate: async (params) => {
      const { stayId } = params;

      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["stay", stayId] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);
      const previousStay = queryClient.getQueryData<Stay>(["stay", stayId]);

      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return old;
        return old.map((stay) =>
          stay.id === stayId ? { ...stay, status: "Cancelled", active: false } : stay
        );
      });

      queryClient.setQueryData<Stay>(["stay", stayId], (old) => {
        if (!old) return old;
        return { ...old, status: "Cancelled", active: false };
      });

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        refetchType: "active",
      });

      return { previousStays, previousStay };
    },

    onError: (_err, variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
      if (context?.previousStay) {
        queryClient.setQueryData(["stay", variables.stayId], context.previousStay);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["stay", variables.stayId] });
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};
