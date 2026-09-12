import type { LeaveRequest, LeaveRequestRow, LeaveStatus, LeaveType } from "@/types/leave";
import { formatAttendanceDate, toApiDate } from "@/utils/attendanceHelpers";

export const LEAVE_TYPE_OPTIONS: { label: string; value: LeaveType }[] = [
  { label: "Annual", value: "annual" },
  { label: "Sick", value: "sick" },
  { label: "Casual", value: "casual" },
  { label: "Unpaid", value: "unpaid" },
];

export const LEAVE_STATUS_FILTER_OPTIONS: {
  label: string;
  value: LeaveStatus | "all";
}[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export function formatLeaveType(type: LeaveType | string): string {
  return type.replace(/_/g, " ");
}

export function formatLeaveStatus(status: LeaveStatus | string): string {
  return status.replace(/_/g, " ");
}

export function getLeaveStatusColor(status: LeaveStatus): string {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "withdrawn":
      return "default";
    case "pending":
    default:
      return "orange";
  }
}

export function countLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : 0;
}

export function mapLeaveToRow(item: LeaveRequest): LeaveRequestRow {
  const employeeName = `${item.employee?.first_name ?? ""} ${item.employee?.last_name ?? ""}`.trim();
  return {
    ...item,
    key: item.id,
    employeeName: employeeName || "—",
    designation: item.employee?.designation ?? "—",
    typeLabel: formatLeaveType(item.leave_type),
    fromLabel: formatAttendanceDate(item.start_date),
    toLabel: formatAttendanceDate(item.end_date),
    days: countLeaveDays(item.start_date, item.end_date),
    statusLabel: formatLeaveStatus(item.status),
  };
}

export function toLeaveApiDate(value: Date | string): string {
  return toApiDate(value);
}
