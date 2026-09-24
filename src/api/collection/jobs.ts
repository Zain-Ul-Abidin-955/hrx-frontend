import axiosInstance from "../axios/axiosInstance";
import type {
  Job,
  JobApplication,
  JobApplicationStatusUpdatePayload,
  JobCreatePayload,
  JobUpdatePayload,
} from "@/types/job";

export const getOrganizationJobs = async (
  organizationId: string,
  isActive?: boolean,
): Promise<Job[]> => {
  const response = await axiosInstance.get<Job[]>(
    `/jobs/organization/${organizationId}`,
    { params: isActive == null ? undefined : { is_active: isActive } },
  );
  return response.data;
};

export const createJob = async (payload: JobCreatePayload): Promise<Job> => {
  const response = await axiosInstance.post<Job>("/jobs/", payload);
  return response.data;
};

export const updateJob = async (
  jobId: string,
  payload: JobUpdatePayload,
): Promise<Job> => {
  const response = await axiosInstance.put<Job>(`/jobs/${jobId}`, payload);
  return response.data;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await axiosInstance.delete(`/jobs/${jobId}`);
};

export const getJobApplications = async (
  jobId: string,
  sort: "rank" | "created_at" = "rank",
): Promise<JobApplication[]> => {
  const response = await axiosInstance.get<JobApplication[] | { items?: JobApplication[]; data?: JobApplication[] }>(
    `/jobs/${jobId}/applications`,
    { params: { sort } },
  );
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const rerankJobApplications = async (
  jobId: string,
): Promise<JobApplication[]> => {
  const response = await axiosInstance.post<
    JobApplication[] | { items?: JobApplication[]; data?: JobApplication[] }
  >(`/jobs/${jobId}/applications/rerank`);
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getJobApplication = async (
  applicationId: string,
): Promise<JobApplication> => {
  const response = await axiosInstance.get<JobApplication>(
    `/jobs/applications/${applicationId}`,
  );
  return response.data;
};

export const updateJobApplicationStatus = async (
  applicationId: string,
  payload: JobApplicationStatusUpdatePayload,
): Promise<JobApplication> => {
  const response = await axiosInstance.put<JobApplication>(
    `/jobs/applications/${applicationId}/status`,
    payload,
  );
  return response.data;
};

export const deleteJobApplication = async (
  applicationId: string,
): Promise<void> => {
  await axiosInstance.delete(`/jobs/applications/${applicationId}`);
};
