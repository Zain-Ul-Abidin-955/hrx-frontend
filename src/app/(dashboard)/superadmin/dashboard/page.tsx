"use client";

import React, { useMemo, useState } from "react";
import { Select, Tag, message } from "antd";
import {
  MailOutlined,
  GlobalOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import MyTable from "@/components/table/MyTable";
import { LoadingSpinner } from "@/components/loader/Loading";
import MyModal from "@/components/modal/MyModal";
import {
  getOrganizationsApplications,
  getOrganizations,
  approveOrganizationApplication,
  rejectOrganizationApplication,
} from "@/api/collection/organizations";
import type { OrganizationApplicationRow } from "@/types/organization";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";

type PendingAction = "approved" | "rejected";

function getStatusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "green";
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
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const { mutate: approveOrg, isPending: isApproving } = useMutation({
    mutationFn: () => approveOrganizationApplication(record.id),
    onSuccess: () => {
      message.success("Organization approved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["organizations-applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setPendingAction(null);
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          "Failed to approve organization."
        : "Failed to approve organization.";
      message.error(errorMessage);
    },
  });

  const { mutate: rejectOrg, isPending: isRejecting } = useMutation({
    mutationFn: () => rejectOrganizationApplication(record.id),
    onSuccess: () => {
      message.success("Organization rejected successfully!");
      queryClient.invalidateQueries({
        queryKey: ["organizations-applications"],
      });
      setPendingAction(null);
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          "Failed to reject organization."
        : "Failed to reject organization.";
      message.error(errorMessage);
    },
  });

  const isPending = isApproving || isRejecting;
  const isApprove = pendingAction === "approved";

  if (normalizedStatus !== "pending") {
    return (
      <Tag color={getStatusColor(record.status)} className="capitalize">
        {record.status}
      </Tag>
    );
  }

  return (
    <>
      <Select
        placeholder="Pending"
        value={null}
        allowClear={false}
        loading={isPending}
        disabled={isPending}
        className="min-w-[140px] capitalize"
        options={[
          { label: "Approve", value: "approved" },
          { label: "Reject", value: "rejected" },
        ]}
        onChange={(value: PendingAction) => {
          if (value === "approved" || value === "rejected") {
            setPendingAction(value);
          }
        }}
      />

      <MyModal
        open={pendingAction != null}
        onConfirm={() => {
          if (pendingAction === "approved") approveOrg();
          if (pendingAction === "rejected") rejectOrg();
        }}
        onCancel={() => {
          if (!isPending) setPendingAction(null);
        }}
        title={isApprove ? "Confirm Approval" : "Confirm Rejection"}
        description={
          isApprove
            ? `Are you sure you want to approve "${record.org_name}"?`
            : `Are you sure you want to reject "${record.org_name}"?`
        }
        subDescription={
          isApprove
            ? "The organization will be approved and can access the platform."
            : "The organization application will be discarded."
        }
        okText={isApprove ? "Approve" : "Reject"}
        cancelText="Cancel"
        okIcon={isApprove ? <CheckOutlined /> : <CloseOutlined />}
        confirmLoading={isPending}
        danger={!isApprove}
      />
    </>
  );
};

const OrganizationPage: React.FC = () => {
  const {
    data: applications,
    isLoading: isLoadingApplications,
    isError: isApplicationsError,
  } = useQuery({
    queryKey: ["organizations-applications"],
    queryFn: getOrganizationsApplications,
  });

  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  });

  const applicationsCount = applications?.length ?? 0;
  const organizationsCount = organizations?.length ?? 0;
  const pendingCount = applications?.filter(
    (application) => application.status.toLowerCase() === "pending",
  ).length ?? 0;
  const approvedCount = applications?.filter(
    (application) => application.status.toLowerCase() === "approved",
  ).length ?? 0;

  const tableData = useMemo<OrganizationApplicationRow[]>(
    () =>
      (applications ?? []).map((item) => ({
        ...item,
        key: item.id,
      })),
    [applications],
  );

  const columns: ColumnsType<OrganizationApplicationRow> = useMemo(
    () => [
      {
        title: "Organization",
        dataIndex: "org_name",
        key: "org_name",
        render: (orgName: string) => (
          <span className="font-semibold text-blackColor">{orgName}</span>
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
    ],
    [],
  );

  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Superadmin dashboard
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Review organization applications and monitor platform growth.
      </p>
    </div>
  );

  const stats: StatTileProps[] = [
    {
      label: "Applications",
      value: applicationsCount,
      icon: <FileTextOutlined />,
      caption: "all organization requests",
    },
    {
      label: "Pending review",
      value: pendingCount,
      icon: <ClockCircleOutlined />,
      caption: pendingCount === 1 ? "application needs action" : "applications need action",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: <CheckCircleOutlined />,
      caption: "approved applications",
    },
    {
      label: "Organizations",
      value: isLoadingOrganizations ? "—" : organizationsCount,
      icon: <BankOutlined />,
      caption: "registered organizations",
    },
  ];

  if (isLoadingApplications) {
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
      </div>

      <MyTable<OrganizationApplicationRow>
        title="All Applications"
        variant="dashboard"
        searchPlaceholder="Search applications..."
        columns={columns}
        dataSource={tableData}
        loading={isLoadingApplications}
        searchKeys={["org_name", "email", "status", "description", "website"]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentColor/10 text-accentDeepColor"><InboxOutlined /></span>
              <p className="text-sm font-medium text-blackColor">{isApplicationsError ? "Could not load applications" : "No applications found"}</p>
              <p className="text-xs text-grayColor">{isApplicationsError ? "Try again in a moment." : "New organization applications will appear here."}</p>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default OrganizationPage;
