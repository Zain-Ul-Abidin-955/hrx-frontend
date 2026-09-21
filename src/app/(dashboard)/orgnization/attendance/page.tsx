"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Tag,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
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
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
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
    const tiles: StatTileProps[] = [
      {
        label: "Present",
        value: present,
        icon: <CheckCircleOutlined />,
        caption: "completed shifts",
      },
      {
        label: "Checked in",
        value: checkedIn,
        icon: <ClockCircleOutlined />,
        caption: "currently working",
      },
      {
        label: "Absent",
        value: absent,
        icon: <CloseCircleOutlined />,
        caption: "not checked in",
      },
      {
        label: "On leave",
        value: onLeave,
        icon: <CalendarOutlined />,
        caption: "approved time off",
      },
    ];
    return tiles;
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accentColor/10 text-sm font-semibold text-accentDeepColor">
              {getNameInitial(record.employeeName)}
            </div>
            <div>
              <p className="text-sm font-medium text-blackColor">{record.employeeName}</p>
              <p className="text-xs text-darkGrayColor">{record.employee.designation}</p>
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
            <span className="font-medium text-secondaryTextColor">{time}</span>
          ),
      },
      {
        title: "Check-Out",
        dataIndex: "checkOutLabel",
        key: "checkOutLabel",
        render: (time: string) =>
          time === "—" ? <Tag color="red">Missing</Tag> : (
            <span className="font-medium text-secondaryTextColor">{time}</span>
          ),
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
              size="small"
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

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Attendance
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Track the daily roster, working hours, and missing checkouts.
      </p>
    </div>
  );

  if (!canManageRoster) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <div className="hrx-card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
            <InboxOutlined />
          </span>
          <p className="mt-1 text-sm font-medium text-blackColor">
            You do not have access to attendance
          </p>
          <p className="max-w-sm text-sm text-grayColor">
            Ask an organization admin to grant you attendance permissions.
          </p>
        </div>
      </div>
    );
  }

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
                loading={isCheckingIn}
                disabled={!canCheckIn || isCheckingOut}
                onClick={() => doCheckIn()}
              >
                My Check In
              </Button>
              <Button
                icon={<LogoutOutlined />}
                loading={isCheckingOut}
                disabled={!canCheckOut || isCheckingIn}
                onClick={() => doCheckOut()}
              >
                My Check Out
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <MyTable<AttendanceRosterRow>
        title="Daily Attendance Roster"
        variant="dashboard"
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
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor">
                <InboxOutlined />
              </span>
              <p className="text-sm font-medium text-blackColor">
                {isError ? "Could not load attendance" : "No attendance records"}
              </p>
              <p className="text-xs text-grayColor">
                {isError
                  ? getErrorMessage(error, "Try again in a moment.")
                  : "There are no roster entries for this date."}
              </p>
            </div>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Complete checkout</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              Close an open attendance entry and document the adjustment.
            </p>
          </div>
        }
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
        }}
        width={560}
        centered
        destroyOnHidden
      >
        <div className="mb-5 rounded-xl border border-[#ECEEF3] bg-[#F7F8FB] px-4 py-3">
          <p className="text-sm font-medium text-blackColor">{completeTarget?.employeeName}</p>
          <p className="mt-1 text-xs text-grayColor">
            This will complete the selected employee&apos;s open attendance entry.
          </p>
        </div>
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
