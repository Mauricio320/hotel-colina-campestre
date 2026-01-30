import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getEmployeeByAuthId, 
  syncUserProfile, 
  getAdminRole 
} from '@/services/auth/employeeApi';
import { authQueryKeys } from '@/services/queryKeys/auth.queryKeys';
import { AuthUser } from '@/services/auth/types';

/**
 * Hook for fetching employee data by auth ID
 */
export const useEmployeeQuery = (authId: string | null) => {
  return useQuery({
    queryKey: authQueryKeys.employee(authId || ''),
    queryFn: () => getEmployeeByAuthId(authId || ''),
    enabled: !!authId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

/**
 * Hook for fetching admin role
 */
export const useAdminRoleQuery = () => {
  return useQuery({
    queryKey: authQueryKeys.adminRole,
    queryFn: getAdminRole,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

/**
 * Hook for syncing user profile
 */
export const useSyncProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authId: string) => syncUserProfile(authId),
    onSuccess: (data, authId) => {
      // Update the employee cache with new data
      queryClient.setQueryData(authQueryKeys.employee(authId), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.employee(authId)
      });
    },
    onError: (error) => {
      console.error('Error syncing profile:', error);
    },
  });
};

/**
 * Hook for getting employee with fallback to sync
 */
export const useEmployeeWithSync = (authId: string | null) => {
  const employeeQuery = useEmployeeQuery(authId);
  const syncProfileMutation = useSyncProfileMutation();

  const { data: employee, isLoading, error, isError } = employeeQuery;

  // If employee not found and authId exists, try to sync
  React.useEffect(() => {
    if (isError && authId && !syncProfileMutation.isPending) {
      const errorType = error?.message;
      if (errorType === 'DATABASE_NOT_READY' || !employee) {
        syncProfileMutation.mutate(authId);
      }
    }
  }, [isError, authId, employee, syncProfileMutation]);

  return {
    data: employee || syncProfileMutation.data,
    isLoading: isLoading || syncProfileMutation.isPending,
    error: error || syncProfileMutation.error,
    isError: isError || syncProfileMutation.isError,
    refetch: employeeQuery.refetch,
  };
};

/**
 * Hook for getting user session
 */
export const useSessionQuery = () => {
  return useQuery({
    queryKey: authQueryKeys.session,
    queryFn: async () => {
      const { session } = await import('@/services/auth/authApi').then(m => m.getCurrentSession());
      return session;
    },
    staleTime: 0, // Always check session
    retry: false,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
};