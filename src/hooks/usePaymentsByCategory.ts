import { useQuery } from "@tanstack/react-query";
import { fetchPaymentsByCategory } from "@/services/payments/paymentsApi";

export const usePaymentsByCategory = (category: string | null) => {
  return useQuery({
    queryKey: ["payments", "category", category],
    queryFn: () => fetchPaymentsByCategory(category!),
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
};
