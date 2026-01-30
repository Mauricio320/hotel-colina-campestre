export const authQueryKeys = {
  // User session and auth
  session: ['session'] as const,
  user: (userId: string) => ['user', userId] as const,
  
  // Employee data
  employee: (authId: string) => ['employee', authId] as const,
  allEmployees: ['employees'] as const,
  
  // Profile and roles
  profile: (authId: string) => ['profile', authId] as const,
  adminRole: ['role', 'admin'] as const,
  
  // Authentication mutations
  login: ['auth', 'login'] as const,
  logout: ['auth', 'logout'] as const,
  syncProfile: ['auth', 'sync-profile'] as const,
} as const;

export type AuthQueryKey = typeof authQueryKeys[keyof typeof authQueryKeys];