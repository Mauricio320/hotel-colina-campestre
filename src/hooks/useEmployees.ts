import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi, FetchEmployeesByRole } from "@/services/employees/employeeApi";
import { Employee } from "@/types";

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.fetchEmployees(),
  });

  const fetchEmployeesByRole = async (roleName: string): Promise<Employee[]> => {
    return employeeApi.fetchEmployeesByRole(roleName);
  };

  const createEmployee = useMutation({
    mutationFn: (employeeData: Partial<Employee>) => employeeApi.createEmployee(employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return { employeesQuery, createEmployee, fetchEmployeesByRole };
};

export const useEmployeesByRole = (roleName: string) => {
  return useQuery({
    queryKey: ["employees", "role", roleName],
    queryFn: () => employeeApi.fetchEmployeesByRole(roleName),
    enabled: !!roleName,
  });
};

export { FetchEmployeesByRole };
