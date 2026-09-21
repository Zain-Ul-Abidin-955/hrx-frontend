"use client";

import React, { useMemo } from "react";
import { Button, Tag } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import MyTable from "@/components/table/MyTable";
import { LoadingSpinner } from "@/components/loader/Loading";
import { getMyAttendance } from "@/api/collection/attendance";
import { getMyLeaves } from "@/api/collection/leaves";
import useUserStore from "@/store/userStore";
import { getUserDisplayName } from "@/utils/profileHelpers";
import {
  formatAttendanceDate,
  formatAttendanceStatus,
  formatAttendanceTime,
  formatWorkingHours,
  getAttendanceStatusColor,
  isSameApiDate,
  toApiDate,
} from "@/utils/attendanceHelpers";
import {
  getLeaveStatusColor,
  mapLeaveToRow,
} from "@/utils/leaveHelpers";
import type { AttendanceDayRow } from "@/types/attendance";
import type { LeaveRequestRow } from "@/types/leave";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import Panel from "@/components/dashboard/Panel";

const EmployeeDashboardPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const displayName = getUserDisplayName(user) || "Employee";

  const monthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start_date: toApiDate(start),
      end_date: toApiDate(now),
    };
  }, []);

  const {
    data: attendance = [],
    isLoading: isLoadingAttendance,
  } = useQuery({
    queryKey: ["my-attendance", "dashboard", monthRange],
    queryFn: () => getMyAttendance(monthRange),
  });

  const {
    data: leaves = [],
    isLoading: isLoadingLeaves,
  } = useQuery({
    queryKey: ["my-leaves", "dashboard"],
    queryFn: () => getMyLeaves(),
  });

  const todayAttendance = useMemo(
    () => attendance.find((item) => isSameApiDate(item.date)) ?? null,
    [attendance],
  );

  const attendanceStats = useMemo(() => {
    const present = attendance.filter((item) => item.status === "present").length;
    const checkedIn = attendance.filter((item) => item.status === "checked_in").length;
    const absent = attendance.filter((item) => item.status === "absent").length;
    const onLeave = attendance.filter((item) => item.status === "on_leave").length;
    return { present, checkedIn, absent, onLeave };
  }, [attendance]);

  const leaveStats = useMemo(() => {
    const pending = leaves.filter((item) => item.status === "pending").length;
    const approved = leaves.filter((item) => item.status === "approved").length;
    const rejected = leaves.filter((item) => item.status === "rejected").length;
    return { pending, approved, rejected, total: leaves.length };
  }, [leaves]);

  const recentAttendance = useMemo<AttendanceDayRow[]>(
    () =>
      [...attendance]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)
        .map((item) => ({
          ...item,
          key: `${item.date}-${item.attendance_id ?? item.status}`,
          dateLabel: formatAttendanceDate(item.date),
          checkInLabel: formatAttendanceTime(item.check_in_at),
          checkOutLabel: formatAttendanceTime(item.check_out_at),
          workingHours: formatWorkingHours(item.check_in_at, item.check_out_at),
          statusLabel: formatAttendanceStatus(item.status),
        })),
    [attendance],
  );

  const recentLeaves = useMemo<LeaveRequestRow[]>(
    () => leaves.slice(0, 5).map(mapLeaveToRow),
    [leaves],
  );

  const attendanceColumns: ColumnsType<AttendanceDayRow> = [
    {
      title: "Date",
      dataIndex: "dateLabel",
      key: "dateLabel",
      render: (value: string) => (
        <span className="font-semibold text-blackColor">{value}</span>
      ),
    },
    {
      title: "Check-In",
      dataIndex: "checkInLabel",
      key: "checkInLabel",
    },
    {
      title: "Check-Out",
      dataIndex: "checkOutLabel",
      key: "checkOutLabel",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_value, record) => (
        <Tag color={getAttendanceStatusColor(record.status)} className="capitalize">
          {record.statusLabel}
        </Tag>
      ),
    },
  ];

  const leaveColumns: ColumnsType<LeaveRequestRow> = [
    {
      title: "Type",
      dataIndex: "typeLabel",
      key: "typeLabel",
      render: (value: string) => (
        <Tag color="geekblue" className="capitalize">
          {value}
        </Tag>
      ),
    },
    {
      title: "From",
      dataIndex: "fromLabel",
      key: "fromLabel",
    },
    {
      title: "To",
      dataIndex: "toLabel",
      key: "toLabel",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_value, record) => (
        <Tag color={getLeaveStatusColor(record.status)} className="capitalize">
          {record.statusLabel}
        </Tag>
      ),
    },
  ];

  const isLoading = isLoadingAttendance || isLoadingLeaves;

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Welcome, {displayName}
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Your attendance and leave overview for this month.
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <LoadingSpinner />
      </div>
    );
  }

  const todayStatus = todayAttendance
    ? formatAttendanceStatus(todayAttendance.status)
    : "Not recorded";

  const stats: StatTileProps[] = [
    {
      label: "Today",
      value: todayStatus,
      icon: <CheckCircleOutlined />,
      caption: "current attendance status",
    },
    {
      label: "Present this month",
      value: attendanceStats.present + attendanceStats.checkedIn,
      icon: <LoginOutlined />,
      caption: "recorded working days",
    },
    {
      label: "Absent this month",
      value: attendanceStats.absent,
      icon: <LogoutOutlined />,
      caption: "days marked absent",
    },
    {
      label: "Pending leaves",
      value: leaveStats.pending,
      icon: <ClockCircleOutlined />,
      caption: "requests awaiting review",
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {pageHeading}
        <div className="flex gap-3">
          <Link href="/employee/attendance">
            <Button
              type="primary"
              icon={<CalendarOutlined />}
            >
              Attendance
            </Button>
          </Link>
          <Link href="/employee/leaves">
            <Button icon={<FileTextOutlined />}>
              Leaves
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
      </div>

      <Panel title="Leave overview" icon={<FileTextOutlined />}>
        <div className="grid divide-y divide-[#ECEEF3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Approved requests", leaveStats.approved],
            ["Rejected requests", leaveStats.rejected],
            ["Leave days this month", attendanceStats.onLeave],
          ].map(([label, value]) => (
            <div key={label} className="px-1 py-3 first:pt-0 last:pb-0 sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0">
              <p className="text-xs text-darkGrayColor">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-blackColor">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
          <MyTable<AttendanceDayRow>
            title="Recent Attendance"
            variant="dashboard"
            showSearch={false}
            columns={attendanceColumns}
            dataSource={recentAttendance}
            paginationConfig={{ pageSize: 5 }}
            scroll={{ x: 600 }}
            locale={{ emptyText: <div className="flex flex-col items-center gap-2 py-7 text-grayColor"><InboxOutlined className="text-lg text-accentDeepColor" /><span>No attendance records this month</span></div> }}
          />
          <MyTable<LeaveRequestRow>
            title="Recent Leave Requests"
            variant="dashboard"
            showSearch={false}
            columns={leaveColumns}
            dataSource={recentLeaves}
            paginationConfig={{ pageSize: 5 }}
            scroll={{ x: 600 }}
            locale={{ emptyText: <div className="flex flex-col items-center gap-2 py-7 text-grayColor"><InboxOutlined className="text-lg text-accentDeepColor" /><span>No leave requests yet</span></div> }}
          />
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
