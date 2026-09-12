"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Tag,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  SaveOutlined,
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
  completeAttendanceCheckout,
  getDailyAttendance,
  getMyAttendance,
} from "@/api/collection/attendance";
import type { AttendanceRosterRow } from "@/types/attendance";
import useUserStore from "@/store/userStore";
import { getNameInitial } from "@/utils/getNameInitial";
import {
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

const OrganizationAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const canManageRoster =
    user?.role === "hr_manager" || user?.role === "org_admin";
  const canSelfAttend = user?.role === "hr_manager";
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [completeTarget, setCompleteTarget] =
    useState<AttendanceRosterRow | null>(null);
  const [completeForm] = Form.useForm<{ reason: string }>();

  const apiDate = toApiDate(selectedDate.toDate());

  const {
    data: roster = [],
    isLoading,
    isError,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["daily-attendance", apiDate],
    queryFn: () => getDailyAttendance(apiDate),
    enabled: canManageRoster,
  });

  const { data: myHistory = [] } = useQuery({
    queryKey: ["my-attendance", "today-summary"],
    queryFn: () =>
      getMyAttendance({
        start_date: toApiDate(new Date()),
        end_date: toApiDate(new Date()),
      }),
    enabled: canSelfAttend,
  });

  const todayMine = useMemo(
    () => myHistory.find((item) => isSameApiDate(item.date)) ?? null,
    [myHistory],
  );

  const canCheckIn =
    canSelfAttend &&
    (!todayMine || ["absent", "non_working"].includes(todayMine.status));
  const canCheckOut = canSelfAttend && todayMine?.status === "checked_in";

  const stats = useMemo(() => {
    const present = roster.filter((item) => item.status === "present").length;
    const checkedIn = roster.filter((item) => item.status === "checked_in").length;
    const absent = roster.filter((item) => item.status === "absent").length;
    const onLeave = roster.filter((item) => item.status === "on_leave").length;
    return [
      {
        title: "Present",
        value: String(present),
        icon: <CheckCircleOutlined className="text-3xl text-green-600" />,
        bgColor: "bg-green-50",
      },
      {
        title: "Checked In",
        value: String(checkedIn),
        icon: <ClockCircleOutlined className="text-3xl text-blue-600" />,
        bgColor: "bg-blue-50",
      },
      {
        title: "Absent",
        value: String(absent),
        icon: <CloseCircleOutlined className="text-3xl text-red-600" />,
        bgColor: "bg-red-50",
      },
      {
        title: "On Leave",
        value: String(onLeave),
        icon: <CalendarOutlined className="text-3xl text-purple-600" />,
        bgColor: "bg-purple-50",
      },
    ];
  }, [roster]);

  const { mutate: doCheckIn, isPending: isCheckingIn } = useMutation({
    mutationFn: checkInAttendance,
    onSuccess: () => {
      message.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["daily-attendance"] });
    },
    onError: (err) => {
      message.error(getErrorMessage(err, "Failed to check in."));
    },
  });

  const { mutate: doCheckOut, isPending: isCheckingOut } = useMutation({
    mutationFn: checkOutAttendance,
    onSuccess: () => {
      message.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["daily-attendance"] });
    },
    onError: (err) => {
      message.error(getErrorMessage(err, "Failed to check out."));
    },
  });

  const { mutate: completeCheckout, isPending: isCompleting } = useMutation({
    mutationFn: ({
      attendanceId,
      reason,
    }: {
      attendanceId: string;
      reason: string;
    }) => completeAttendanceCheckout(attendanceId, { reason }),
    onSuccess: () => {
      message.success("Checkout completed successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-attendance"] });
      setCompleteTarget(null);
      completeForm.resetFields();
    },
    onError: (err) => {
      message.error(getErrorMessage(err, "Failed to complete checkout."));
    },
  });

  const tableData = useMemo<AttendanceRosterRow[]>(
    () =>
      roster.map((item) => {
        const employeeName = `${item.employee.first_name} ${item.employee.last_name}`.trim();
        return {
          ...item,
          key: item.employee.id,
          employeeName,
          checkInLabel: formatAttendanceTime(item.check_in_at),
          checkOutLabel: formatAttendanceTime(item.check_out_at),
          workingHours: formatWorkingHours(item.check_in_at, item.check_out_at),
          statusLabel: formatAttendanceStatus(item.status),
        };
      }),
    [roster],
  );

  const columns: ColumnsType<AttendanceRosterRow> = useMemo(
    () => [
      {
        title: "Employee",
        key: "employee",
        render: (_value, record) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primaryColor text-white font-semibold shrink-0">
              {getNameInitial(record.employeeName)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{record.employeeName}</p>
              <p className="text-xs text-gray-500">{record.employee.designation}</p>
            </div>
          </div>
        ),
      },
      {
        title: "Check-In",
        dataIndex: "checkInLabel",
        key: "checkInLabel",
        render: (time: string) =>
          time === "—" ? <Tag color="red">Missing</Tag> : (
            <span className="text-gray-700 font-medium">{time}</span>
          ),
      },
      {
        title: "Check-Out",
        dataIndex: "checkOutLabel",
        key: "checkOutLabel",
        render: (time: string) =>
          time === "—" ? <Tag color="red">Missing</Tag> : (
            <span className="text-gray-700 font-medium">{time}</span>
          ),
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
          <Tag
            color={getAttendanceStatusColor(record.status)}
            className="capitalize"
          >
            {record.statusLabel}
          </Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: 180,
        render: (_value, record) => {
          const canComplete =
            record.status === "checked_in" && Boolean(record.attendance_id);

          if (!canComplete) {
            return <span className="text-gray-400 text-sm">—</span>;
          }

          return (
            <Button
              type="link"
              className="!text-primaryColor !px-0"
              onClick={() => {
                completeForm.resetFields();
                setCompleteTarget(record);
              }}
            >
              Complete Checkout
            </Button>
          );
        },
      },
    ],
    [completeForm],
  );

  if (!canManageRoster) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <Card>
          <p className="text-gray-600">
            You do not have permission to view the attendance roster.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance
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
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <DatePicker
            value={selectedDate}
            allowClear={false}
            disabledDate={(current) =>
              current != null && current.isAfter(dayjs(), "day")
            }
            onChange={(value) => {
              if (value) setSelectedDate(value);
            }}
            className="w-full sm:w-auto"
          />
          {canSelfAttend && (
            <div className="flex gap-3">
              <Button
                type="primary"
                icon={<LoginOutlined />}
                size="large"
                className="!bg-primaryColor"
                loading={isCheckingIn}
                disabled={!canCheckIn || isCheckingOut}
                onClick={() => doCheckIn()}
              >
                My Check In
              </Button>
              <Button
                icon={<LogoutOutlined />}
                size="large"
                loading={isCheckingOut}
                disabled={!canCheckOut || isCheckingIn}
                onClick={() => doCheckOut()}
              >
                My Check Out
              </Button>
            </div>
          )}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <MyTable<AttendanceRosterRow>
        title="Daily Attendance Roster"
        searchPlaceholder="Search employees..."
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        searchKeys={[
          "employeeName",
          "statusLabel",
          "checkInLabel",
          "checkOutLabel",
        ]}
        paginationConfig={{ pageSize: 8 }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: isError
            ? getErrorMessage(error, "Failed to load attendance roster.")
            : "No attendance records found for this date",
        }}
      />

      <Modal
        title="Complete Checkout"
        open={completeTarget != null}
        onCancel={() => {
          if (isCompleting) return;
          setCompleteTarget(null);
          completeForm.resetFields();
        }}
        onOk={() => completeForm.submit()}
        okText="Complete"
        cancelText="Cancel"
        confirmLoading={isCompleting}
        okButtonProps={{
          icon: <SaveOutlined />,
          className:
            "!bg-primaryColor !text-white !border-primaryColor hover:!bg-primaryColor/90",
        }}
        centered
        destroyOnHidden
      >
        <p className="text-gray-600 mb-4">
          Complete checkout for{" "}
          <span className="font-semibold text-gray-800">
            {completeTarget?.employeeName}
          </span>
          . A reason is required.
        </p>
        <Form
          form={completeForm}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => {
            if (!completeTarget?.attendance_id) return;
            completeCheckout({
              attendanceId: completeTarget.attendance_id,
              reason: values.reason.trim(),
            });
          }}
        >
          <Form.Item
            name="reason"
            label={
              <span className="text-secondaryTextColor font-medium">Reason</span>
            }
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Employee forgot to check out"
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationAttendancePage;
