export type LeaveType = "sick" | "casual" | "annual" | "unpaid";

export type LeaveStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export type LeaveStatusUpdateValue = "approved" | "rejected" | "withdrawn";

export interface LeaveEmployeeSummary {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
}

export interface LeaveRequest {
  id: string;
  organization_id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  status_changed_by_user_id: string | null;
  status_changed_at: string | null;
  status_reason: string | null;
  created_at: string;
  updated_at: string;
  employee: LeaveEmployeeSummary;
}

export interface LeaveRequestCreatePayload {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface LeaveStatusUpdatePayload {
  status: LeaveStatusUpdateValue;
  reason?: string | null;
}

export interface LeaveListParams {
  status?: LeaveStatus;
  employee_id?: string;
}

export type LeaveRequestRow = LeaveRequest & {
  key: string;
  employeeName: string;
  designation: string;
  typeLabel: string;
  fromLabel: string;
  toLabel: string;
  days: number;
  statusLabel: string;
};
