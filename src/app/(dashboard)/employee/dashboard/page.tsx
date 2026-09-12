"use client";

import React, { useMemo } from "react";
import { Button, Card, Col, Row, Tag } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
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
        <span className="font-semibold text-gray-800">{value}</span>
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
        <Tag color="blue" className="capitalize">
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Your attendance and leave overview</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  const todayStatus = todayAttendance
    ? formatAttendanceStatus(todayAttendance.status)
    : "Not recorded";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {displayName}
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of your attendance and leave this month
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/employee/attendance">
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              size="large"
              className="!bg-primaryColor"
            >
              Attendance
            </Button>
          </Link>
          <Link href="/employee/leaves">
            <Button icon={<FileTextOutlined />} size="large">
              Leaves
            </Button>
          </Link>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Today</p>
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {todayStatus}
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
                <p className="text-gray-500 text-sm mb-1">Present This Month</p>
                <p className="text-3xl font-bold text-gray-800">
                  {attendanceStats.present + attendanceStats.checkedIn}
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
                <p className="text-gray-500 text-sm mb-1">Absent This Month</p>
                <p className="text-3xl font-bold text-gray-800">
                  {attendanceStats.absent}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <LogoutOutlined className="text-3xl text-red-600" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-800">
                  {leaveStats.pending}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <ClockCircleOutlined className="text-3xl text-orange-600" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center h-full">
            <p className="text-gray-500 text-sm mb-1">Approved Leaves</p>
            <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center h-full">
            <p className="text-gray-500 text-sm mb-1">Rejected Leaves</p>
            <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center h-full">
            <p className="text-gray-500 text-sm mb-1">On Leave Days (Month)</p>
            <p className="text-3xl font-bold text-purple-600">
              {attendanceStats.onLeave}
            </p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <MyTable<AttendanceDayRow>
            title="Recent Attendance"
            showSearch={false}
            columns={attendanceColumns}
            dataSource={recentAttendance}
            paginationConfig={{ pageSize: 5 }}
            scroll={{ x: 600 }}
            locale={{ emptyText: "No attendance records this month" }}
          />
        </Col>
        <Col xs={24} lg={12}>
          <MyTable<LeaveRequestRow>
            title="Recent Leave Requests"
            showSearch={false}
            columns={leaveColumns}
            dataSource={recentLeaves}
            paginationConfig={{ pageSize: 5 }}
            scroll={{ x: 600 }}
            locale={{ emptyText: "No leave requests yet" }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboardPage;
