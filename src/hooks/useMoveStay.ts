import { checkRoomAvailability, moveStay, MoveStayParams } from "@/services/stays/stayMovesApi";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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
