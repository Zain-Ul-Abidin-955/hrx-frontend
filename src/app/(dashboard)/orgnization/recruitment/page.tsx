"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  FileSearchOutlined,
  InboxOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import CustomInput from "@/components/input/CustomInput";
import Panel from "@/components/dashboard/Panel";
import {
  DefinitionGrid,
  FormSection,
  ProseSection,
} from "@/components/dashboard/DefinitionGrid";
import StatTile, { type StatTileProps } from "@/components/dashboard/StatTile";
import { LoadingSpinner } from "@/components/loader/Loading";
import MyModal from "@/components/modal/MyModal";
import useUserStore from "@/store/userStore";
import {
  createJob,
  deleteJob,
  getJobApplications,
  getOrganizationJobs,
  updateJob,
} from "@/api/collection/jobs";
import type {
  Job,
  JobApplication,
  JobCreatePayload,
  JobEmploymentType,
  JobWorkplaceType,
  SalaryPeriod,
} from "@/types/job";

interface JobFormValues {
  title: string;
  description: string;
  department?: string;
  location?: string;
  employment_type: JobEmploymentType;
  workplace_type: JobWorkplaceType;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  salary_period: SalaryPeriod;
  experience_level?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  is_active: boolean;
}

type JobFilter = "all" | "active" | "inactive";

interface JobRow extends Job {
  key: string;
  applications: number;
  aiScreened: number;
}

const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Full time", value: "full_time" },
  { label: "Part time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
  { label: "Temporary", value: "temporary" },
];

const WORKPLACE_TYPE_OPTIONS = [
  { label: "On-site", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

const SALARY_PERIOD_OPTIONS = [
  { label: "Hourly", value: "hourly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const JOB_FORM_DEFAULTS: Partial<JobFormValues> = {
  employment_type: "full_time",
  workplace_type: "onsite",
  salary_currency: "USD",
  salary_period: "yearly",
  is_active: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as
    { message?: string; detail?: string | { msg?: string }[] } | undefined;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return (
      data.detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ") || fallback
    );
  }
  return fallback;
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toJobPayload(values: JobFormValues): JobCreatePayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    department: emptyToNull(values.department),
    location: emptyToNull(values.location),
    employment_type: values.employment_type,
    workplace_type: values.workplace_type,
    salary_min: values.salary_min ?? null,
    salary_max: values.salary_max ?? null,
    salary_currency: emptyToNull(values.salary_currency),
    salary_period: values.salary_period,
    experience_level: emptyToNull(values.experience_level),
    requirements: emptyToNull(values.requirements),
    responsibilities: emptyToNull(values.responsibilities),
    benefits: emptyToNull(values.benefits),
    is_active: values.is_active,
  };
}

function humanize(value?: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSalary(job: Job) {
  if (job.salary_min == null && job.salary_max == null) return "Not disclosed";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: job.salary_currency || "USD",
    maximumFractionDigits: 0,
  });
  const min = job.salary_min == null ? null : formatter.format(job.salary_min);
  const max = job.salary_max == null ? null : formatter.format(job.salary_max);
  const range =
    min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
  return `${range} ${job.salary_period ? `/ ${job.salary_period}` : ""}`;
}

function isThisMonth(date: string) {
  const value = new Date(date);
  const now = new Date();
  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth()
  );
}

