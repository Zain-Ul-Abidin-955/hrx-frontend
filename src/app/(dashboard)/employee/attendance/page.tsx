"use client";

import React, { useMemo } from "react";
import { Button, DatePicker, Tag, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import dayjs, { type Dayjs } from "dayjs";
import MyTable from "@/components/table/MyTable";
import { LoadingSpinner } from "@/components/loader/Loading";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import {
  checkInAttendance,
  checkOutAttendance,
  getMyAttendance,
} from "@/api/collection/attendance";
import type { AttendanceDayRow } from "@/types/attendance";
import {
  formatAttendanceDate,
  formatAttendanceStatus,
  formatAttendanceTime,
  formatWorkingHours,
  getAttendanceStatusColor,
  isSameApiDate,
  toApiDate,
} from "@/utils/attendanceHelpers";

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return (
      data.detail.map((item) => item?.msg).filter(Boolean).join(", ") ||
      fallback
    );
  }
  return fallback;
}

const EmployeeAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [range, setRange] = React.useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf("month"),
    dayjs(),
  ]);

  const historyParams = useMemo(
    () => ({
      start_date: toApiDate(range[0].toDate()),
      end_date: toApiDate(range[1].toDate()),
    }),
    [range],
  );

  const todayParams = useMemo(() => {
    const today = toApiDate(new Date());
    return { start_date: today, end_date: today };
  }, []);

  const {
    data: history = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["my-attendance", historyParams],
    queryFn: () => getMyAttendance(historyParams),
  });

  const { data: todayHistory = [] } = useQuery({
    queryKey: ["my-attendance", "today", todayParams],
    queryFn: () => getMyAttendance(todayParams),
  });

  const todayRecord = useMemo(
    () => todayHistory.find((item) => isSameApiDate(item.date)) ?? null,
    [todayHistory],
  );

  const presentDays = history.filter((item) => item.status === "present").length;
  const checkedInDays = history.filter(
    (item) => item.status === "checked_in",
  ).length;
  const absentDays = history.filter((item) => item.status === "absent").length;

  const canCheckIn =
    !todayRecord ||
    ["absent", "non_working"].includes(todayRecord.status);
  const canCheckOut = todayRecord?.status === "checked_in";

  const { mutate: doCheckIn, isPending: isCheckingIn } = useMutation({
    mutationFn: checkInAttendance,
    onSuccess: () => {
      message.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to check in."));
    },
  });

  const { mutate: doCheckOut, isPending: isCheckingOut } = useMutation({
    mutationFn: checkOutAttendance,
    onSuccess: () => {
      message.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to check out."));
    },
  });

  const tableData = useMemo<AttendanceDayRow[]>(
    () =>
      [...history]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((item) => ({
          ...item,
          key: `${item.date}-${item.attendance_id ?? item.status}`,
          dateLabel: formatAttendanceDate(item.date),
          checkInLabel: formatAttendanceTime(item.check_in_at),
          checkOutLabel: formatAttendanceTime(item.check_out_at),
          workingHours: formatWorkingHours(item.check_in_at, item.check_out_at),
          statusLabel: formatAttendanceStatus(item.status),
        })),
    [history],
  );

  const columns: ColumnsType<AttendanceDayRow> = [
    {
      title: "Date",
      dataIndex: "dateLabel",
      key: "dateLabel",
      render: (date: string) => (
        <span className="font-semibold text-blackColor">{date}</span>
      ),
    },
    {
      title: "Check-In",
      dataIndex: "checkInLabel",
      key: "checkInLabel",
      render: (time: string) =>
        time === "—" ? <Tag color="red">Missing</Tag> : <span className="font-medium text-secondaryTextColor">{time}</span>,
    },
    {
      title: "Check-Out",
      dataIndex: "checkOutLabel",
      key: "checkOutLabel",
      render: (time: string) =>
        time === "—" ? <Tag color="red">Missing</Tag> : <span className="font-medium text-secondaryTextColor">{time}</span>,
    },
    {
      title: "Working Hours",
      dataIndex: "workingHours",
      key: "workingHours",
      render: (hours: string) => (
        <span className="font-semibold tabular-nums text-blackColor">{hours}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_status, record) => (
        <Tag color={getAttendanceStatusColor(record.status)} className="capitalize">
          {record.statusLabel}
        </Tag>
      ),
    },
  ];

  const todayStatusLabel = todayRecord
    ? formatAttendanceStatus(todayRecord.status)
    : "Not recorded";

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        My attendance
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Mark today&apos;s attendance and review your working history.
      </p>
    </div>
  );

  const stats: StatTileProps[] = [
    {
      label: "Today",
      value: todayStatusLabel,
      icon: <CheckCircleOutlined />,
      caption: "current attendance status",
    },
    {
      label: "Check in",
      value: formatAttendanceTime(todayRecord?.check_in_at),
      icon: <LoginOutlined />,
      caption: "today's start time",
    },
    {
      label: "Check out",
      value: formatAttendanceTime(todayRecord?.check_out_at),
      icon: <LogoutOutlined />,
      caption: "today's end time",
    },
    {
      label: "Present in range",
      value: presentDays + checkedInDays,
      icon: <CalendarOutlined />,
      caption: `${absentDays} absent ${absentDays === 1 ? "day" : "days"}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {pageHeading}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <DatePicker.RangePicker
            value={range}
            allowClear={false}
            disabledDate={(current) => current != null && current.isAfter(dayjs(), "day")}
            onChange={(values) => {
              if (!values?.[0] || !values?.[1]) return;
              setRange([values[0], values[1]]);
            }}
            className="w-full sm:w-auto"
          />
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<LoginOutlined />}
              className="attendance-action-btn"
              loading={isCheckingIn}
              disabled={!canCheckIn || isCheckingOut}
              onClick={() => doCheckIn()}
            >
              Check In
            </Button>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              className="attendance-action-btn"
              loading={isCheckingOut}
              disabled={!canCheckOut || isCheckingIn}
              onClick={() => doCheckOut()}
            >
              Check Out
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
      </div>

      <MyTable<AttendanceDayRow>
        title="Attendance History"
        variant="dashboard"
        searchPlaceholder="Search by date or status..."
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        searchKeys={["dateLabel", "statusLabel", "checkInLabel", "checkOutLabel"]}
        paginationConfig={{ pageSize: 7 }}
        scroll={{ x: 900 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor"><InboxOutlined /></span>
              <p className="text-sm font-medium text-blackColor">{isError ? "Could not load attendance" : "No attendance records found"}</p>
              <p className="text-xs text-grayColor">{isError ? "Try again in a moment." : "Attendance for the selected range will appear here."}</p>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default EmployeeAttendancePage;
