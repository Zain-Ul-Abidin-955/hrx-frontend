import axiosInstance from "../axios/axiosInstance";
import type {
  CreateOrganizationPayload,
  Organization,
  OrganizationApplication,
  UpdateOrganizationPayload,
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
): Promise<OrganizationApplication> => {
  const response = await axiosInstance.put<OrganizationApplication>(
    `/organizations/applications/${id}/approve`,
  );
  return response.data;
};  

export const rejectOrganizationApplication = async (
  id: string,
): Promise<OrganizationApplication> => {
  const response = await axiosInstance.put<OrganizationApplication>(
    `/organizations/applications/${id}/discard`,
  );
  return response.data;
};

// Get all organizations
export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await axiosInstance.get<Organization[]>(
    `/organizations`,
  );
  return response.data;
};

// Get organization by id
export const getOrganizationById = async (id: string): Promise<Organization> => {
  const response = await axiosInstance.get<Organization>(
    `/organizations/${id}`,
  );
  return response.data;
};

// Update organization
export const updateOrganization = async (
  id: string,
  organizationData: UpdateOrganizationPayload,
): Promise<Organization> => {
  const response = await axiosInstance.put<Organization>(
    `/organizations/${id}`,
    organizationData,
  );
  return response.data;
};

// Delete organization
export const deleteOrganization = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/organizations/${id}`);
};