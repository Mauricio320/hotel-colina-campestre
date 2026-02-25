import { supabase } from "@/config/supabase";
import { Employee } from "@/types";

export const employeeApi = {
  fetchEmployees: async (): Promise<Employee[]> => {
    const { data, error } = await supabase
      .from("employees")
      .select("*, role:roles(*)")
      .eq("active", true)
      .order("last_name");

    if (error) throw new Error(error.message);
    return data || [];
  },

  fetchEmployeesByRole: async (roleName: string): Promise<Employee[]> => {
    const { data, error } = await supabase
      .from("employees")
      .select("*, role:roles!inner(*)")
      .eq("role.name", roleName);

    if (error) throw new Error(error.message);
    return data || [];
  },

  createEmployee: async (employeeData: Partial<Employee>): Promise<Employee> => {
    const { data, error } = await supabase
      .from("employees")
      .upsert(employeeData, { onConflict: "doc_number" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const FetchEmployeesByRole = async (roleName: string): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("employees")
    .select("*, role:roles!inner(*)")
    .eq("role.name", roleName);

  if (error) throw error;
  return data as Employee[];
};
