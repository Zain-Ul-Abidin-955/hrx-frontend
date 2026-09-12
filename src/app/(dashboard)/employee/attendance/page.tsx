"use client";

import React, { useMemo } from "react";
import { Button, Card, Col, DatePicker, Row, Tag, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import dayjs, { type Dayjs } from "dayjs";
import MyTable from "@/components/table/MyTable";
import { LoadingSpinner } from "@/components/loader/Loading";
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
        <span className="font-semibold text-gray-800">{date}</span>
      ),
    },
    {
      title: "Check-In",
      dataIndex: "checkInLabel",
      key: "checkInLabel",
      render: (time: string) =>
        time === "—" ? <Tag color="red">Missing</Tag> : time,
    },
    {
      title: "Check-Out",
      dataIndex: "checkOutLabel",
      key: "checkOutLabel",
      render: (time: string) =>
        time === "—" ? <Tag color="red">Missing</Tag> : time,
    },
    {
      title: "Working Hours",
      dataIndex: "workingHours",
      key: "workingHours",
      render: (hours: string) => (
        <span className="font-semibold text-gray-800">{hours}</span>
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Attendance</h1>
          <p className="text-gray-600 mt-1">
            Mark your daily attendance and view history
          </p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Attendance</h1>
          <p className="text-gray-600 mt-1">
            Mark your daily attendance and view history
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* <DatePicker.RangePicker
            value={range}
            allowClear={false}
            disabledDate={(current) => current != null && current.isAfter(dayjs(), "day")}
            onChange={(values) => {
              if (!values?.[0] || !values?.[1]) return;
              setRange([values[0], values[1]]);
            }}
            className="w-full sm:w-auto"
          /> */}
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<LoginOutlined />}
              size="large"
              className="attendance-action-btn !bg-primaryColor"
              loading={isCheckingIn}
              disabled={!canCheckIn || isCheckingOut}
              onClick={() => doCheckIn()}
            >
              Check In
            </Button>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              size="large"
              className="attendance-action-btn !bg-primaryColor"
              loading={isCheckingOut}
              disabled={!canCheckOut || isCheckingIn}
              onClick={() => doCheckOut()}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Today Status</p>
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {todayStatusLabel}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircleOutlined className="text-3xl text-green-600" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Check-In</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatAttendanceTime(todayRecord?.check_in_at)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <LoginOutlined className="text-3xl text-blue-600" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Check-Out</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatAttendanceTime(todayRecord?.check_out_at)}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <LogoutOutlined className="text-3xl text-orange-600" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">This Range</p>
                <p className="text-2xl font-bold text-gray-800">
                  {presentDays + checkedInDays} days
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {absentDays} absent
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <CalendarOutlined className="text-3xl text-primaryColor" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* <Card className="border-primaryColor/10">
        <div className="flex items-start gap-4">
          <div className="bg-primaryColor/10 p-3 rounded-lg">
            <ClockCircleOutlined className="text-2xl text-primaryColor" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Attendance Tip
            </h3>
            <p className="text-gray-600 mt-1">
              Self check-out is available within 24 hours of check-in. After that,
              HR must complete your checkout.
            </p>
          </div>
        </div>
      </Card> */}

      <MyTable<AttendanceDayRow>
        title="Attendance History"
        searchPlaceholder="Search by date or status..."
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        searchKeys={["dateLabel", "statusLabel", "checkInLabel", "checkOutLabel"]}
        paginationConfig={{ pageSize: 7 }}
        scroll={{ x: 900 }}
        locale={{
          emptyText: isError
            ? "Failed to load attendance. Please try again."
            : "No attendance records found",
        }}
      />
    </div>
  );
};

export default EmployeeAttendancePage;
