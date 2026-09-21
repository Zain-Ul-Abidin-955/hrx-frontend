"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Tag,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import dayjs, { type Dayjs } from "dayjs";
import MyTable from "@/components/table/MyTable";
import MyModal from "@/components/modal/MyModal";
import { LoadingSpinner } from "@/components/loader/Loading";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import {
  createLeave,
  getMyLeaves,
  withdrawLeave,
} from "@/api/collection/leaves";
import type {
  LeaveRequestCreatePayload,
  LeaveRequestRow,
  LeaveStatus,
  LeaveType,
} from "@/types/leave";
import {
  LEAVE_STATUS_FILTER_OPTIONS,
  LEAVE_TYPE_OPTIONS,
  getLeaveStatusColor,
  mapLeaveToRow,
  toLeaveApiDate,
} from "@/utils/leaveHelpers";

interface LeaveFormValues {
  leave_type: LeaveType;
  range: [Dayjs, Dayjs];
  reason: string;
}

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

const EmployeeLeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<LeaveFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [withdrawTarget, setWithdrawTarget] = useState<LeaveRequestRow | null>(
    null,
  );

  const {
    data: leaves = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["my-leaves", statusFilter],
    queryFn: () =>
      getMyLeaves(
        statusFilter === "all" ? undefined : { status: statusFilter },
      ),
  });

  const tableData = useMemo(() => leaves.map(mapLeaveToRow), [leaves]);

  const stats = useMemo(() => {
    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    const withdrawn = leaves.filter((l) => l.status === "withdrawn").length;
    const tiles: StatTileProps[] = [
      {
        label: "Total requests",
        value: leaves.length,
        icon: <CalendarOutlined />,
        caption: "in the current view",
      },
      {
        label: "Pending",
        value: pending,
        icon: <ClockCircleOutlined />,
        caption: "awaiting review",
      },
      {
        label: "Approved",
        value: approved,
        icon: <CheckCircleOutlined />,
        caption: "requests approved",
      },
      {
        label: "Closed",
        value: rejected + withdrawn,
        icon: <CloseCircleOutlined />,
        caption: "rejected or withdrawn",
      },
    ];
    return tiles;
  }, [leaves]);

  const { mutate: submitLeave, isPending: isCreating } = useMutation({
    mutationFn: (payload: LeaveRequestCreatePayload) => createLeave(payload),
    onSuccess: () => {
      message.success("Leave request submitted");
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to submit leave request."));
    },
  });

  const { mutate: doWithdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: (leaveId: string) => withdrawLeave(leaveId),
    onSuccess: () => {
      message.success("Leave request withdrawn");
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      setWithdrawTarget(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to withdraw leave request."));
    },
  });

  const columns: ColumnsType<LeaveRequestRow> = useMemo(
    () => [
      {
        title: "Type",
        dataIndex: "typeLabel",
        key: "typeLabel",
        render: (type: string) => (
          <Tag color="geekblue" className="capitalize">
            {type}
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
        title: "Days",
        dataIndex: "days",
        key: "days",
        render: (days: number) => (
          <span className="font-semibold tabular-nums text-blackColor">{days}</span>
        ),
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        render: (reason: string) => (
          <span className="text-secondaryTextColor">{reason || "—"}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_status, record) => (
          <Tag
            color={getLeaveStatusColor(record.status)}
            className="capitalize"
          >
            {record.statusLabel}
          </Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: 130,
        render: (_value, record) => {
          if (record.status !== "pending") {
            return <span className="text-gray-400 text-sm">—</span>;
          }
          return (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => setWithdrawTarget(record)}
            >
              Withdraw
            </Button>
          );
        },
      },
    ],
    [],
  );

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        My leaves
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Request time off and follow every decision in one place.
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

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {pageHeading}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select
            value={statusFilter}
            options={LEAVE_STATUS_FILTER_OPTIONS}
            onChange={(value) => setStatusFilter(value)}
            className="w-full sm:w-[180px]"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Apply Leave
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <MyTable<LeaveRequestRow>
        title="Leave Requests"
        variant="dashboard"
        searchPlaceholder="Search leave requests..."
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        searchKeys={[
          "typeLabel",
          "fromLabel",
          "toLabel",
          "reason",
          "statusLabel",
        ]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor"><InboxOutlined /></span>
              <p className="text-sm font-medium text-blackColor">{isError ? "Could not load leave requests" : "No leave requests found"}</p>
              <p className="text-xs text-grayColor">{isError ? "Try again in a moment." : "Your submitted requests will appear here."}</p>
            </div>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Apply for leave</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">Send a dated request to your organization for review.</p>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          if (isCreating) return;
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Submit request"
        confirmLoading={isCreating}
        okButtonProps={{ icon: <PlusOutlined /> }}
        width={620}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => {
            const [start, end] = values.range;
            submitLeave({
              leave_type: values.leave_type,
              start_date: toLeaveApiDate(start.toDate()),
              end_date: toLeaveApiDate(end.toDate()),
              reason: values.reason.trim(),
            });
          }}
          className="pt-4"
        >
          <div className="rounded-xl border border-accentColor/20 bg-accentColor/[0.05] px-4 py-3 text-xs leading-5 text-grayColor">
            Your request will remain pending until an HR manager reviews it.
          </div>
          <div className="mt-5 grid gap-x-4 md:grid-cols-2">
            <Form.Item
              name="leave_type"
              label={<span className="font-medium text-secondaryTextColor">Leave Type</span>}
              rules={[{ required: true, message: "Please select leave type" }]}
            >
              <Select size="large" placeholder="Select leave type" options={LEAVE_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="range"
              label={<span className="font-medium text-secondaryTextColor">Date Range</span>}
              rules={[{ required: true, message: "Please select leave dates" }]}
            >
              <DatePicker.RangePicker className="w-full" size="large" disabledDate={(current) => current != null && current.isBefore(dayjs(), "day")} />
            </Form.Item>
          </div>
          <Form.Item
            name="reason"
            label={
              <span className="text-secondaryTextColor font-medium">Reason</span>
            }
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Explain your leave reason"
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      <MyModal
        open={withdrawTarget != null}
        onConfirm={() => {
          if (withdrawTarget) doWithdraw(withdrawTarget.id);
        }}
        onCancel={() => {
          if (!isWithdrawing) setWithdrawTarget(null);
        }}
        title="Withdraw Leave"
        description={`Withdraw your ${withdrawTarget?.typeLabel ?? ""} leave request?`}
        subDescription={
          withdrawTarget
            ? `${withdrawTarget.fromLabel} to ${withdrawTarget.toLabel}`
            : undefined
        }
        okText="Withdraw"
        cancelText="Cancel"
        okIcon={<StopOutlined />}
        confirmLoading={isWithdrawing}
        danger
      />
    </div>
  );
};

export default EmployeeLeavesPage;
