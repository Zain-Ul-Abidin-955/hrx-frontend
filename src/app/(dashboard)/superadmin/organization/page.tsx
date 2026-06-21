"use client";

import React, { useMemo } from "react";
import { Select, Tag, message } from "antd";
import { MailOutlined, GlobalOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import MyTable from "@/components/table/MyTable";
import { LoadingSpinner } from "@/components/loader/Loading";
import {
  getOrganizationsApplications,
  updateOrganizationApplicationStatus,
} from "@/api/collection/organizations";
import type { OrganizationApplicationRow } from "@/types/organization";

function getStatusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "green";
  if (normalized === "pending") return "orange";
  if (normalized === "rejected") return "red";
  return "default";
}

function isValidUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

interface StatusDropdownProps {
  record: OrganizationApplicationRow;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ record }) => {
  const queryClient = useQueryClient();
  const normalizedStatus = record.status.toLowerCase();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: "approved" | "rejected") =>
      updateOrganizationApplicationStatus(record.id, status),
    onSuccess: () => {
      message.success("Organization status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizations-applications"] });
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          "Failed to update organization status."
        : "Failed to update organization status.";
      message.error(errorMessage);
    },
  });

  if (normalizedStatus !== "pending") {
    return (
      <Tag color={getStatusColor(record.status)} className="capitalize">
        {record.status}
      </Tag>
    );
  }

  return (
    <Select
      value="pending"
      loading={isPending}
      disabled={isPending}
      className="min-w-[140px] capitalize"
      options={[
        { label: "Pending", value: "pending" },
        { label: "Approve", value: "approved" },
        { label: "Reject", value: "rejected" },
      ]}
      onChange={(value: "pending" | "approved" | "rejected") => {
        if (value === "approved" || value === "rejected") {
          updateStatus(value);
        }
      }}
    />
  );
};

const OrganizationPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations-applications"],
    queryFn: getOrganizationsApplications,
  });

  const tableData = useMemo<OrganizationApplicationRow[]>(
    () =>
      (data ?? []).map((item) => ({
        ...item,
        key: item.id,
      })),
    [data],
  );

  const columns: ColumnsType<OrganizationApplicationRow> = useMemo(
    () => [
      {
        title: "Organization",
        dataIndex: "org_name",
        key: "org_name",
        render: (orgName: string) => (
          <span className="font-semibold text-gray-800">{orgName}</span>
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
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_status: string, record) => (
          <StatusDropdown record={record} />
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
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage organization applications</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
        <p className="text-gray-600 mt-1">Manage organization applications</p>
      </div>

      <MyTable<OrganizationApplicationRow>
        title="All Organizations"
        searchPlaceholder="Search organizations..."
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        searchKeys={["org_name", "email", "status", "description", "website"]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: isError
            ? "Failed to load organizations. Please try again."
            : "No organizations found",
        }}
      />
    </div>
  );
};

export default OrganizationPage;
