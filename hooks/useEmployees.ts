
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Employee } from '../types';

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*, role:roles(*)').order('last_name');
      if (error) throw error;
      return data as Employee[];
    },
  });

  const fetchEmployeesByRole = async (roleName: string) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, role:roles!inner(*)')
      .eq('role.name', roleName);
    if (error) throw error;
    return data as Employee[];
  };

  const createEmployee = useMutation({
    mutationFn: async (employeeData: any) => {
      const { data, error } = await supabase.from('employees').insert(employeeData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return { employeesQuery, createEmployee, fetchEmployeesByRole };
};
