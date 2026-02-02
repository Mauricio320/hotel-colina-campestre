import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut } from '@/services/auth/authApi';
import { authQueryKeys } from '@/services/queryKeys/auth.queryKeys';
import { LoginCredentials } from '@/services/auth/types';

/**
 * Hook for user login mutation
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => signIn(credentials),
    onSuccess: (data) => {
      // Invalidate session and user queries
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      
// Pre-populate employee cache for this user
        if (data.user?.id) {
          queryClient.invalidateQueries({ 
            predicate: (query) => query.queryKey[0] === 'user' && query.queryKey[1] === data.user?.id 
          });
          
          queryClient.prefetchQuery({
            queryKey: ['employee', data.user.id],
            queryFn: async () => {
              const { getEmployeeByAuthId } = await import('@/services/auth/employeeApi');
              return getEmployeeByAuthId(data.user.id);
            },
          });
        }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

/**
 * Hook for user logout mutation
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: ['session'] });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === 'employee' });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === 'user' });
      
      // Clear all user-specific data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if logout fails, clear cache to ensure user is logged out
      queryClient.clear();
    },
  });
};

/**
 * Hook for managing auth state
 */
export const useAuthMutations = () => {
  const login = useLoginMutation();
  const logout = useLogoutMutation();

  return {
    login,
    logout,
    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
    loginError: login.error,
    logoutError: logout.error,
  };
};