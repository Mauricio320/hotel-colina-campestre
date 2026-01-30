import { useQuery } from '@tanstack/react-query';
import { paymentMethodsApi } from '@/services/payment-methods/paymentMethodsApi';
import { PaymentMethod } from '@/types';

export const usePaymentMethods = () => {
  const fetchAll = useQuery({
    queryKey: ['payment_methods'],
    queryFn: () => paymentMethodsApi.fetchAll(),
    staleTime: 1000 * 60 * 30,
  });

  return {
    fetchAll,
  };
};