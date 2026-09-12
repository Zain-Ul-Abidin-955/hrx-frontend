"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  MailOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import MyTable from "@/components/table/MyTable";
import MyModal from "@/components/modal/MyModal";
import CustomInput from "@/components/input/CustomInput";
import { LoadingSpinner } from "@/components/loader/Loading";
import {
  deleteOrganization,
  getOrganizationById,
  getOrganizations,
  updateOrganization,
} from "@/api/collection/organizations";
import type {
  OrganizationRow,
  UpdateOrganizationPayload,
} from "@/types/organization";

function isValidUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error)
    ? (error.response?.data as { message?: string })?.message || fallback
    : fallback;
}

const OrganizationListsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<UpdateOrganizationPayload>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationRow | null>(
    null,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  });

  const {
    data: selectedOrganization,
    isLoading: isLoadingOrganization,
    isError: isOrganizationError,
  } = useQuery({
    queryKey: ["organization", editingId],
    queryFn: () => getOrganizationById(editingId as string),
    enabled: editingId != null,
  });

  useEffect(() => {
    if (!selectedOrganization) return;
    form.setFieldsValue({
      name: selectedOrganization.name,
      email: selectedOrganization.email,
      description: selectedOrganization.description,
      website: selectedOrganization.website,
    });
  }, [form, selectedOrganization]);

  const { mutate: saveOrganization, isPending: isUpdating } = useMutation({
    mutationFn: (values: UpdateOrganizationPayload) =>
      updateOrganization(editingId as string, values),
    onSuccess: () => {
      message.success("Organization updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization", editingId] });
      setEditingId(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to update organization."),
      );
    },
  });

  const { mutate: removeOrganization, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      message.success("Organization deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setDeleteTarget(null);
    },
    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to delete organization."),
      );
    },
  });

  const tableData = useMemo<OrganizationRow[]>(
    () =>
      (data ?? []).map((item) => ({
        ...item,
        key: item.id,
      })),
    [data],
  );

  const columns: ColumnsType<OrganizationRow> = useMemo(
    () => [
      {
        title: "Organization",
        dataIndex: "name",
        key: "name",
        render: (name: string) => (
          <span className="font-semibold text-gray-800">{name}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (email: string) => (
          <div className="flex items-center gap-2 text-gray-600">
            <MailOutlined className="text-gray-400" />
            <span className="text-sm">{email}</span>
          </div>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (description: string) => (
          <span className="text-gray-600">{description || "—"}</span>
        ),
      },
      {
        title: "Website",
        dataIndex: "website",
        key: "website",
        render: (website: string) => {
          if (!website) return <span className="text-gray-400">—</span>;

          if (isValidUrl(website)) {
            return (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primaryColor hover:underline text-sm"
              >
                <GlobalOutlined />
                {website}
              </a>
            );
          }

          return (
            <span className="flex items-center gap-2 text-gray-600 text-sm">
              <GlobalOutlined className="text-gray-400" />
              {website}
            </span>
          );
        },
      },
      {
        title: "Joined At",
        dataIndex: "created_at",
        key: "created_at",
        render: (createdAt: string) => (
          <span className="text-gray-600 text-sm">{formatDate(createdAt)}</span>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: 130,
        render: (_value, record) => (
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${record.name}`}
              className="w-12! h-12! rounded-xl! bg-gray-50! text-slate-600! hover:bg-gray-100!"
              onClick={() => {
                form.resetFields();
                setEditingId(record.id);
              }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.name}`}
              className="w-12! h-12! rounded-xl! bg-red-50! hover:bg-red-100!"
              onClick={() => setDeleteTarget(record)}
            />
          </div>
        ),
      },
    ],
    [form],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
          <p className="text-gray-600 mt-1">View all registered organizations</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
        <p className="text-gray-600 mt-1">View all registered organizations</p>
      </div>

      <MyTable<OrganizationRow>
        title="All Organizations"
        searchPlaceholder="Search organizations..."
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        searchKeys={["name", "email", "description", "website"]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: isError
            ? "Failed to load organizations. Please try again."
            : "No organizations found",
        }}
      />

      <Modal
        title="Edit Organization"
        open={editingId != null}
        onCancel={() => {
          if (isUpdating) return;
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
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
        {isLoadingOrganization ? (
          <div className="py-10">
            <LoadingSpinner />
          </div>
        ) : isOrganizationError ? (
          <p className="py-8 text-center text-red-500">
            Failed to load organization details.
          </p>
        ) : (
          <>
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={(values) => saveOrganization(values)}
              className="pt-4"
            >
              <CustomInput
                name="name"
                label="Organization Name"
                placeholder="Enter organization name"
              />
              <CustomInput
                name="email"
                label="Email"
                disabled={true}
                type="email"
                placeholder="Enter organization email"
                icon={<MailOutlined />}
              />
              <CustomInput
                name="description"
                label="Description"
                type="textarea"
                placeholder="Enter organization description"
                required={false}
                rows={3}
              />
              <CustomInput
                name="website"
                label="Website"
                type="url"
                placeholder="https://example.com"
                icon={<GlobalOutlined />}
                required={false}
              />
            </Form>
          </>
        )}
      </Modal>

      <MyModal
        open={deleteTarget != null}
        onConfirm={() => {
          if (deleteTarget) removeOrganization(deleteTarget.id);
        }}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"?`}
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

export default OrganizationListsPage;
