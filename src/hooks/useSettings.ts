import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, getPaymentMethods, updateSetting } from "@/services/settings/settingsApi";
import { settingsQueryKeys } from "@/services/queryKeys/settings.queryKeys";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const {
    data: settingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: settingsQueryKeys.settings,
    queryFn: getSettings,
    enabled: true,
  });

  const settings = useMemo(() => ({
    iva: settingsData?.find((s) => s.key === "iva_percentage")?.value || 19,
    mat: settingsData?.find((s) => s.key === "extra_mattress_price")?.value || 30000,
  }), [settingsData]);

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: number }) => updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.settings });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSetting: updateSettingMutation,
  };
};

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();

  const {
    data: paymentMethods,
    isLoading,
    error,
  } = useQuery({
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
