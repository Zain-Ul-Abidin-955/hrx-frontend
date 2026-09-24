"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Modal, Row, Select, message } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  InboxOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import MyTable from "@/components/table/MyTable";
import MyModal from "@/components/modal/MyModal";
import CustomInput from "@/components/input/CustomInput";
import { LoadingSpinner } from "@/components/loader/Loading";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} from "@/api/collection/employees";
import type {
  EmployeeCreatePayload,
  EmployeeRole,
  EmployeeRow,
  EmployeeUpdatePayload,
} from "@/types/employee";
import { getNameInitial } from "@/utils/getNameInitial";
import useUserStore from "@/store/userStore";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import { FormSection } from "@/components/dashboard/DefinitionGrid";

const ALL_EMPLOYEE_ROLE_OPTIONS: { label: string; value: EmployeeRole }[] = [
  { label: "Employee", value: "employee" },
  { label: "HR Manager", value: "hr_manager" },
];

const EMPLOYEE_ONLY_ROLE_OPTIONS: { label: string; value: EmployeeRole }[] = [
  { label: "Employee", value: "employee" },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item?.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}

function getFullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function formatRole(role?: string) {
  if (!role) return "—";
  return role.replace(/_/g, " ");
}

const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const isHrManager = user?.role === "hr_manager";
  const createRoleOptions = isHrManager
    ? EMPLOYEE_ONLY_ROLE_OPTIONS
    : ALL_EMPLOYEE_ROLE_OPTIONS;

  const [createForm] = Form.useForm<EmployeeCreatePayload>();
  const [editForm] = Form.useForm<EmployeeUpdatePayload>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees", { includeInactive: true }],
    queryFn: () => getEmployees(true),
  });

  const {
    data: selectedEmployee,
    isLoading: isLoadingEmployee,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: ["employee", editingId],
    queryFn: () => getEmployeeById(editingId as string),
    enabled: editingId != null,
  });

  useEffect(() => {
    if (!selectedEmployee) return;
    editForm.setFieldsValue({
      first_name: selectedEmployee.first_name,
      last_name: selectedEmployee.last_name,
      phone: selectedEmployee.phone ?? "",
      designation: selectedEmployee.designation,
      role: selectedEmployee.user.role,
    });
  }, [editForm, selectedEmployee]);

  const { mutate: addEmployee, isPending: isCreating } = useMutation({
    mutationFn: (values: EmployeeCreatePayload) => createEmployee(values),
    onSuccess: () => {
      message.success("Employee created successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsCreateOpen(false);
      createForm.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to create employee."));
    },
  });

  const { mutate: saveEmployee, isPending: isUpdating } = useMutation({
    mutationFn: (values: EmployeeUpdatePayload) =>
      updateEmployee(editingId as string, values),
    onSuccess: () => {
      message.success("Employee updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", editingId] });
      setEditingId(null);
      editForm.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to update employee."));
    },
  });

  const { mutate: removeEmployee, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      message.success("Employee deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteTarget(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to delete employee."));
    },
  });

  const tableData = useMemo<EmployeeRow[]>(
    () =>
      (data ?? []).map((item) => ({
        ...item,
        key: item.id,
        full_name: getFullName(item.first_name, item.last_name),
        email: item.user?.email ?? "",
      })),
    [data],
  );

  const totalCount = tableData.length;
  const activeCount = tableData.filter((item) => item.is_active).length;
  const employeeCount = tableData.filter(
    (item) => item.user?.role === "employee",
  ).length;
  const hrManagerCount = tableData.filter(
    (item) => item.user?.role === "hr_manager",
  ).length;

  const stats: StatTileProps[] = [
    {
      label: "Total people",
      value: totalCount,
      icon: <TeamOutlined />,
      caption: totalCount === 1 ? "person in your workforce" : "people in your workforce",
    },
    {
      label: "Active",
      value: activeCount,
      icon: <CheckCircleOutlined />,
      caption: totalCount ? `${Math.round((activeCount / totalCount) * 100)}% of the team` : "no employees yet",
    },
    {
      label: "Employees",
      value: employeeCount,
      icon: <IdcardOutlined />,
      caption: "standard employee access",
    },
    ...(!isHrManager
      ? [
          {
            label: "HR managers",
            value: hrManagerCount,
            icon: <SafetyCertificateOutlined />,
            caption: "can manage people and hiring",
          } satisfies StatTileProps,
        ]
      : []),
  ];

  const columns: ColumnsType<EmployeeRow> = useMemo(
    () => [
      {
        title: "Employee",
        key: "employee",
        render: (_value, record) => {
          const fullName = getFullName(record.first_name, record.last_name);
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accentColor/10 text-sm font-semibold text-accentDeepColor">
                {getNameInitial(fullName)}
              </div>
              <div>
                <p className="text-sm font-medium text-blackColor">{fullName || "—"}</p>
                <p className="text-xs capitalize text-darkGrayColor">
                  {formatRole(record.user?.role)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        title: "Designation",
        dataIndex: "designation",
        key: "designation",
        render: (designation: string) => (
          <span className="inline-flex rounded-md bg-accentColor/10 px-2 py-0.5 text-xs font-medium text-accentDeepColor">
            {designation || "—"}
          </span>
        ),
      },
      {
        title: "Email",
        key: "email",
        render: (_value, record) => (
          <div className="flex items-center gap-2 text-secondaryTextColor">
            <MailOutlined className="text-darkGrayColor" />
            <span className="text-sm">{record.user?.email || "—"}</span>
          </div>
        ),
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        render: (phone: string | null) => (
          <div className="flex items-center gap-2 text-secondaryTextColor">
            <PhoneOutlined className="text-darkGrayColor" />
            <span className="text-sm">{phone || "—"}</span>
          </div>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: isHrManager ? 80 : 130,
        render: (_value, record) => (
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${getFullName(record.first_name, record.last_name)}`}
              size="small"
              className="text-grayColor!"
              onClick={() => {
                editForm.resetFields();
                setEditingId(record.id);
              }}
            />
            {!isHrManager && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${getFullName(record.first_name, record.last_name)}`}
                size="small"
                onClick={() => setDeleteTarget(record)}
              />
            )}
          </div>
        ),
      },
    ],
    [editForm, isHrManager],
  );

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Employees
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Keep your team directory, roles, and contact details up to date.
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {pageHeading}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="shrink-0"
          onClick={() => {
            createForm.resetFields();
            setIsCreateOpen(true);
          }}
        >
          Add Employee
        </Button>
      </header>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          isHrManager ? "xl:grid-cols-3" : "xl:grid-cols-4"
        }`}
      >
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <MyTable<EmployeeRow>
        title="All Employees"
        variant="dashboard"
        searchPlaceholder="Search employees..."
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        paginationConfig={{ pageSize: 5 }}
        searchKeys={[
          "full_name",
          "first_name",
          "last_name",
          "designation",
          "phone",
          "email",
        ]}
        scroll={{ x: 1100 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor">
                <InboxOutlined />
              </span>
              <p className="text-sm font-medium text-blackColor">
                {isError ? "Could not load employees" : "No employees found"}
              </p>
              <p className="text-xs text-grayColor">
                {isError
                  ? "Try again in a moment."
                  : "Add your first employee to start building the directory."}
              </p>
            </div>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Add employee</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              Create their account and add them to your organization directory.
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
        okText="Create employee"
        cancelText="Cancel"
        confirmLoading={isCreating}
        okButtonProps={{
          icon: <PlusOutlined />,
        }}
        width={680}
        centered
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) =>
            addEmployee({
              ...values,
              phone: values.phone?.trim() ? values.phone.trim() : null,
              role: isHrManager ? "employee" : values.role || "employee",
            })
          }
          initialValues={{ role: "employee" }}
          className="pt-4"
        >
          <FormSection title="Personal details">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <CustomInput name="first_name" label="First Name" placeholder="Enter first name" icon={<UserOutlined />} />
              </Col>
              <Col xs={24} md={12}>
                <CustomInput name="last_name" label="Last Name" placeholder="Enter last name" icon={<UserOutlined />} />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <CustomInput name="email" label="Email" type="email" placeholder="Enter email" icon={<MailOutlined />} />
              </Col>
              <Col xs={24} md={12}>
                <CustomInput name="phone" label="Phone" placeholder="Enter phone number" icon={<PhoneOutlined />} required={false} />
              </Col>
            </Row>
          </FormSection>
          <FormSection title="Work access" className="mt-5">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <CustomInput name="designation" label="Designation" placeholder="e.g. Software Engineer" />
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label={<span className="font-medium text-secondaryTextColor">Role</span>}
                  rules={[{ required: true, message: "Please select a role" }]}
                >
                  <Select size="large" options={createRoleOptions} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>
        </Form>
      </Modal>

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Edit employee</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              Update the employee&apos;s profile and organization access.
            </p>
          </div>
        }
        open={editingId != null}
        onCancel={() => {
          if (isUpdating) return;
          setEditingId(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Save changes"
        cancelText="Cancel"
        confirmLoading={isUpdating}
        okButtonProps={{
          icon: <SaveOutlined />,
        }}
        width={680}
        centered
        destroyOnHidden
      >
        {isLoadingEmployee ? (
          <div className="py-10">
            <LoadingSpinner />
          </div>
        ) : isEmployeeError ? (
          <p className="py-8 text-center text-red-500">
            Failed to load employee details.
          </p>
        ) : (
          <Form
            form={editForm}
            layout="vertical"
            requiredMark={false}
            onFinish={(values) =>
              saveEmployee({
                ...values,
                phone: values.phone?.trim() ? values.phone.trim() : null,
              })
            }
            className="pt-4"
          >
            <FormSection title="Personal details">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <CustomInput name="first_name" label="First Name" placeholder="Enter first name" icon={<UserOutlined />} />
                </Col>
                <Col xs={24} md={12}>
                  <CustomInput name="last_name" label="Last Name" placeholder="Enter last name" icon={<UserOutlined />} />
                </Col>
              </Row>
              <CustomInput name="phone" label="Phone" placeholder="Enter phone number" icon={<PhoneOutlined />} required={false} />
            </FormSection>
            <FormSection title="Work access" className="mt-5">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <CustomInput name="designation" label="Designation" placeholder="e.g. Software Engineer" />
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="role"
                    label={<span className="font-medium text-secondaryTextColor">Role</span>}
                    rules={[{ required: true, message: "Please select a role" }]}
                  >
                    <Select size="large" options={createRoleOptions} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
            </FormSection>
          </Form>
        )}
      </Modal>

      <MyModal
        open={deleteTarget != null}
        onConfirm={() => {
          if (deleteTarget) removeEmployee(deleteTarget.id);
        }}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        title="Delete Employee"
        description={`Are you sure you want to delete "${
          deleteTarget
            ? getFullName(deleteTarget.first_name, deleteTarget.last_name)
            : ""
        }"?`}
        subDescription="This action cannot be undone."
        okText="Delete"
        cancelText="Cancel"
        okIcon={<DeleteOutlined />}
        confirmLoading={isDeleting}
        danger
      />
    </div>
  );
};

export default EmployeesPage;
