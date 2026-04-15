import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysCreationApi } from "@/services/stays/staysCreationApi";
import { Stay } from "@/types";

interface CreateStayParams {
  room_id: string;
  guest_id: string;
  employee_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  observation?: string;
}

export const useStaysCreation = () => {
  const queryClient = useQueryClient();

  const createStay = useMutation({
    mutationFn: (stayData: CreateStayParams) => staysCreationApi.createStay(stayData),

    // Actualización optimista: agregar stay temporalmente a la cache
    onMutate: async (stayData) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      // Guardar estado anterior
      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);

      // Crear stay temporal con ID provisional
      const tempStay: Stay = {
        id: `temp-${Date.now()}`,
        ...stayData,
        created_at: new Date().toISOString(),
        active: stayData.status === "Active",
        paid_amount: 0,
        guest: null,
        room: null,
      };

      // Agregar stay temporal a la lista
      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return [tempStay];
        return [tempStay, ...old];
      });

      return { previousStays, tempStayId: tempStay.id };
    },

    // Reemplazar stay temporal con el real cuando llega la respuesta
    onSuccess: (newStay, _variables, context) => {
      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return [newStay];
        // Reemplazar el temporal con el real
        return old.map((stay) => (stay.id === context?.tempStayId ? newStay : stay));
      });
    },

    // Revertir en caso de error
    onError: (_err, _variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
    },

    // Refetch al finalizar para consistencia
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      // Invalidar todas las queries de rooms (incluyendo las del calendario con fechas)
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  return {
    createStay,
  };
};
