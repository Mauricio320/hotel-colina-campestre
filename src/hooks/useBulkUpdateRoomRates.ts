import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { BulkRateUpdate } from "@/types";

interface BulkUpdateParams {
  updates: BulkRateUpdate[];
  employeeId: string;
}

export const useBulkUpdateRoomRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updates, employeeId }: BulkUpdateParams) => {
      // Usar RPC para hacer todo en una sola transacción en el servidor
      const { error } = await supabase.rpc("bulk_update_room_rates_with_history", {
        updates: JSON.stringify(updates),
        employee_id: employeeId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room-rates"] });
      queryClient.invalidateQueries({ queryKey: ["room-rates-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["room-rate-history"] });
    },
  });
};
