import axiosInstance from "../axios/axiosInstance";
import type {
  Job,
  JobApplication,
  JobApplicationStatusUpdatePayload,
  JobCreatePayload,
  JobStatus,
  JobUpdatePayload,
} from "@/types/job";

export const getOrganizationJobs = async (
  organizationId: string,
  status?: JobStatus,
): Promise<Job[]> => {
  const response = await axiosInstance.get<Job[]>(
    `/jobs/organization/${organizationId}`,
    { params: status ? { status } : undefined },
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

export const deleteJob = async (jobId: string): Promise<Job> => {
  const response = await axiosInstance.delete<Job>(`/jobs/${jobId}`);
  return response.data;
};

export const getJobApplications = async (
  jobId: string,
  sort: "rank" | "created_at" = "rank",
): Promise<JobApplication[]> => {
  const response = await axiosInstance.get<JobApplication[]>(
    `/jobs/${jobId}/applications`,
    { params: { sort } },
  );
  return response.data;
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
