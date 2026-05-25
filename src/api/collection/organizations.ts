import axiosInstance from "../axios/axiosInstance";
import type { CreateOrganizationPayload } from "@/types/organization";

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

//Get all organizations
export const getOrganizations = async () => {
    const response = await axiosInstance.get(`/organizations`);
    return response.data;
  };

//Get organization by id