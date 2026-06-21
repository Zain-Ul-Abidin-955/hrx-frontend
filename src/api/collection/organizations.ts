import axiosInstance from "../axios/axiosInstance";
import type {
  CreateOrganizationPayload,
  Organization,
  OrganizationApplication,
  OrganizationApplicationStatus,
} from "@/types/organization";

// Create organization application
export const createOrganization = async (
  organizationData: CreateOrganizationPayload,
) => {
  const response = await axiosInstance.post(
    `/organizations/applications`,
    organizationData,
  );
  return response.data;
};

// Get all organization applications
export const getOrganizationsApplications = async (): Promise<
  OrganizationApplication[]
> => {
  const response = await axiosInstance.get<OrganizationApplication[]>(
    `/organizations/applications`,
  );
  return response.data;
};

export const approveOrganizationApplication = async (
  id: string,
): Promise<Organization> => {
  const response = await axiosInstance.put<Organization>(
    `/organizations/applications/${id}/approve`,
  );
  return response.data;
};

export const rejectOrganizationApplication = async (
  id: string,
): Promise<Organization> => {
  const response = await axiosInstance.get<Organization>(
    `/organizations/applications/${id}/reject`,
  );
  return response.data;
};

export const updateOrganizationApplicationStatus = async (
  id: string,
  status: Extract<OrganizationApplicationStatus, "approved" | "rejected">,
): Promise<Organization> => {
  if (status === "approved") {
    return approveOrganizationApplication(id);
  }
  return rejectOrganizationApplication(id);
};
