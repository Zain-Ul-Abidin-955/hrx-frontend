import axiosInstance from "../axios/axiosInstance";
import type {
  LeaveListParams,
  LeaveRequest,
  LeaveRequestCreatePayload,
  LeaveStatusUpdatePayload,
} from "@/types/leave";

export const createLeave = async (
  payload: LeaveRequestCreatePayload,
): Promise<LeaveRequest> => {
  const response = await axiosInstance.post<LeaveRequest>("/leaves", payload);
  return response.data;
};

export const getMyLeaves = async (
  params?: LeaveListParams,
): Promise<LeaveRequest[]> => {
  const response = await axiosInstance.get<LeaveRequest[]>("/leaves/me", {
    params: params?.status ? { status: params.status } : undefined,
  });
  return response.data;
};

export const withdrawLeave = async (leaveId: string): Promise<LeaveRequest> => {
  const response = await axiosInstance.post<LeaveRequest>(
    `/leaves/${leaveId}/withdraw`,
  );
  return response.data;
};

export const updateLeaveStatus = async (
  leaveId: string,
  payload: LeaveStatusUpdatePayload,
): Promise<LeaveRequest> => {
  const response = await axiosInstance.patch<LeaveRequest>(
    `/leaves/${leaveId}/status`,
    payload,
  );
  return response.data;
};

export const getOrganizationLeaves = async (
  params?: LeaveListParams,
): Promise<LeaveRequest[]> => {
  const response = await axiosInstance.get<LeaveRequest[]>("/leaves", {
    params: {
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.employee_id ? { employee_id: params.employee_id } : {}),
    },
  });
  return response.data;
};
