import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysCreationApi } from "@/services/stays/staysCreationApi";
import { Stay } from "@/types";

interface CheckInParams {
  stay?: Stay;
  roomId: string;
  employeeId: string;
  observation?: string;
  selectedDate: Date;
}

export const useStaysCheckInActions = () => {
  const queryClient = useQueryClient();

  const performCheckIn = useMutation({
    mutationFn: (params: CheckInParams) => staysCreationApi.performCheckIn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["stays"] });
    },
  });

  return {
    performCheckIn,
  };
};
