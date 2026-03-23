import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/services/payment/paymentApi";

export const useUpdatePaymentMethod = (categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, paymentMethodId }: { paymentId: string; paymentMethodId: string }) =>
      paymentApi.updatePayment(paymentId, { payment_method_id: paymentMethodId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "category", categoryId] });
    },
  });
};
