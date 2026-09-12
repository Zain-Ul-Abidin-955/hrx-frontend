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
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import dayjs, { type Dayjs } from "dayjs";
import MyTable from "@/components/table/MyTable";
import MyModal from "@/components/modal/MyModal";
import { LoadingSpinner } from "@/components/loader/Loading";
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
    return [
      {
        title: "Total Requests",
        value: String(leaves.length),
        icon: <CalendarOutlined className="text-3xl text-primaryColor" />,
        bgColor: "bg-slate-50",
      },
      {
        title: "Pending",
        value: String(pending),
        icon: <ClockCircleOutlined className="text-3xl text-orange-600" />,
        bgColor: "bg-orange-50",
      },
      {
        title: "Approved",
        value: String(approved),
        icon: <CheckCircleOutlined className="text-3xl text-green-600" />,
        bgColor: "bg-green-50",
      },
      {
        title: "Rejected",
        value: String(rejected),
        icon: <CloseCircleOutlined className="text-3xl text-red-600" />,
        bgColor: "bg-red-50",
      },
    ];
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primaryColor text-white font-semibold shrink-0">
              {getNameInitial(record.employeeName)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{record.employeeName}</p>
              <p className="text-xs text-gray-500">{record.designation}</p>
            </div>
          </div>
        ),
      },
      {
        title: "Type",
        dataIndex: "typeLabel",
        key: "typeLabel",
        render: (type: string) => (
          <Tag color="blue" className="capitalize">
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
          <span className="font-semibold text-gray-800">{days}</span>
        ),
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        render: (reason: string) => (
          <span className="text-gray-600">{reason || "—"}</span>
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
              value="pending"
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

  if (!canManageLeaves) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leaves</h1>
          <p className="text-gray-600 mt-1">
            Review and manage employee leave requests
          </p>
        </div>
        <Card>
          <p className="text-gray-600">
            You do not have permission to manage organization leave requests.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leaves</h1>
          <p className="text-gray-600 mt-1">
            Review and manage employee leave requests
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
          <h1 className="text-3xl font-bold text-gray-800">Leaves</h1>
          <p className="text-gray-600 mt-1">
            Review and manage employee leave requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select
            value={statusFilter}
            options={LEAVE_STATUS_FILTER_OPTIONS}
            onChange={(value) => setStatusFilter(value)}
            className="w-full sm:w-[180px]"
            size="large"
          />
          {canApplyLeave && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="!bg-primaryColor"
              onClick={() => {
                createForm.resetFields();
                setIsCreateOpen(true);
              }}
            >
              Apply Leave
            </Button>
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

      <MyTable<LeaveRequestRow>
        title="All Leave Requests"
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
          emptyText: isError
            ? "Failed to load leave requests. Please try again."
            : "No leave requests found",
        }}
      />

      <Modal
        title="Apply Leave"
        open={isCreateOpen}
        onCancel={() => {
          if (isCreating) return;
          setIsCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="Submit Request"
        confirmLoading={isCreating}
        okButtonProps={{
          className:
            "!bg-primaryColor !text-white !border-primaryColor hover:!bg-primaryColor/90",
        }}
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
          <Form.Item
            name="leave_type"
            label={
              <span className="text-secondaryTextColor font-medium">
                Leave Type
              </span>
            }
            rules={[{ required: true, message: "Please select leave type" }]}
          >
            <Select
              size="large"
              placeholder="Select leave type"
              options={LEAVE_TYPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item
            name="range"
            label={
              <span className="text-secondaryTextColor font-medium">
                Date Range
              </span>
            }
            rules={[{ required: true, message: "Please select leave dates" }]}
          >
            <DatePicker.RangePicker
              className="w-full"
              size="large"
              disabledDate={(current) =>
                current != null && current.isBefore(dayjs(), "day")
              }
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label={
              <span className="text-secondaryTextColor font-medium">Reason</span>
            }
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Explain your leave reason"
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      {needsReason ? (
        <Modal
          title="Reject Leave Request"
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
          centered
          destroyOnHidden
        >
          <p className="text-gray-600 mb-4">
            Reject leave for{" "}
            <span className="font-semibold text-gray-800">
              {statusAction?.leave.employeeName}
            </span>
            . A reason is required.
          </p>
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