const Recruitment: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const profileLoading = useUserStore((state) => state.loading);
  const organizationId = user?.organization_id ?? user?.organization?.id;
  const canManageRecruitment =
    user?.role === "hr_manager" || user?.role === "org_admin";

  const [jobForm] = Form.useForm<JobFormValues>();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");

  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["organization-jobs", organizationId, "all"],
    queryFn: () => getOrganizationJobs(organizationId as string),
    enabled: Boolean(organizationId && canManageRecruitment),
  });

  const { data: applicationsByJob = {}, isFetching: isFetchingApplications } =
    useQuery<Record<string, JobApplication[]>>({
      queryKey: [
        "job-applications-map",
        organizationId,
        jobs.map((job) => job.id).join(","),
      ],
      queryFn: async () => {
        const entries = await Promise.all(
          jobs.map(async (job) => {
            const applications = await getJobApplications(job.id);
            return [job.id, applications] as const;
          }),
        );
        return Object.fromEntries(entries);
      },
      enabled: canManageRecruitment && jobs.length > 0,
      refetchInterval: 15_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });

  const refreshRecruitment = () => {
    queryClient.invalidateQueries({ queryKey: ["organization-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    queryClient.invalidateQueries({ queryKey: ["job-applications-map"] });
  };

  const { mutate: saveJob, isPending: isSavingJob } = useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId?: string;
      payload: JobCreatePayload;
    }) => (jobId ? updateJob(jobId, payload) : createJob(payload)),
    onSuccess: (_job, variables) => {
      message.success(
        variables.jobId
          ? "Job updated successfully"
          : "Job created successfully",
      );
      refreshRecruitment();
      setIsJobModalOpen(false);
      setEditingJob(null);
      setSelectedJob(null);
      jobForm.resetFields();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to save the job."));
    },
  });

  const {
    mutate: setJobActive,
    isPending: isUpdatingJobState,
    variables: activeStateVariables,
  } = useMutation({
    mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) =>
      updateJob(jobId, { is_active: isActive }),
    onSuccess: (updatedJob) => {
      message.success(
        updatedJob.is_active
          ? "Job activated and published"
          : "Job made inactive",
      );
      refreshRecruitment();
      setSelectedJob(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to update the job status."));
    },
  });

  const { mutate: removeJob, isPending: isDeletingJob } = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      message.success("Job removed successfully");
      refreshRecruitment();
      setDeleteTarget(null);
      setSelectedJob(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to remove the job."));
    },
  });

  const visibleJobs = useMemo(() => {
    if (jobFilter === "active") return jobs.filter((job) => job.is_active);
    if (jobFilter === "inactive") return jobs.filter((job) => !job.is_active);
    return jobs;
  }, [jobFilter, jobs]);

  const jobRows = useMemo<JobRow[]>(
    () =>
      visibleJobs.map((job) => {
        const applications = applicationsByJob[job.id] ?? [];
        return {
          ...job,
          key: job.id,
          applications: applications.length,
          aiScreened: applications.filter(
            (application) => application.ranking_status === "completed",
          ).length,
        };
      }),
    [applicationsByJob, visibleJobs],
  );

  const applications = useMemo(
    () => Object.values(applicationsByJob).flat(),
    [applicationsByJob],
  );

  const stats = useMemo(() => {
    const inProcess = applications.filter((application) =>
      ["submitted", "reviewing", "shortlisted"].includes(application.status),
    ).length;
    const hiredThisMonth = applications.filter(
      (application) =>
        application.status === "hired" && isThisMonth(application.updated_at),
    ).length;

    const openCount = jobs.filter((job) => job.is_active).length;

    // These four are not a categorical series — they all wear the brand accent
    // rather than one hue each (see StatTile).
    const tiles: StatTileProps[] = [
      {
        label: "Open positions",
        value: openCount,
        icon: <FileSearchOutlined />,
        caption:
          jobs.length === 0
            ? "no roles yet"
            : jobs.length === openCount
              ? "all roles published"
              : `${jobs.length - openCount} inactive`,
      },
      {
        label: "Applications",
        value: applications.length,
        icon: <TeamOutlined />,
        caption: openCount ? `across ${openCount} open roles` : "no open roles",
      },
      {
        label: "In process",
        value: inProcess,
        icon: <ClockCircleOutlined />,
        caption: "submitted, reviewing or shortlisted",
      },
      {
        label: "Hired this month",
        value: hiredThisMonth,
        icon: <CheckCircleOutlined />,
        caption: "marked hired since the 1st",
      },
    ];
    return tiles;
  }, [applications, jobs]);

  const screenedCount = applications.filter(
    (application) => application.ranking_status === "completed",
  ).length;
  const shortlistedCount = applications.filter(
    (application) => application.status === "shortlisted",
  ).length;

  const openCreateModal = () => {
    setEditingJob(null);
    jobForm.resetFields();
    jobForm.setFieldsValue(JOB_FORM_DEFAULTS);
    setIsJobModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    jobForm.setFieldsValue({
      title: job.title,
      description: job.description,
      department: job.department ?? undefined,
      location: job.location ?? undefined,
      employment_type: job.employment_type,
      workplace_type: job.workplace_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency ?? "USD",
      salary_period: job.salary_period ?? "yearly",
      experience_level: job.experience_level ?? undefined,
      requirements: job.requirements ?? undefined,
      responsibilities: job.responsibilities ?? undefined,
      benefits: job.benefits ?? undefined,
      is_active: job.is_active,
    });
    setIsJobModalOpen(true);
  };

  const jobColumns: ColumnsType<JobRow> = [
    {
      title: "Role",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-blackColor">
            {title}
          </p>
          <p className="mt-0.5 truncate text-xs text-darkGrayColor">
            {humanize(record.employment_type)} ·{" "}
            {humanize(record.workplace_type)}
            {record.location ? ` · ${record.location}` : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string | null) =>
        department ? (
          <span className="inline-flex rounded-md bg-accentColor/10 px-2 py-0.5 text-xs font-medium text-accentDeepColor">
            {department}
          </span>
        ) : (
          <span className="text-xs text-darkGrayColor">Unassigned</span>
        ),
    },
    {
      title: "Applications",
      dataIndex: "applications",
      key: "applications",
      align: "right" as const,
      render: (count: number) => (
        <span className="text-sm font-semibold tabular-nums text-blackColor">
          {isFetchingApplications ? "…" : count}
        </span>
      ),
    },
    {
      title: "AI screening",
      dataIndex: "aiScreened",
      key: "aiScreened",
      width: 190,
      render: (screened: number, record) => {
        const percent = record.applications
          ? Math.round((screened / record.applications) * 100)
          : 0;
        return (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-xs text-darkGrayColor">
                {isFetchingApplications
                  ? "Loading"
                  : record.applications
                    ? `${screened}/${record.applications}`
                    : "No applicants"}
              </span>
              {record.applications > 0 && (
                <span className="text-xs tabular-nums text-grayColor">
                  {percent}%
                </span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEEF3]">
              <div
                style={{ width: `${percent}%` }}
                className="h-full rounded-full bg-accentDeepColor transition-[width] duration-500"
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Published",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          checkedChildren="Live"
          unCheckedChildren="Off"
          loading={
            isUpdatingJobState && activeStateVariables?.jobId === record.id
          }
          onChange={(checked) =>
            setJobActive({ jobId: record.id, isActive: checked })
          }
        />
      ),
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_value, record) => (
        <Space size={8}>
          <Button size="small" onClick={() => setSelectedJob(record)}>
            Details
          </Button>
          <Link href={`/orgnization/recruitment/${record.slug}`}>
            <Button size="small" type="primary">
              Candidates
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  /** Shared by the loading and permission states so the page never jumps. */
  const pageHeading = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
        Recruitment &amp; ATS
      </h1>
      <p className="mt-1 text-sm text-grayColor">
        Post roles, track applicants, and let the assistant rank every resume.
      </p>
    </div>
  );

  if (!user || profileLoading || (organizationId && isLoadingJobs)) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <LoadingSpinner />
      </div>
    );
  }

  if (!canManageRecruitment || !organizationId) {
    return (
      <div className="space-y-5">
        {pageHeading}
        <div className="hrx-card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
            <InboxOutlined />
          </span>
          <p className="mt-1 text-sm font-medium text-blackColor">
            {!canManageRecruitment
              ? "You do not have access to recruitment"
              : "No organization linked"}
          </p>
          <p className="max-w-sm text-sm text-grayColor">
            {!canManageRecruitment
              ? "Ask an organization admin to grant you recruitment permissions."
              : "Your account is not linked to an organization yet."}
          </p>
        </div>
      </div>
    );
  }

  const screenPercent = applications.length
    ? Math.round((screenedCount / applications.length) * 100)
    : 0;

  const jobsEmptyState = (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
        <InboxOutlined />
      </span>
      <p className="mt-1 text-sm font-medium text-blackColor">
        {isJobsError
          ? "Could not load jobs"
          : jobFilter === "all"
            ? "No jobs posted yet"
            : `No ${jobFilter} jobs`}
      </p>
      <p className="max-w-sm text-sm text-grayColor">
        {isJobsError
          ? "Something went wrong fetching this organization's jobs. Try again in a moment."
          : jobFilter === "all"
            ? "Post your first role and the assistant will start screening resumes as they arrive."
            : "Switch the filter to see the rest of your roles."}
      </p>
      {!isJobsError && jobFilter === "all" && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="mt-3"
          onClick={openCreateModal}
        >
          Post a job
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ---------- Page header ---------- */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {pageHeading}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          className="shrink-0"
        >
          Post a job
        </Button>
      </header>

      {/* ---------- Stat tiles ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      {/* ---------- AI screening strip ---------- */}
      <section className="rounded-2xl border border-accentColor/25 bg-gradient-to-r from-accentColor/[0.07] to-glowColor/[0.05] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-accentDeepColor" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accentDeepColor" />
              </span>
              <span className="text-xs font-semibold text-blackColor">
                AI resume screening
              </span>
            </div>
            <p className="text-sm text-grayColor">
              {applications.length === 0 ? (
                "No applications yet. Every resume that arrives is ranked automatically."
              ) : (
                <>
                  Screened{" "}
                  <span className="font-medium text-blackColor">
                    {screenedCount} of {applications.length}
                  </span>{" "}
                  {applications.length === 1 ? "resume" : "resumes"}
                  {shortlistedCount > 0
                    ? `, ${shortlistedCount} shortlisted.`
                    : "."}{" "}
                  Open a role to review its rankings.
                </>
              )}
            </p>
          </div>

          {applications.length > 0 && (
            <div className="w-full shrink-0 sm:w-52">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-xs text-grayColor">Screened</span>
                <span className="text-sm font-semibold tabular-nums text-blackColor">
                  {screenPercent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-whiteColor">
                <div
                  style={{ width: `${screenPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-accentDeepColor to-glowColor transition-[width] duration-500"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Jobs ---------- */}
      <Panel
        flush
        title="Jobs"
        icon={<FileSearchOutlined />}
        action={
          <Select<JobFilter>
            aria-label="Filter jobs"
            value={jobFilter}
            onChange={setJobFilter}
            size="small"
            className="min-w-36"
            options={[
              { label: `All (${jobs.length})`, value: "all" },
              {
                label: `Active (${jobs.filter((job) => job.is_active).length})`,
                value: "active",
              },
              {
                label: `Inactive (${jobs.filter((job) => !job.is_active).length})`,
                value: "inactive",
              },
            ]}
          />
        }
      >
        <Table<JobRow>
          columns={jobColumns}
          dataSource={jobRows}
          pagination={false}
          loading={isLoadingJobs}
          scroll={{ x: 1000 }}
          locale={{ emptyText: jobsEmptyState }}
        />
      </Panel>

      <Modal
        title={
          <div>
            <p className="text-base font-semibold text-blackColor">
              {editingJob ? "Edit job" : "Post a job"}
            </p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              {editingJob
                ? "Changes go live on the public job page immediately."
                : "Published roles appear on your careers page and start collecting applications."}
            </p>
          </div>
        }
        open={isJobModalOpen}
        onCancel={() => {
          if (isSavingJob) return;
          setIsJobModalOpen(false);
          setEditingJob(null);
          jobForm.resetFields();
        }}
        onOk={() => jobForm.submit()}
        okText={editingJob ? "Save changes" : "Post job"}
        confirmLoading={isSavingJob}
        width={760}
        centered
        destroyOnHidden
        // The body scrolls vertically, which makes it a scroll container — and
        // AntD's `Row gutter` negative margins then push 8px past its right
        // edge. The inline padding gives those margins room to land in.
        styles={{
          body: {
            maxHeight: "68vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingInline: 8,
          },
        }}
      >
        <Form<JobFormValues>
          form={jobForm}
          layout="vertical"
          requiredMark={false}
          initialValues={JOB_FORM_DEFAULTS}
          className="pt-4"
          onFinish={(values) =>
            saveJob({
              jobId: editingJob?.id,
              payload: toJobPayload(values),
            })
          }
        >
          <FormSection title="The role">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <CustomInput
                  name="title"
                  label="Job Title"
                  placeholder="e.g. Senior Software Engineer"
                />
              </Col>
              <Col xs={24} md={12}>
                <CustomInput
                  name="department"
                  label="Department"
                  placeholder="e.g. Engineering"
                  required={false}
                />
              </Col>
            </Row>
            <CustomInput
              name="description"
              label="Description"
              placeholder="Describe the role and its purpose"
              type="textarea"
              rows={4}
            />
            <Form.Item
              name="is_active"
              label={
                <span className="text-secondaryTextColor font-medium">
                  Visibility
                </span>
              }
            >
              <Select
                size="large"
                options={[
                  { label: "Active — visible publicly", value: true },
                  { label: "Inactive — hidden publicly", value: false },
                ]}
              />
            </Form.Item>
          </FormSection>

          <FormSection title="Where and how" className="mt-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <CustomInput
                  name="location"
                  label="Location"
                  placeholder="e.g. Lahore, Pakistan"
                  required={false}
                />
              </Col>
              <Col xs={24} md={12}>
                <CustomInput
                  name="experience_level"
                  label="Experience Level"
                  placeholder="e.g. Senior, 5+ years"
                  required={false}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="employment_type"
                  label={
                    <span className="text-secondaryTextColor font-medium">
                      Employment Type
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select an employment type",
                    },
                  ]}
                >
                  <Select size="large" options={EMPLOYMENT_TYPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="workplace_type"
                  label={
                    <span className="text-secondaryTextColor font-medium">
                      Workplace Type
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select a workplace type",
                    },
                  ]}
                >
                  <Select size="large" options={WORKPLACE_TYPE_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <FormSection
            title="Compensation"
            hint="optional — leave blank to show “Not disclosed”"
            className="mt-6"
          >
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="salary_min"
                  label={
                    <span className="text-secondaryTextColor font-medium">
                      Minimum Salary
                    </span>
                  }
                >
                  <InputNumber
                    min={0}
                    precision={0}
                    className="!w-full"
                    size="large"
                    placeholder="Minimum"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="salary_max"
                  dependencies={["salary_min"]}
                  label={
                    <span className="text-secondaryTextColor font-medium">
                      Maximum Salary
                    </span>
                  }
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const minimum = getFieldValue("salary_min");
                        if (
                          value == null ||
                          minimum == null ||
                          value >= minimum
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "Maximum must be greater than or equal to minimum",
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={0}
                    className="!w-full"
                    size="large"
                    placeholder="Maximum"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <CustomInput
                  name="salary_currency"
                  label="Currency"
                  placeholder="USD"
                  required={false}
                />
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="salary_period"
                  label={
                    <span className="text-secondaryTextColor font-medium">
                      Salary Period
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select a salary period",
                    },
                  ]}
                >
                  <Select size="large" options={SALARY_PERIOD_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <FormSection title="The detail" className="mt-6">
            <CustomInput
              name="requirements"
              label="Requirements"
              placeholder="List the skills and qualifications required"
              type="textarea"
              rows={3}
              required={false}
            />
            <CustomInput
              name="responsibilities"
              label="Responsibilities"
              placeholder="List the main responsibilities"
              type="textarea"
              rows={3}
              required={false}
            />
            <CustomInput
              name="benefits"
              label="Benefits"
              placeholder="Describe benefits and perks"
              type="textarea"
              rows={3}
              required={false}
            />
          </FormSection>
        </Form>
      </Modal>

      <Modal
        title={
          selectedJob ? (
            <div className="flex min-w-0 items-center gap-2.5 pr-8">
              <span className="truncate text-base font-semibold text-blackColor">
                {selectedJob.title}
              </span>
              <Tag
                variant="filled"
                className="!m-0 !rounded-md !px-2 !py-0.5 !text-xs !font-medium"
                color={selectedJob.is_active ? "success" : "default"}
              >
                {selectedJob.is_active ? "Live" : "Inactive"}
              </Tag>
            </div>
          ) : (
            "Job details"
          )
        }
        open={selectedJob != null}
        onCancel={() => setSelectedJob(null)}
        width={760}
        centered
        footer={
          selectedJob
            ? [
                <Button
                  key="remove"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeleteTarget(selectedJob)}
                >
                  Remove
                </Button>,
                <Button
                  key="active-state"
                  loading={isUpdatingJobState}
                  onClick={() =>
                    setJobActive({
                      jobId: selectedJob.id,
                      isActive: !selectedJob.is_active,
                    })
                  }
                >
                  {selectedJob.is_active ? "Make Inactive" : "Activate Job"}
                </Button>,
                <Button
                  key="public-page"
                  icon={<ExportOutlined />}
                  href={`/jobs/${user.organization?.slug}/${selectedJob.slug}`}
                  target="_blank"
                  disabled={!user.organization?.slug || !selectedJob.is_active}
                >
                  View Public Page
                </Button>,
                <Button
                  key="edit"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedJob(null);
                    openEditModal(selectedJob);
                  }}
                >
                  Edit Job
                </Button>,
              ]
            : null
        }
      >
        {selectedJob && (
          <div className="pt-2">
            <DefinitionGrid
              items={[
                ["Department", selectedJob.department || "—"],
                ["Location", selectedJob.location || "—"],
                ["Employment", humanize(selectedJob.employment_type)],
                ["Workplace", humanize(selectedJob.workplace_type)],
                ["Experience", selectedJob.experience_level || "—"],
                ["Salary", formatSalary(selectedJob)],
                [
                  "Applications",
                  (applicationsByJob[selectedJob.id] ?? []).length,
                ],
                [
                  "Posted",
                  new Date(selectedJob.created_at).toLocaleDateString(),
                ],
              ]}
            />

            {(
              [
                ["Description", selectedJob.description],
                ["Requirements", selectedJob.requirements],
                ["Responsibilities", selectedJob.responsibilities],
                ["Benefits", selectedJob.benefits],
              ] as const
            ).map(([heading, body]) =>
              body ? (
                <ProseSection key={heading} heading={heading}>
                  {body}
                </ProseSection>
              ) : null,
            )}
          </div>
        )}
      </Modal>

      <MyModal
        open={deleteTarget != null}
        title="Delete Job Permanently"
        description={`Permanently delete ${deleteTarget?.title ?? "this job"}?`}
        subDescription="This permanently deletes the job and all of its applications. This action cannot be undone."
        okText="Delete Permanently"
        okIcon={<DeleteOutlined />}
        danger
        confirmLoading={isDeletingJob}
        onConfirm={() => {
          if (deleteTarget) removeJob(deleteTarget.id);
        }}
        onCancel={() => {
          if (!isDeletingJob) setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default Recruitment;
