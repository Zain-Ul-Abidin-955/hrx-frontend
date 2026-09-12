export type EmployeeRole = "employee" | "hr_manager";

export interface EmployeeUser {
  id: string;
  email: string;
  role: EmployeeRole;
  is_active: boolean;
  is_verified: boolean;
}

export interface Employee {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  designation: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: EmployeeUser;
}

export type EmployeeRow = Employee & {
  key: string;
  full_name: string;
  email: string;
};

export interface EmployeeCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  designation: string;
  role?: EmployeeRole;
}

export interface EmployeeUpdatePayload {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  designation?: string | null;
  role?: EmployeeRole | null;
  is_active?: boolean | null;
}
