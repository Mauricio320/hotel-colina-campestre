import { checkRoomAvailability, moveStay, MoveStayParams } from "@/services/stays/stayMovesApi";
import { Stay } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CheckAvailabilityParams {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  excludeStayId?: string;
}

export const useMoveStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveStayParams) => moveStay(params),

    // Actualización optimista: mover stay en cache inmediatamente
    onMutate: async (params) => {
      const { stayId, newRoomId } = params;

      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["stays"] });
      await queryClient.cancelQueries({ queryKey: ["stay", stayId] });
      await queryClient.cancelQueries({ queryKey: ["rooms"] });

      // Guardar estado anterior
      const previousStays = queryClient.getQueryData<Stay[]>(["stays"]);
      const previousStay = queryClient.getQueryData<Stay>(["stay", stayId]);

      // Actualizar stay en lista: cambiar room_id
      queryClient.setQueryData<Stay[]>(["stays"], (old) => {
        if (!old) return old;
        return old.map((stay) =>
          stay.id === stayId ? { ...stay, room_id: newRoomId } : stay
        );
      });

      // Actualizar stay individual
      queryClient.setQueryData<Stay>(["stay", stayId], (old) => {
        if (!old) return old;
        return { ...old, room_id: newRoomId };
      });

      return { previousStays, previousStay };
    },

    // Revertir en caso de error
    onError: (_err, variables, context) => {
      if (context?.previousStays) {
        queryClient.setQueryData(["stays"], context.previousStays);
      }
      if (context?.previousStay) {
        queryClient.setQueryData(["stay", variables.stayId], context.previousStay);
      }
    },

    // Refetch al finalizar para consistencia
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["stay", variables.stayId] });
      // Invalidar todas las queries de rooms (incluyendo las del calendario con fechas)
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });
};

export const useCheckRoomAvailability = () => {
  return useMutation({
    mutationFn: (params: CheckAvailabilityParams) =>
      checkRoomAvailability(
        params.roomId,
        params.checkInDate,
        params.checkOutDate,
        params.excludeStayId
      ),
  });
};
