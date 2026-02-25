import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staysCreationApi } from "@/services/stays/staysCreationApi";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_history"] });
    },
  });

  return {
    createStay,
  };
};
