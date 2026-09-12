"use client";

import React, { useMemo, useState } from "react";
import { Card, Col, Row, Select, Tag, message } from "antd";
import {
  MailOutlined,
  GlobalOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  BankOutlined,
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
        value="pending"
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

  if (isLoadingApplications) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage organization applications</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage organization applications</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Applications</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isLoadingApplications ? "—" : applicationsCount}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Total organization applications
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <FileTextOutlined className="text-2xl text-blue-600" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Organizations</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isLoadingOrganizations ? "—" : organizationsCount}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Total registered organizations
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <BankOutlined className="text-2xl text-green-600" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <MyTable<OrganizationApplicationRow>
        title="All Applications"
        searchPlaceholder="Search applications..."
        columns={columns}
        dataSource={tableData}
        loading={isLoadingApplications}
        searchKeys={["org_name", "email", "status", "description", "website"]}
        paginationConfig={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: isApplicationsError
            ? "Failed to load applications. Please try again."
            : "No applications found",
        }}
      />
    </div>
  );
};

export default OrganizationPage;
