import axiosInstance from "../axios/axiosInstance";
import type {
  JobApplicationCreatePayload,
  PublicJob,
  PublicJobApplicationResponse,
  PublicResumeParseResponse,
} from "@/types/job";

export const getPublicJobs = async (): Promise<PublicJob[]> => {
  const response = await axiosInstance.get<PublicJob[]>("/public/jobs");
  return response.data;
};

export const getPublicOrganizationJobs = async (
  organizationSlug: string,
): Promise<PublicJob[]> => {
  const response = await axiosInstance.get<PublicJob[]>(
    `/public/organizations/${encodeURIComponent(organizationSlug)}/jobs`,
  );
  return response.data;
};

export const getPublicJob = async (
  organizationSlug: string,
  jobSlug: string,
): Promise<PublicJob> => {
  const response = await axiosInstance.get<PublicJob>(
    `/public/organizations/${encodeURIComponent(organizationSlug)}/jobs/${encodeURIComponent(jobSlug)}`,
  );
  return response.data;
};

export const parsePublicJobResume = async (
  organizationSlug: string,
  jobSlug: string,
  resume: File,
): Promise<PublicResumeParseResponse> => {
  const formData = new FormData();
  formData.append("resume", resume);
  const response = await axiosInstance.post<PublicResumeParseResponse>(
    `/public/organizations/${encodeURIComponent(organizationSlug)}/jobs/${encodeURIComponent(jobSlug)}/applications/parse-resume`,
    formData,
  );
  return response.data;
};

export const submitPublicJobApplication = async (
  organizationSlug: string,
  jobSlug: string,
  payload: JobApplicationCreatePayload,
): Promise<PublicJobApplicationResponse> => {
  const response = await axiosInstance.post<PublicJobApplicationResponse>(
    `/public/organizations/${encodeURIComponent(organizationSlug)}/jobs/${encodeURIComponent(jobSlug)}/applications`,
    payload,
  );
  return response.data;
};
