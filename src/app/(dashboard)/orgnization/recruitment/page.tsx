"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  InputNumber,
  Modal,
  Progress,
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
  FileTextOutlined,
  PlusOutlined,
  RobotOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import CustomInput from "@/components/input/CustomInput";
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
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return (
      data.detail.map((item) => item?.msg).filter(Boolean).join(", ") ||
      fallback
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

  const {
    data: applicationsByJob = {},
    isFetching: isFetchingApplications,
  } = useQuery<Record<string, JobApplication[]>>({
    queryKey: ["job-applications", jobs.map((job) => job.id).join(",")],
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
        variables.jobId ? "Job updated successfully" : "Job created successfully",
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

    return [
      {
        title: "Open Positions",
        value: String(jobs.filter((job) => job.is_active).length),
        icon: <FileTextOutlined className="text-3xl text-blue-600" />,
        bgColor: "bg-blue-50",
      },
      {
        title: "Applications",
        value: String(applications.length),
        icon: <TeamOutlined className="text-3xl text-purple-600" />,
        bgColor: "bg-purple-50",
      },
      {
        title: "In Process",
        value: String(inProcess),
        icon: <ClockCircleOutlined className="text-3xl text-orange-600" />,
        bgColor: "bg-orange-50",
      },
      {
        title: "Hired This Month",
        value: String(hiredThisMonth),
        icon: <CheckCircleOutlined className="text-3xl text-green-600" />,
        bgColor: "bg-green-50",
      },
    ];
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
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {humanize(record.employment_type)} ·{" "}
            {humanize(record.workplace_type)}
          </p>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string | null) => (
        <Tag color="blue">{department || "Unassigned"}</Tag>
      ),
    },
    {
      title: "Applications",
      dataIndex: "applications",
      key: "applications",
      render: (count: number) => (
        <span className="font-medium text-gray-700">
          {isFetchingApplications ? "…" : count}
        </span>
      ),
    },
    {
      title: "AI Screening",
      dataIndex: "aiScreened",
      key: "aiScreened",
      width: 180,
      render: (screened: number, record) => (
        <Progress
          percent={
            record.applications
              ? Math.round((screened / record.applications) * 100)
              : 0
          }
          size="small"
          format={() =>
            isFetchingApplications
              ? "Loading"
              : `${screened}/${record.applications}`
          }
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
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
      title: "Action",
      key: "action",
      render: (_value, record) => (
        <Space>
          <Link href={`/orgnization/recruitment/${record.slug}`}>
            <Button type="primary" size="small" className="!bg-primaryColor">
              Manage Candidates
            </Button>
          </Link>
          <Button size="small" onClick={() => setSelectedJob(record)}>
            Details
          </Button>
        </Space>
      ),
    },
  ];

  if (!user || profileLoading || (organizationId && isLoadingJobs)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Recruitment & ATS
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered applicant tracking system
          </p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!canManageRecruitment || !organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Recruitment & ATS
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered applicant tracking system
          </p>
        </div>
        <Card>
          <p className="text-gray-600">
            {!canManageRecruitment
              ? "You do not have permission to manage recruitment."
              : "Your account is not linked to an organization."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Recruitment & ATS
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered applicant tracking system
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="!bg-primaryColor"
          onClick={openCreateModal}
        >
          Post New Job
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="bg-linear-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-full self-start">
            <RobotOutlined className="text-3xl text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              AI-Powered Resume Screening
            </h3>
            <p className="text-gray-600 text-sm">
              AI has screened {screenedCount}{" "}
              {screenedCount === 1 ? "resume" : "resumes"}
              {shortlistedCount > 0
                ? `, with ${shortlistedCount} currently shortlisted.`
                : "."}{" "}
              Open a position below to review its candidates and rankings.
            </p>
          </div>
        </div>
      </Card>

      <Card
        title={<span className="text-lg font-semibold">Jobs</span>}
        extra={
          <Select<JobFilter>
            aria-label="Filter jobs"
            value={jobFilter}
            onChange={setJobFilter}
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
          locale={{
            emptyText: isJobsError
              ? "Failed to load jobs. Please try again."
              : "No jobs in this view",
          }}
        />
      </Card>

      <Modal
        title={editingJob ? "Edit Job" : "Post New Job"}
        open={isJobModalOpen}
        onCancel={() => {
          if (isSavingJob) return;
          setIsJobModalOpen(false);
          setEditingJob(null);
          jobForm.resetFields();
        }}
        onOk={() => jobForm.submit()}
        okText={editingJob ? "Save Changes" : "Post Job"}
        confirmLoading={isSavingJob}
        okButtonProps={{ className: "!bg-primaryColor" }}
        width={760}
        centered
        destroyOnHidden
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
        </Form>
      </Modal>

      <Modal
        title={selectedJob?.title ?? "Job Details"}
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
                  className="!bg-primaryColor"
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
          <div className="pt-3">
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Department">
                {selectedJob.department || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedJob.location || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Employment">
                {humanize(selectedJob.employment_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Workplace">
                {humanize(selectedJob.workplace_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedJob.experience_level || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Salary">
                {formatSalary(selectedJob)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedJob.is_active ? "green" : "default"}>
                  {selectedJob.is_active ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Applications" span={2}>
                {(applicationsByJob[selectedJob.id] ?? []).length}
              </Descriptions.Item>
            </Descriptions>
            <Divider titlePlacement="start">Description</Divider>
            <p className="whitespace-pre-wrap text-gray-700">
              {selectedJob.description}
            </p>
            {selectedJob.requirements && (
              <>
                <Divider titlePlacement="start">Requirements</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {selectedJob.requirements}
                </p>
              </>
            )}
            {selectedJob.responsibilities && (
              <>
                <Divider titlePlacement="start">Responsibilities</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {selectedJob.responsibilities}
                </p>
              </>
            )}
            {selectedJob.benefits && (
              <>
                <Divider titlePlacement="start">Benefits</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {selectedJob.benefits}
                </p>
              </>
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
