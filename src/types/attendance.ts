export type AttendanceDayStatus =
  | "checked_in"
  | "present"
  | "on_leave"
  | "absent"
  | "non_working";

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  work_date: string;
  check_in_at: string;
  check_out_at: string | null;
  checkout_completed_by_user_id: string | null;
  checkout_completion_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceDay {
  date: string;
  status: AttendanceDayStatus;
  attendance_id: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
}

export interface AttendanceEmployeeSummary {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
}

export interface AttendanceRosterItem extends AttendanceDay {
  employee: AttendanceEmployeeSummary;
}

export interface AttendanceHistoryParams {
  start_date?: string;
  end_date?: string;
}

export interface CompleteCheckoutPayload {
  reason: string;
}

export type AttendanceDayRow = AttendanceDay & {
  key: string;
  dateLabel: string;
  checkInLabel: string;
  checkOutLabel: string;
  workingHours: string;
  statusLabel: string;
};

export type AttendanceRosterRow = AttendanceRosterItem & {
  key: string;
  employeeName: string;
  checkInLabel: string;
  checkOutLabel: string;
  workingHours: string;
  statusLabel: string;
};
