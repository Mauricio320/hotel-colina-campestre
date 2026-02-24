import { useQuery } from "@tanstack/react-query";
import { staysInvoiceApi, StayInvoiceData } from "@/services/stays/staysInvoiceApi";
import { Payment } from "@/types";

interface UseStayInvoiceResult {
  stay: StayInvoiceData | null;
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
}

export const useStayInvoice = (stayId: string | undefined): UseStayInvoiceResult => {
  const stayQuery = useQuery<StayInvoiceData>({
    queryKey: ["stay", "invoice", stayId],
    queryFn: () => staysInvoiceApi.fetchStayWithInvoiceData(stayId!),
    enabled: !!stayId,
  });

  const paymentsQuery = useQuery<Payment[]>({
    queryKey: ["payments", "by-stay", stayId],
    queryFn: () => staysInvoiceApi.fetchPaymentsByStayId(stayId!),
    enabled: !!stayId,
  });

  return {
    stay: stayQuery.data || null,
    payments: paymentsQuery.data || [],
    isLoading: stayQuery.isLoading || paymentsQuery.isLoading,
    error: stayQuery.error?.message || paymentsQuery.error?.message || null,
  };
};
