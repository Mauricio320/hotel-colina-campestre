
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Employee } from '../types';

interface AuthContextType {
  user: any;
  employee: Employee | null;
  loading: boolean;
  dbError: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const initialized = useRef(false);

  const fetchEmployeeData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, role:roles(*)')
        .eq('auth_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "public.employees"')) {
          setDbError('DATABASE_NOT_READY');
        }
        return null;
      }
      return data;
    } catch (err) {
      return null;
    }
  };

  const syncProfile = async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'Admin').maybeSingle();
      if (!adminRole) return null;

      const { data: newProfile } = await supabase.from('employees').upsert({
        auth_id: userId,
        email: authUser.email,
        first_name: authUser.user_metadata?.first_name || 'Usuario',
        last_name: authUser.user_metadata?.last_name || 'Nuevo',
        role_id: adminRole.id,
        doc_number: authUser.user_metadata?.doc_number || `SYNC-${userId.slice(0, 5)}`,
        doc_type: authUser.user_metadata?.doc_type || 'Cédula de Ciudadanía'
      }, { onConflict: 'auth_id' }).select('*, role:roles(*)').maybeSingle();

      return newProfile;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const emp = await fetchEmployeeData(currentUser.id);
        if (emp) {
          setEmployee(emp);
        } else {
          const synced = await syncProfile(currentUser.id);
          setEmployee(synced);
        }
      }
      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === 'SIGNED_IN') {
        setLoading(true);
        const emp = await fetchEmployeeData(currentUser?.id || '');
        setEmployee(emp);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setEmployee(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return React.createElement(AuthContext.Provider, { 
    value: { user, employee, loading, dbError, login, logout } 
  }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
