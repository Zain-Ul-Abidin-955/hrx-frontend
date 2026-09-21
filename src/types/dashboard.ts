import type { JobApplicationStatus } from "@/types/job";
import type { LeaveStatus, LeaveType } from "@/types/leave";

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  attendance_rate: number;
  on_leave_today: number;
  new_hires_this_month: number;
}

export interface DashboardMonthlyApplications {
  month: string;
  count: number;
}

export interface DashboardPipelineItem {
  status: JobApplicationStatus;
  count: number;
}

export interface DashboardDesignationItem {
  designation: string;
  count: number;
}

export interface DashboardActivityItem {
  id: string;
  user: string;
  action: string;
  occurred_at: string;
}

export interface DashboardPendingLeave {
  id: string;
  employee: string;
  designation: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
}

export interface OrganizationDashboard {
  stats: DashboardStats;
  monthly_applications: DashboardMonthlyApplications[];
  application_pipeline: DashboardPipelineItem[];
  open_roles: number;
  designation_distribution: DashboardDesignationItem[];
  recent_activity: DashboardActivityItem[];
  pending_leaves: DashboardPendingLeave[];
}
