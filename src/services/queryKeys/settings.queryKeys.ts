export const settingsQueryKeys = {
  settings: ["settings"] as const,
  paymentMethods: ["payment-methods"] as const,
} as const;

export type SettingsQueryKey = typeof settingsQueryKeys;

export default settingsQueryKeys;