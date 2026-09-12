import axiosInstance from "../axios/axiosInstance";
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
} from "@/types/employee";

export const createEmployee = async (
  payload: EmployeeCreatePayload,
): Promise<Employee> => {
  const response = await axiosInstance.post<Employee>("/employees/", payload);
  return response.data;
};

export const getEmployees = async (
  includeInactive = false,
): Promise<Employee[]> => {
  const response = await axiosInstance.get<Employee[]>("/employees/", {
    params: { include_inactive: includeInactive },
  });
  return response.data;
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await axiosInstance.get<Employee>(`/employees/${id}`);
  return response.data;
};

export const updateEmployee = async (
  id: string,
  payload: EmployeeUpdatePayload,
): Promise<Employee> => {
  const response = await axiosInstance.put<Employee>(
    `/employees/${id}`,
    payload,
  );
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<Employee> => {
  const response = await axiosInstance.delete<Employee>(`/employees/${id}`);
  return response.data;
};
