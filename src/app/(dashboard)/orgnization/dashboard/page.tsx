"use client";
import React from "react";
import Link from "next/link";
import { Button, Table, Tag, Tooltip } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  FileSearchOutlined,
  SendOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Panel from "@/components/dashboard/Panel";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import useUserStore from "@/store/userStore";
import { getUserDisplayName } from "@/utils/profileHelpers";

/* -------------------------------------------------------------------------- */
/* Mock data — this page is not wired to the API yet.                          */
/* -------------------------------------------------------------------------- */

const STATS: StatTileProps[] = [
  {
    label: "Total employees",
    value: "248",
    delta: "+12%",
    direction: "up",
    caption: "vs last month",
    icon: <TeamOutlined />,
  },
  {
    label: "Present today",
    value: "234",
    delta: "+1.8%",
    direction: "up",
    caption: "94.4% attendance rate",
    icon: <CheckCircleOutlined />,
    meter: 94.4,
  },
  {
    label: "On leave",
    value: "14",
    delta: "-3%",
    direction: "down",
    caption: "vs last month",
    icon: <CalendarOutlined />,
  },
  {
    label: "New hires",
    value: "8",
    delta: "+25%",
    direction: "up",
    caption: "vs last month",
    icon: <UserAddOutlined />,
  },
];

const MONTHLY_APPLICATIONS = [
  { month: "Jan", count: 148 },
  { month: "Feb", count: 196 },
  { month: "Mar", count: 172 },
  { month: "Apr", count: 241 },
  { month: "May", count: 218 },
  { month: "Jun", count: 287 },
  { month: "Jul", count: 252 },
  { month: "Aug", count: 318 },
  { month: "Sep", count: 231 },
  { month: "Oct", count: 276 },
  { month: "Nov", count: 203 },
  { month: "Dec", count: 264 },
];

const PIPELINE = [
  { stage: "Screened by AI", count: 412 },
  { stage: "Shortlisted", count: 96 },
  { stage: "Interviewing", count: 31 },
  { stage: "Offer sent", count: 8 },
];

const DEPARTMENTS = [
  { name: "Engineering", employees: 85 },
  { name: "Sales", employees: 62 },
  { name: "Marketing", employees: 48 },
  { name: "HR", employees: 28 },
  { name: "Finance", employees: 25 },
];

const ACTIVITIES = [
  {
    id: 1,
    user: "John Doe",
    action: "submitted a leave request",
    time: "5 mins ago",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "completed onboarding",
    time: "15 mins ago",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "checked in at 9:00 AM",
    time: "1 hour ago",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "updated profile information",
    time: "2 hours ago",
  },
];

interface LeaveRow {
  key: string;
  employee: string;
  department: string;
  leaveType: "Vacation" | "Sick" | "Personal";
  duration: string;
  status: "Pending" | "Approved" | "Rejected";
}

const LEAVE_REQUESTS: LeaveRow[] = [
  {
    key: "1",
    employee: "Robert Fox",
    department: "Engineering",
    leaveType: "Vacation",
    duration: "Dec 20–25 (5 days)",
    status: "Pending",
  },
  {
    key: "2",
    employee: "Jane Cooper",
    department: "Marketing",
    leaveType: "Sick",
    duration: "Dec 18 (1 day)",
    status: "Approved",
  },
  {
    key: "3",
    employee: "Wade Warren",
    department: "Sales",
    leaveType: "Personal",
    duration: "Dec 22–23 (2 days)",
    status: "Pending",
  },
];

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                               */
/* -------------------------------------------------------------------------- */

