import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, getPaymentMethods } from "@/services/settings/settingsApi";
import { settingsQueryKeys } from "@/services/queryKeys/settings.queryKeys";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: settingsQueryKeys.settings,
    queryFn: getSettings,
    enabled: true,
  });

  const settings = {
    iva: settingsData?.find((s) => s.key === "iva_percentage")?.value || 19,
    mat: settingsData?.find((s) => s.key === "extra_mattress_price")?.value || 30000,
  };

  return {
    settings,
    isLoading,
    error,
  };
};

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: settingsQueryKeys.paymentMethods,
    queryFn: getPaymentMethods,
    enabled: true,
  });

  return {
    paymentMethods,
    isLoading,
    error,
  };
};