"use client";

import React from "react";
import Link from "next/link";
import { Button, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationDashboard } from "@/api/collection/dashboard";
import Panel from "@/components/dashboard/Panel";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import { LoadingSpinner } from "@/components/loader/Loading";
import useUserStore from "@/store/userStore";
import type {
  DashboardPendingLeave,
  DashboardPipelineItem,
} from "@/types/dashboard";
import { getUserDisplayName } from "@/utils/profileHelpers";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function pipelineLabel(status: DashboardPipelineItem["status"]): string {
  const labels: Record<DashboardPipelineItem["status"], string> = {
    submitted: "Submitted",
    reviewing: "In review",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    hired: "Hired",
  };
  return labels[status];
}

function relativeTime(value: string): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (elapsedSeconds < 60) return "just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function formatLeaveDuration(startValue: string, endValue: string): string {
  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${startLabel}${startValue === endValue ? "" : `–${endLabel}`} (${days} ${days === 1 ? "day" : "days"})`;
}

const Dashboard: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const firstName = getUserDisplayName(user).split(" ")[0];
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => setNow(new Date()), []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization-dashboard"],
    queryFn: getOrganizationDashboard,
  });

  const monthlyApplications = data?.monthly_applications ?? [];
  const peakMonth = monthlyApplications.reduce(
    (peak, point) => (point.count > peak.count ? point : peak),
    { month: "—", count: 0 },
  );
  const chartMax = Math.max(1, Math.ceil(peakMonth.count / 10) * 10);
  const pipeline = data?.application_pipeline ?? [];
  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.count));
  const designations = data?.designation_distribution ?? [];
  const designationTotal = designations.reduce((sum, item) => sum + item.count, 0);
  const designationMax = Math.max(1, ...designations.map((item) => item.count));
  const applicationTotal = monthlyApplications.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const stats: StatTileProps[] = [
    {
      label: "Total employees",
      value: data?.stats.total_employees ?? 0,
      caption:
        user?.role === "hr_manager"
          ? "employees you can manage"
          : "active workforce",
      icon: <TeamOutlined />,
    },
    {
      label: "Present today",
      value: data?.stats.present_today ?? 0,
      caption: `${data?.stats.attendance_rate ?? 0}% attendance rate`,
      icon: <CheckCircleOutlined />,
      meter: data?.stats.attendance_rate ?? 0,
    },
    {
      label: "On leave today",
      value: data?.stats.on_leave_today ?? 0,
      caption: "approved leave",
      icon: <CalendarOutlined />,
    },
    {
      label: "New hires",
      value: data?.stats.new_hires_this_month ?? 0,
      caption: "this month",
      icon: <UserAddOutlined />,
    },
  ];

  const leaveColumns: ColumnsType<DashboardPendingLeave> = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-blackColor">{name}</p>
            <p className="truncate text-xs text-darkGrayColor">
              {record.designation}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Leave type",
      dataIndex: "leave_type",
      key: "leave_type",
      render: (type: DashboardPendingLeave["leave_type"]) => (
        <Tag
          color={
            type === "sick"
              ? "magenta"
              : type === "annual"
                ? "geekblue"
                : "cyan"
          }
        >
          {titleCase(type)}
        </Tag>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_value, record) => (
        <span className="text-sm text-secondaryTextColor">
          {formatLeaveDuration(record.start_date, record.end_date)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: DashboardPendingLeave["status"]) => (
        <Tag color="warning">{titleCase(status)}</Tag>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: () => (
        <Link href="/orgnization/leaves">
          <Button size="small" type="primary">
            Review
          </Button>
        </Link>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (isError || !data) {
    return (
      <div className="hrx-card px-6 py-14 text-center">
        <p className="text-sm font-medium text-blackColor">
          Could not load dashboard
        </p>
        <p className="mt-1 text-sm text-grayColor">Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-darkGrayColor">
            {now
              ? now.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : " "}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-blackColor">
            {now ? greetingFor(now) : "Welcome back"}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-grayColor">
            Here&apos;s what&apos;s happening across your workforce.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/orgnization/employees">
            <Button icon={<PlusOutlined />}>Add employee</Button>
          </Link>
          <Link href="/orgnization/recruitment">
            <Button type="primary" icon={<FileSearchOutlined />}>
              Post a job
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Applications · last 12 months"
          icon={<FileSearchOutlined />}
          action={
            <span className="rounded-md bg-accentColor/10 px-2 py-1 text-xs font-medium text-accentDeepColor">
              {applicationTotal} total
            </span>
          }
        >
          <figure className="m-0">
            <div className="relative pl-8">
              <div className="absolute inset-y-0 left-0 right-0">
                {[chartMax, chartMax / 2, 0].map((tick, index) => (
                  <div
                    key={`${tick}-${index}`}
                    className="absolute left-0 right-0 flex items-center gap-2"
                    style={{
                      top: `${index * 50}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-darkGrayColor">
                      {tick}
                    </span>
                    <span className="h-px flex-1 bg-[#ECEEF3]" />
                  </div>
                ))}
              </div>
              <div className="relative flex h-44 items-end gap-[3px]">
                {monthlyApplications.map((point) => (
                  <Tooltip
                    key={point.month}
                    title={`${point.month} · ${point.count} applications`}
                    color="#161A26"
                  >
                    <div className="group relative flex h-full flex-1 cursor-default items-end">
                      <span className="absolute inset-0 rounded-md transition-colors group-hover:bg-accentColor/[0.06]" />
                      <div
                        style={{ height: `${(point.count / chartMax) * 100}%` }}
                        className={`relative w-full rounded-t transition-colors ${
                          point.month === peakMonth.month && point.count > 0
                            ? "bg-accentDeepColor"
                            : "bg-accentColor/70 group-hover:bg-accentDeepColor"
                        }`}
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-[3px] pl-8">
              {monthlyApplications.map((point) => (
                <span
                  key={point.month}
                  className="flex-1 text-center text-[10px] text-darkGrayColor"
                >
                  {point.month}
                </span>
              ))}
            </div>
            <figcaption className="mt-3 text-xs text-grayColor">
              {peakMonth.count ? (
                <>
                  Peak in{" "}
                  <span className="font-medium text-blackColor">
                    {peakMonth.month} ({peakMonth.count})
                  </span>
                  .
                </>
              ) : (
                "No applications received in this period."
              )}
            </figcaption>
          </figure>
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Hiring pipeline"
          icon={<UserAddOutlined />}
          action={
            <Link
              href="/orgnization/recruitment"
              className="!text-xs !font-medium !text-accentDeepColor hover:!underline"
            >
              {data.open_roles} open {data.open_roles === 1 ? "role" : "roles"}
            </Link>
          }
        >
          <div className="space-y-4">
            {pipeline.map((row) => (
              <div key={row.status}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-grayColor">
                    {pipelineLabel(row.status)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-blackColor">
                    {row.count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEEF3]">
                  <div
                    style={{ width: `${(row.count / pipelineMax) * 100}%` }}
                    className="h-full rounded-full bg-accentDeepColor"
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/orgnization/recruitment"
            className="mt-5 flex items-center justify-center gap-1.5 rounded-lg border border-[#ECEEF3] py-2 text-xs font-medium !text-secondaryTextColor transition-colors hover:!border-accentColor/40 hover:!text-accentDeepColor"
          >
            View positions <ArrowRightOutlined style={{ fontSize: 11 }} />
          </Link>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-2"
          title="Designation distribution"
          icon={<ApartmentOutlined />}
        >
          {designations.length ? (
            <div className="space-y-4">
              {designations.map((item) => (
                <div key={item.designation}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs text-grayColor">
                      {item.designation}
                    </span>
                    <span className="text-xs tabular-nums text-darkGrayColor">
                      <span className="font-semibold text-blackColor">
                        {item.count}
                      </span>{" "}
                      ·{" "}
                      {designationTotal
                        ? Math.round((item.count / designationTotal) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEEF3]">
                    <div
                      style={{ width: `${(item.count / designationMax) * 100}%` }}
                      className="h-full rounded-full bg-accentDeepColor"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-grayColor">
              No employees to summarize.
            </p>
          )}
        </Panel>

        <Panel
          className="lg:col-span-3"
          title="Recent activity"
          icon={<ClockCircleOutlined />}
        >
          {data.recent_activity.length ? (
            <ul className="-mx-2 space-y-0.5">
              {data.recent_activity.map((activity) => (
                <li key={activity.id}>
                  <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-offWhiteColor">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
                      {activity.user.charAt(0).toUpperCase()}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm text-grayColor">
                      <span className="font-medium text-blackColor">
                        {activity.user}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <span className="shrink-0 text-xs text-darkGrayColor">
                      {relativeTime(activity.occurred_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-grayColor">
              No recent workforce activity.
            </p>
          )}
        </Panel>
      </div>

      <Link
        href="/orgnization/chat-bot"
        className="block rounded-2xl border border-accentColor/25 bg-gradient-to-r from-accentColor/[0.07] to-glowColor/[0.05] p-5 transition-colors hover:border-accentColor/45"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-accentDeepColor" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accentDeepColor" />
              </span>
              <span className="text-xs font-semibold text-blackColor">
                HRX Assistant
              </span>
            </div>
            <p className="text-sm text-grayColor">
              Ask questions about your workforce, hiring pipeline, jobs, and
              candidates.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-lg border border-accentColor/25 bg-whiteColor px-3.5 py-2 text-xs font-medium text-accentDeepColor">
            Ask anything about your workforce
            <SendOutlined style={{ fontSize: 11 }} />
          </span>
        </div>
      </Link>

      <Panel
        title="Pending leave requests"
        icon={<CalendarOutlined />}
        action={
          <Link
            href="/orgnization/leaves"
            className="!text-xs !font-medium !text-accentDeepColor hover:!underline"
          >
            View all
          </Link>
        }
      >
        <Table
          rowKey="id"
          columns={leaveColumns}
          dataSource={data.pending_leaves}
          pagination={false}
          scroll={{ x: 720 }}
          size="middle"
          locale={{ emptyText: "No pending leave requests" }}
        />
      </Panel>
    </div>
  );
};

export default Dashboard;
