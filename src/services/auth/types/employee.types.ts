import { Employee } from '@/types';

export interface EmployeeWithRole extends Employee {
  role: {
    name: string;
  };
}

export interface SyncProfileData {
  auth_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  doc_number: string;
  doc_type: string;
}

export interface EmployeeApiResponse {
  data: EmployeeWithRole | null;
  error: any | null;
}

export interface RoleData {
  id: string;
  name?: string;
}

export interface AdminRoleResponse {
  data: RoleData | null;
  error: any | null;
}