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
  ClockCircleOutlined,
  CloseCircleOutlined,
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
    return [
      {
        title: "Total",
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
        title: "Rejected / Withdrawn",
        value: String(rejected + withdrawn),
        icon: <CloseCircleOutlined className="text-3xl text-red-600" />,
        bgColor: "bg-red-50",
      },
    ];
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
              type="link"
              danger
              className="!px-0"
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Leaves</h1>
          <p className="text-gray-600 mt-1">
            Request leave and track your leave history
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
          <h1 className="text-3xl font-bold text-gray-800">My Leaves</h1>
          <p className="text-gray-600 mt-1">
            Request leave and track your leave history
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="!bg-primaryColor"
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Apply Leave
          </Button>
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
        title="Leave Requests"
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
          emptyText: isError
            ? "Failed to load leave requests. Please try again."
            : "No leave requests found",
        }}
      />

      <Modal
        title="Apply Leave"
        open={isModalOpen}
        onCancel={() => {
          if (isCreating) return;
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
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
