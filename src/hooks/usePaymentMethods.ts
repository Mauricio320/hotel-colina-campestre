import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentMethodsApi } from "@/services/payment-methods/paymentMethodsApi";
import { PaymentMethod } from "@/types";

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();

  const fetchAll = useQuery({
    queryKey: ["payment_methods"],
    queryFn: () => paymentMethodsApi.fetchAll(),
    staleTime: 1000 * 60 * 5,
  });

  const create = useMutation({
    mutationFn: (name: string) => paymentMethodsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => paymentMethodsApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });

  return {
    fetchAll,
    create,
    update,
    remove,
  };
};