/** Greeting that matches the time of day the user actually opened the page. */
function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const Dashboard: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const firstName = getUserDisplayName(user).split(" ")[0];

  // Rendered client-side only, so local time is the user's own.
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => setNow(new Date()), []);

  const peakMonth = MONTHLY_APPLICATIONS.reduce((a, b) =>
    b.count > a.count ? b : a,
  );
  const chartMax = Math.ceil(peakMonth.count / 80) * 80;
  const pipelineMax = PIPELINE[0].count;
  const totalHeadcount = DEPARTMENTS.reduce((sum, d) => sum + d.employees, 0);

  const leaveColumns = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (text: string, record: LeaveRow) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
            {text.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-blackColor">
              {text}
            </p>
            <p className="truncate text-xs text-darkGrayColor">
              {record.department}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Leave type",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type: LeaveRow["leaveType"]) => (
        <Tag
          variant="filled"
          className="!rounded-md !px-2 !py-0.5 !text-xs !font-medium"
          color={
            type === "Sick"
              ? "magenta"
              : type === "Vacation"
                ? "geekblue"
                : "cyan"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (text: string) => (
        <span className="text-sm text-secondaryTextColor">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: LeaveRow["status"]) => (
        <Tag
          variant="filled"
          className="!rounded-md !px-2 !py-0.5 !text-xs !font-medium"
          color={
            status === "Approved"
              ? "success"
              : status === "Pending"
                ? "warning"
                : "error"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: () => (
        <div className="flex justify-end gap-2">
          <Button size="small" type="primary">
            Approve
          </Button>
          <Button size="small" danger>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* ---------- Page header ---------- */}
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
            Here&apos;s what moved across your workforce today.
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

      {/* ---------- Stat tiles ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      {/* ---------- Applications + pipeline ---------- */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Single series over time → one hue, hairline grid, hover for values. */}
        <Panel
          className="lg:col-span-3"
          title="Applications this quarter"
          icon={<FileSearchOutlined />}
          action={
            <span className="rounded-md bg-accentColor/10 px-2 py-1 text-xs font-medium text-accentDeepColor">
              +24%
            </span>
          }
        >
          <figure className="m-0">
            <div className="relative pl-8">
              {/* y grid */}
              <div className="absolute inset-y-0 left-0 right-0">
                {[chartMax, chartMax / 2, 0].map((tick, index) => (
                  <div
                    key={tick}
                    className="absolute left-0 right-0 flex items-center gap-2"
                    // centred on its gridline, so the 0 tick sits on the baseline
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
                {MONTHLY_APPLICATIONS.map((point) => {
                  const isPeak = point.month === peakMonth.month;
                  return (
                    <Tooltip
                      key={point.month}
                      title={`${point.month} · ${point.count} applications`}
                      color="#161A26"
                    >
                      <div className="group relative flex h-full flex-1 cursor-default items-end">
                        {/* full-height hit area, so hover doesn't need precision */}
                        <span className="absolute inset-0 rounded-md transition-colors group-hover:bg-accentColor/[0.06]" />
                        <div
                          style={{
                            height: `${(point.count / chartMax) * 100}%`,
                          }}
                          className={`relative w-full rounded-t transition-colors ${
                            isPeak
                              ? "bg-accentDeepColor"
                              : "bg-accentColor/70 group-hover:bg-accentDeepColor"
                          }`}
                        />
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* x labels, outside the plot box so nothing is clipped */}
            <div className="mt-2 flex gap-[3px] pl-8">
              {MONTHLY_APPLICATIONS.map((point) => (
                <span
                  key={point.month}
                  className="flex-1 text-center text-[10px] text-darkGrayColor"
                >
                  {point.month}
                </span>
              ))}
            </div>

            <figcaption className="mt-3 text-xs text-grayColor">
              Peak in{" "}
              <span className="font-medium text-blackColor">
                {peakMonth.month} ({peakMonth.count})
              </span>
              . Hover a bar for its monthly total.
            </figcaption>
          </figure>

          {/* Table twin — the same values without relying on hover or color. */}
          <table className="sr-only">
            <caption>Applications received per month</caption>
            <tbody>
              {MONTHLY_APPLICATIONS.map((point) => (
                <tr key={point.month}>
                  <th scope="row">{point.month}</th>
                  <td>{point.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              23 open roles
            </Link>
          }
        >
          <div className="space-y-4">
            {PIPELINE.map((row) => (
              <div key={row.stage}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-grayColor">{row.stage}</span>
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

      {/* ---------- Departments + activity ---------- */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-2"
          title="Department distribution"
          icon={<ApartmentOutlined />}
        >
          <div className="space-y-4">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-grayColor">{dept.name}</span>
                  <span className="text-xs tabular-nums text-darkGrayColor">
                    <span className="font-semibold text-blackColor">
                      {dept.employees}
                    </span>{" "}
                    · {Math.round((dept.employees / totalHeadcount) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEEF3]">
                  <div
                    style={{
                      width: `${(dept.employees / DEPARTMENTS[0].employees) * 100}%`,
                    }}
                    className="h-full rounded-full bg-accentDeepColor"
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          className="lg:col-span-3"
          title="Recent activity"
          icon={<ClockCircleOutlined />}
        >
          <ul className="-mx-2 space-y-0.5">
            {ACTIVITIES.map((activity) => (
              <li key={activity.id}>
                <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-offWhiteColor">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
                    {activity.user.charAt(0)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-grayColor">
                    <span className="font-medium text-blackColor">
                      {activity.user}
                    </span>{" "}
                    {activity.action}
                  </p>
                  <span className="shrink-0 text-xs text-darkGrayColor">
                    {activity.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ---------- Assistant strip ---------- */}
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
              3 candidates for{" "}
              <span className="font-medium text-blackColor">
                Senior Backend Engineer
              </span>{" "}
              scored above 90%. Shall I schedule interviews for Thursday?
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-lg border border-accentColor/25 bg-whiteColor px-3.5 py-2 text-xs font-medium text-accentDeepColor">
            Ask anything about your workforce
            <SendOutlined style={{ fontSize: 11 }} />
          </span>
        </div>
      </Link>

      {/* ---------- Leave requests ---------- */}
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
          columns={leaveColumns}
          dataSource={LEAVE_REQUESTS}
          pagination={false}
          scroll={{ x: 720 }}
          size="middle"
        />
      </Panel>
    </div>
  );
};

export default Dashboard;
