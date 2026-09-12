import axiosInstance from "../axios/axiosInstance";
import type {
  AttendanceDay,
  AttendanceHistoryParams,
  AttendanceRecord,
  AttendanceRosterItem,
  CompleteCheckoutPayload,
} from "@/types/attendance";

export const checkInAttendance = async (): Promise<AttendanceRecord> => {
  const response = await axiosInstance.post<AttendanceRecord>(
    "/attendance/check-in",
  );
  return response.data;
};

export const checkOutAttendance = async (): Promise<AttendanceRecord> => {
  const response = await axiosInstance.post<AttendanceRecord>(
    "/attendance/check-out",
  );
  return response.data;
};

export const getMyAttendance = async (
  params?: AttendanceHistoryParams,
): Promise<AttendanceDay[]> => {
  const response = await axiosInstance.get<AttendanceDay[]>("/attendance/me", {
    params,
  });
  return response.data;
};

export const getDailyAttendance = async (
  date?: string,
): Promise<AttendanceRosterItem[]> => {
  const response = await axiosInstance.get<AttendanceRosterItem[]>(
    "/attendance",
    {
      params: date ? { date } : undefined,
    },
  );
  return response.data;
};

export const completeAttendanceCheckout = async (
  attendanceId: string,
  payload: CompleteCheckoutPayload,
): Promise<AttendanceRecord> => {
  const response = await axiosInstance.patch<AttendanceRecord>(
    `/attendance/${attendanceId}/complete-checkout`,
    payload,
  );
  return response.data;
};
