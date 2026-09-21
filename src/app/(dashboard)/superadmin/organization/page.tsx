"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal, message } from "antd";
import {
  BankOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  InboxOutlined,
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
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import { FormSection } from "@/components/dashboard/DefinitionGrid";

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

function isThisMonth(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
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

  const stats: StatTileProps[] = [
    {
      label: "Organizations",
      value: tableData.length,
      icon: <BankOutlined />,
      caption: "registered on the platform",
    },
    {
      label: "With websites",
      value: tableData.filter((organization) => Boolean(organization.website)).length,
      icon: <GlobalOutlined />,
      caption: "public websites provided",
    },
    {
      label: "Joined this month",
      value: tableData.filter((organization) => isThisMonth(organization.created_at)).length,
      icon: <CalendarOutlined />,
      caption: "new organizations",
    },
  ];

  const columns: ColumnsType<OrganizationRow> = useMemo(
    () => [
      {
        title: "Organization",
        dataIndex: "name",
        key: "name",
        render: (name: string) => (
          <span className="font-semibold text-blackColor">{name}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (email: string) => (
          <div className="flex items-center gap-2 text-secondaryTextColor">
            <MailOutlined className="text-darkGrayColor" />
            <span className="text-sm">{email}</span>
          </div>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (description: string) => (
          <span className="text-secondaryTextColor">{description || "—"}</span>
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
                className="flex items-center gap-2 text-sm text-accentDeepColor hover:underline"
              >
                <GlobalOutlined />
                {website}
              </a>
            );
          }

          return (
            <span className="flex items-center gap-2 text-sm text-secondaryTextColor">
              <GlobalOutlined className="text-darkGrayColor" />
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
          <span className="text-sm text-secondaryTextColor">{formatDate(createdAt)}</span>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: 130,
        render: (_value, record) => (
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${record.name}`}
              size="small"
              className="text-grayColor!"
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
              size="small"
              onClick={() => setDeleteTarget(record)}
            />
          </div>
        ),
      },
    ],
    [form],
  );

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Organizations
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        View and maintain every organization registered on the platform.
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
      {pageHeading}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
      </div>

      <MyTable<OrganizationRow>
        title="All Organizations"
        variant="dashboard"
        searchPlaceholder="Search organizations..."
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        searchKeys={["name", "email", "description", "website"]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor"><InboxOutlined /></span>
              <p className="text-sm font-medium text-blackColor">{isError ? "Could not load organizations" : "No organizations found"}</p>
              <p className="text-xs text-grayColor">{isError ? "Try again in a moment." : "Approved organizations will appear here."}</p>
            </div>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">Edit organization</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">Update the organization&apos;s public information and contact details.</p>
          </div>
        }
        open={editingId != null}
        onCancel={() => {
          if (isUpdating) return;
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
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
              <FormSection title="Organization details">
                <div className="grid gap-x-4 md:grid-cols-2">
                  <CustomInput name="name" label="Organization Name" placeholder="Enter organization name" />
                  <CustomInput name="email" label="Email" disabled={true} type="email" placeholder="Enter organization email" icon={<MailOutlined />} />
                </div>
                <CustomInput name="website" label="Website" type="url" placeholder="https://example.com" icon={<GlobalOutlined />} required={false} />
              </FormSection>
              <FormSection title="About" className="mt-5">
                <CustomInput name="description" label="Description" type="textarea" placeholder="Enter organization description" required={false} rows={4} />
              </FormSection>
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
