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
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  InboxOutlined,
  PlusOutlined,
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
  getOrganizationLeaves,
  updateLeaveStatus,
} from "@/api/collection/leaves";
import type {
  LeaveRequestCreatePayload,
  LeaveRequestRow,
  LeaveStatus,
  LeaveStatusUpdateValue,
  LeaveType,
} from "@/types/leave";
import useUserStore from "@/store/userStore";
import { getNameInitial } from "@/utils/getNameInitial";
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

interface StatusActionState {
  leave: LeaveRequestRow;
  status: LeaveStatusUpdateValue;
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

const OrganizationLeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const canManageLeaves =
    user?.role === "hr_manager" || user?.role === "org_admin";
  const canApplyLeave = user?.role === "hr_manager";

  const [createForm] = Form.useForm<LeaveFormValues>();
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [statusAction, setStatusAction] = useState<StatusActionState | null>(
    null,
  );

  const {
    data: leaves = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["organization-leaves", statusFilter],
    queryFn: () =>
      getOrganizationLeaves(
        statusFilter === "all" ? undefined : { status: statusFilter },
      ),
    enabled: canManageLeaves,
  });

  const tableData = useMemo(() => leaves.map(mapLeaveToRow), [leaves]);

  const stats = useMemo(() => {
    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
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
        caption: pending === 1 ? "request needs review" : "requests need review",
      },
      {
        label: "Approved",
        value: approved,
        icon: <CheckCircleOutlined />,
        caption: "requests approved",
      },
      {
        label: "Rejected",
        value: rejected,
        icon: <CloseCircleOutlined />,
        caption: "requests declined",
      },
    ];
    return tiles;
  }, [leaves]);

  const { mutate: submitLeave, isPending: isCreating } = useMutation({
    mutationFn: (payload: LeaveRequestCreatePayload) => createLeave(payload),
    onSuccess: () => {
      message.success("Leave request submitted");
      queryClient.invalidateQueries({ queryKey: ["organization-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      setIsCreateOpen(false);
      createForm.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to submit leave request."));
    },
  });

  const { mutate: changeStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({
      leaveId,
      status,
      reason,
    }: {
      leaveId: string;
      status: LeaveStatusUpdateValue;
      reason?: string;
    }) => updateLeaveStatus(leaveId, { status, reason }),
    onSuccess: (_data, variables) => {
      message.success(
        variables.status === "approved"
          ? "Leave request approved"
          : variables.status === "rejected"
            ? "Leave request rejected"
            : "Leave request updated",
      );
      queryClient.invalidateQueries({ queryKey: ["organization-leaves"] });
      setStatusAction(null);
      rejectForm.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to update leave status."));
    },
  });

  const columns: ColumnsType<LeaveRequestRow> = useMemo(
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
              <p className="text-xs text-darkGrayColor">{record.designation}</p>
            </div>
          </div>
        ),
      },
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
        render: (_status, record) => {
          if (record.status !== "pending") {
            return (
              <div className="space-y-1">
                <Tag
                  color={getLeaveStatusColor(record.status)}
                  className="capitalize"
                >
                  {record.statusLabel}
                </Tag>
                {record.status_reason ? (
                  <p className="text-xs text-gray-400 max-w-[180px]">
                    {record.status_reason}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <Select
              placeholder="Action"
              value={null}
              allowClear={false}
              className="min-w-[140px]"
              options={[
                { label: "Approve", value: "approved" },
                { label: "Reject", value: "rejected" },
              ]}
              onChange={(value: LeaveStatusUpdateValue) => {
                setStatusAction({ leave: record, status: value });
                if (value === "rejected") {
                  rejectForm.resetFields();
                }
              }}
            />
          );
        },
      },
    ],
    [rejectForm],
  );

  const isApprove = statusAction?.status === "approved";
  const needsReason =
    statusAction?.status === "rejected" ||
    statusAction?.status === "withdrawn";

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Leaves
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Review requests, record decisions, and keep time off visible.
      </p>
    </div>
  );

  if (!canManageLeaves) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <div className="hrx-card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
            <InboxOutlined />
          </span>
          <p className="mt-1 text-sm font-medium text-blackColor">
            You do not have access to leave management
          </p>
          <p className="max-w-sm text-sm text-grayColor">
            Ask an organization admin to grant you leave-management permissions.
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
          <Select
            value={statusFilter}
            options={LEAVE_STATUS_FILTER_OPTIONS}
            onChange={(value) => setStatusFilter(value)}
            className="w-full sm:w-[180px]"
          />
          {canApplyLeave && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                createForm.resetFields();
                setIsCreateOpen(true);
              }}
            >
              Apply Leave
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <MyTable<LeaveRequestRow>
        title="All Leave Requests"
        variant="dashboard"
        searchPlaceholder="Search leave requests..."
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        searchKeys={[
          "employeeName",
          "designation",
          "typeLabel",
          "reason",
          "statusLabel",
        ]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1100 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor">
                <InboxOutlined />
              </span>
              <p className="text-sm font-medium text-blackColor">
                {isError ? "Could not load leave requests" : "No leave requests found"}
              </p>
              <p className="text-xs text-grayColor">
                {isError ? "Try again in a moment." : "Requests will appear here when employees submit them."}
              </p>
            </div>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Apply for leave</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              Send a dated request to your organization for review.
            </p>
          </div>
        }
        open={isCreateOpen}
        onCancel={() => {
          if (isCreating) return;
          setIsCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="Submit request"
        confirmLoading={isCreating}
        okButtonProps={{ icon: <PlusOutlined /> }}
        width={620}
        centered
        destroyOnHidden
      >
        <Form
          form={createForm}
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
            Requests remain pending until an HR manager or organization admin reviews them.
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
              <DatePicker.RangePicker
                className="w-full"
                size="large"
                disabledDate={(current) => current != null && current.isBefore(dayjs(), "day")}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="reason"
            label={
              <span className="font-medium text-secondaryTextColor">Reason</span>
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

      {needsReason ? (
        <Modal
          title={
            <div>
              <p className="text-base font-semibold text-blackColor">Reject leave request</p>
              <p className="mt-0.5 text-xs font-normal text-grayColor">
                Record a clear reason so the employee understands the decision.
              </p>
            </div>
          }
          open={statusAction != null}
          onCancel={() => {
            if (isUpdatingStatus) return;
            setStatusAction(null);
            rejectForm.resetFields();
          }}
          onOk={() => rejectForm.submit()}
          okText="Reject"
          confirmLoading={isUpdatingStatus}
          okButtonProps={{
            danger: true,
            icon: <CloseOutlined />,
          }}
          width={560}
          centered
          destroyOnHidden
        >
          <div className="mb-5 rounded-xl border border-[#ECEEF3] bg-[#F7F8FB] px-4 py-3">
            <p className="text-sm font-medium text-blackColor">{statusAction?.leave.employeeName}</p>
            <p className="mt-1 text-xs text-grayColor">
              {statusAction ? `${statusAction.leave.typeLabel} leave · ${statusAction.leave.fromLabel} to ${statusAction.leave.toLabel}` : ""}
            </p>
          </div>
          <Form
            form={rejectForm}
            layout="vertical"
            requiredMark={false}
            onFinish={(values) => {
              if (!statusAction) return;
              changeStatus({
                leaveId: statusAction.leave.id,
                status: "rejected",
                reason: values.reason.trim(),
              });
            }}
          >
            <Form.Item
              name="reason"
              label={
                <span className="text-secondaryTextColor font-medium">
                  Reason
                </span>
              }
              rules={[{ required: true, message: "Please enter a reason" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter rejection reason"
                className="rounded-lg"
              />
            </Form.Item>
          </Form>
        </Modal>
      ) : (
        <MyModal
          open={statusAction != null}
          onConfirm={() => {
            if (!statusAction) return;
            changeStatus({
              leaveId: statusAction.leave.id,
              status: statusAction.status,
            });
          }}
          onCancel={() => {
            if (!isUpdatingStatus) setStatusAction(null);
          }}
          title={isApprove ? "Confirm Approval" : "Confirm Update"}
          description={
            isApprove
              ? `Approve leave request for "${statusAction?.leave.employeeName ?? ""}"?`
              : `Update leave request for "${statusAction?.leave.employeeName ?? ""}"?`
          }
          subDescription={
            statusAction
              ? `${statusAction.leave.typeLabel} leave · ${statusAction.leave.fromLabel} to ${statusAction.leave.toLabel}`
              : undefined
          }
          okText={isApprove ? "Approve" : "Confirm"}
          cancelText="Cancel"
          okIcon={<CheckOutlined />}
          confirmLoading={isUpdatingStatus}
        />
      )}
    </div>
  );
};

export default OrganizationLeavesPage;
