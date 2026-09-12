"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Modal, Select, Tag, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
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

  const columns: ColumnsType<EmployeeRow> = useMemo(
    () => [
      {
        title: "Employee",
        key: "employee",
        render: (_value, record) => {
          const fullName = getFullName(record.first_name, record.last_name);
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primaryColor text-white font-semibold shrink-0">
                {getNameInitial(fullName)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{fullName || "—"}</p>
                <p className="text-xs text-gray-500 capitalize">
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
          <Tag color="blue">{designation || "—"}</Tag>
        ),
      },
      {
        title: "Email",
        key: "email",
        render: (_value, record) => (
          <div className="flex items-center gap-2 text-gray-600">
            <MailOutlined className="text-gray-400" />
            <span className="text-sm">{record.user?.email || "—"}</span>
          </div>
        ),
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        render: (phone: string | null) => (
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined className="text-gray-400" />
            <span className="text-sm">{phone || "—"}</span>
          </div>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: isHrManager ? 80 : 130,
        render: (_value, record) => (
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${getFullName(record.first_name, record.last_name)}`}
              className="w-12! h-12! rounded-xl! bg-gray-50! text-slate-600! hover:bg-gray-100!"
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
                className="w-12! h-12! rounded-xl! bg-red-50! hover:bg-red-100!"
                onClick={() => setDeleteTarget(record)}
              />
            )}
          </div>
        ),
      },
    ],
    [editForm, isHrManager],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
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
          Add Employee
        </Button>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-blue-600 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold text-blue-700">{totalCount}</p>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-green-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-700">{activeCount}</p>
          </div>
        </Card>
      </div> */}

      <MyTable<EmployeeRow>
        title="All Employees"
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
          emptyText: isError
            ? "Failed to load employees. Please try again."
            : "No employees found",
        }}
      />

      <Modal
        title="Add Employee"
        open={isCreateOpen}
        onCancel={() => {
          if (isCreating) return;
          setIsCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="Create Employee"
        cancelText="Cancel"
        confirmLoading={isCreating}
        okButtonProps={{
          icon: <PlusOutlined />,
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
          <CustomInput
            name="first_name"
            label="First Name"
            placeholder="Enter first name"
            icon={<UserOutlined />}
          />
          <CustomInput
            name="last_name"
            label="Last Name"
            placeholder="Enter last name"
            icon={<UserOutlined />}
          />
          <CustomInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email"
            icon={<MailOutlined />}
          />
          <CustomInput
            name="phone"
            label="Phone"
            placeholder="Enter phone number"
            icon={<PhoneOutlined />}
            required={false}
          />
          <CustomInput
            name="designation"
            label="Designation"
            placeholder="e.g. Software Engineer"
          />
          <Form.Item
            name="role"
            label={<span className="text-secondaryTextColor font-medium">Role</span>}
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              size="large"
              options={createRoleOptions}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Employee"
        open={editingId != null}
        onCancel={() => {
          if (isUpdating) return;
          setEditingId(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Save Changes"
        cancelText="Cancel"
        confirmLoading={isUpdating}
        okButtonProps={{
          icon: <SaveOutlined />,
          className:
            "!bg-primaryColor !text-white !border-primaryColor hover:!bg-primaryColor/90",
        }}
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
            <CustomInput
              name="first_name"
              label="First Name"
              placeholder="Enter first name"
              icon={<UserOutlined />}
            />
            <CustomInput
              name="last_name"
              label="Last Name"
              placeholder="Enter last name"
              icon={<UserOutlined />}
            />
            <CustomInput
              name="phone"
              label="Phone"
              placeholder="Enter phone number"
              icon={<PhoneOutlined />}
              required={false}
            />
            <CustomInput
              name="designation"
              label="Designation"
              placeholder="e.g. Software Engineer"
            />
            <Form.Item
              name="role"
              label={<span className="text-secondaryTextColor font-medium">Role</span>}
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                size="large"
                options={createRoleOptions}
                className="w-full"
              />
            </Form.Item>
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
