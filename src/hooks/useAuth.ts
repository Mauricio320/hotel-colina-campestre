import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useEmployeeWithSync } from './useEmployee';
import { useAuthMutations } from './useAuthMutations';
import { getCurrentSession, onAuthStateChange } from '@/services/auth/authApi';
import { AuthUser } from '@/services/auth/types';
import { Employee } from '@/types';

// Updated interface with React Query integration
export interface AuthContextType {
  // Supabase auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  
  // Employee data from React Query
  employee: Employee | null;
  employeeLoading: boolean;
  employeeError: any;
  
  // Combined states
  loading: boolean; // Auth loading + employee loading
  dbError: string | null;
  
  // Actions (from React Query mutations)
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Loading states for mutations
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const initialized = useRef(false);
  const initializing = useRef(false);

  // React Query hooks
  const { 
    data: employee, 
    isLoading: employeeLoading, 
    error: employeeError 
  } = useEmployeeWithSync(user?.id || null);
  
  const { 
    login, 
    logout, 
    isLoggingIn, 
    isLoggingOut 
  } = useAuthMutations();

  // Combined loading state
  const loading = authLoading || employeeLoading;

  // Initialize authentication state
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initialize = async () => {
      initializing.current = true;
      
      try {
        const { session } = await getCurrentSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Handle employee error
        if (employeeError) {
          const errorMessage = employeeError?.message;
          if (errorMessage === 'DATABASE_NOT_READY') {
            setDbError('DATABASE_NOT_READY');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setAuthLoading(false);
        initializing.current = false;
      }
    };

    initialize();

    // Set up auth state change listener
    const subscription = onAuthStateChange(async (event, session) => {
      // Skip during initialization to prevent conflicts
      if (initializing.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN') {
        // React Query will handle employee data fetching automatically
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // React Query will handle cache clearing
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [employeeError]);

  // Enhanced login with error handling
  const handleLogin = async (email: string, password: string) => {
    try {
      await login.mutateAsync({ email, password });
      setDbError(null);
    } catch (error: any) {
      const errorMessage = error.message;
      
      if (errorMessage === 'DATABASE_NOT_READY') {
        setDbError('DATABASE_NOT_READY');
      } else if (errorMessage === 'INVALID_CREDENTIALS') {
        throw new Error('Credenciales inválidas');
      } else if (errorMessage === 'NETWORK_ERROR') {
        throw new Error('Error de conexión. Intente nuevamente.');
      } else {
        throw new Error('Error al iniciar sesión. Intente nuevamente.');
      }
    }
  };

  // Enhanced logout with error handling
  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setUser(null);
      setDbError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
    }
  };

  const contextValue: AuthContextType = {
    // Auth state
    user,
    isAuthenticated: !!user,
    
    // Employee data
    employee: employee || null,
    employeeLoading,
    employeeError,
    
    // Combined states
    loading,
    dbError,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    
    // Mutation states
    isLoggingIn,
    isLoggingOut,
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: contextValue,
    },
    children,
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};