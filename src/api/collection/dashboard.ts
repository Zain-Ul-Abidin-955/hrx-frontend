import axiosInstance from "../axios/axiosInstance";
import type { OrganizationDashboard } from "@/types/dashboard";

export const getOrganizationDashboard = async (): Promise<OrganizationDashboard> => {
  const response = await axiosInstance.get<OrganizationDashboard>(
    "/dashboard/organization",
  );
  return response.data;
};
