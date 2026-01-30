import { supabase } from '@/config/supabase';
import { EmployeeWithRole, SyncProfileData, RoleData } from './types/employee.types';
import { AuthErrorType } from './types';

/**
 * Fetches employee data by auth_id
 */
export const getEmployeeByAuthId = async (authId: string): Promise<EmployeeWithRole | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, role:roles(*)')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.employees"')) {
        throw new Error(AuthErrorType.DATABASE_NOT_READY);
      }
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AuthErrorType.NETWORK_ERROR);
  }
};

/**
 * Fetches admin role data
 */
export const getAdminRole = async (): Promise<RoleData | null> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'Admin')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AuthErrorType.NETWORK_ERROR);
  }
};

/**
 * Syncs or creates user profile in employees table
 */
export const syncUserProfile = async (authId: string): Promise<EmployeeWithRole | null> => {
  try {
    // Get current auth user
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !authUser) {
      throw new Error(AuthErrorType.UNAUTHORIZED);
    }

    // Get admin role
    const adminRole = await getAdminRole();
    if (!adminRole) {
      throw new Error(AuthErrorType.DATABASE_NOT_READY);
    }

    // Prepare sync data
    const syncData: Partial<SyncProfileData> = {
      auth_id: authId,
      email: authUser.email || '',
      first_name: authUser.user_metadata?.first_name || 'Usuario',
      last_name: authUser.user_metadata?.last_name || 'Nuevo',
      role_id: adminRole.id,
      doc_number: authUser.user_metadata?.doc_number || `SYNC-${authId.slice(0, 5)}`,
      doc_type: authUser.user_metadata?.doc_type || 'Cédula de Ciudadanía',
    };

    // Upsert employee data
    const { data: newProfile, error: upsertError } = await supabase
      .from('employees')
      .upsert(syncData, { onConflict: 'auth_id' })
      .select('*, role:roles(*)')
      .maybeSingle();

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    return newProfile;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AuthErrorType.NETWORK_ERROR);
  }
};

/**
 * Gets all employees (for admin purposes)
 */
export const getAllEmployees = async (): Promise<EmployeeWithRole[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, role:roles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AuthErrorType.NETWORK_ERROR);
  }
};

/**
 * Updates employee profile
 */
export const updateEmployeeProfile = async (
  employeeId: string, 
  updates: Partial<EmployeeWithRole>
): Promise<EmployeeWithRole | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select('*, role:roles(*)')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AuthErrorType.NETWORK_ERROR);
  }
};