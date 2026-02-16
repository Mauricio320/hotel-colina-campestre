import { useQuery } from "@tanstack/react-query";
import {
  fetchPaymentsByCategory,
  PaymentWithRelations,
} from "@/services/payments/paymentsApi";

export const usePaymentsByCategory = (categoryId: string | null) => {
  return useQuery<PaymentWithRelations[]>({
    queryKey: ["payments", "category", categoryId],
    queryFn: () => fetchPaymentsByCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};
