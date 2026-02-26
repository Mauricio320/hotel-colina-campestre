import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysCreationApi } from "@/services/stays/staysCreationApi";

interface StayPaymentRecordParams {
  stayId: string;
  amount: number;
  paymentMethodId: string;
  employeeId?: string;
  roomId?: string;
  customObservation?: string;
}

export const useStaysActions = () => {
  const queryClient = useQueryClient();

  const registerPayment = useMutation({
    mutationFn: (params: StayPaymentRecordParams) =>
      staysCreationApi.createStayPaymentRecord(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: ["payments", "summary", variables.stayId],
      });
    },
  });

  const registerCheckInReserva = useMutation({
    mutationFn: (params: {
      stayId: string;
      employeeId?: string;
      roomId: string;
      previous_status_id: string;
    }) => staysCreationApi.registerCheckInReserva(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  return {
    registerPayment,
    registerCheckInReserva,
  };
};
