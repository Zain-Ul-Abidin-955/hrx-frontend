"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
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
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
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
  updateJobApplicationStatus,
} from "@/api/collection/jobs";
import type {
  Job,
  JobApplication,
  JobApplicationStatus,
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
}

interface JobRow extends Job {
  key: string;
  applications: number;
  aiScreened: number;
}

interface CandidateRow extends JobApplication {
  key: string;
  name: string;
  email: string;
  position: string;
  job: Job;
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
};

const APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  submitted: "Submitted",
  reviewing: "Screening",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

const APPLICATION_STATUS_COLORS: Record<JobApplicationStatus, string> = {
  submitted: "default",
  reviewing: "orange",
  shortlisted: "blue",
  rejected: "red",
  hired: "green",
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
    status: "open",
    salary_min: values.salary_min ?? null,
    salary_max: values.salary_max ?? null,
    salary_currency: emptyToNull(values.salary_currency),
    salary_period: values.salary_period,
    experience_level: emptyToNull(values.experience_level),
    requirements: emptyToNull(values.requirements),
    responsibilities: emptyToNull(values.responsibilities),
    benefits: emptyToNull(values.benefits),
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
  const [resumeTarget, setResumeTarget] = useState<CandidateRow | null>(null);
  const candidatesSectionRef = useRef<HTMLDivElement>(null);

  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["organization-jobs", organizationId, "open"],
    queryFn: () => getOrganizationJobs(organizationId as string, "open"),
    enabled: Boolean(organizationId && canManageRecruitment),
  });

  const {
    data: applicationsByJob = {},
    isLoading: isLoadingApplications,
    isFetching: isFetchingApplications,
    isError: isApplicationsError,
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
        variables.jobId ? "Job updated successfully" : "Job posted successfully",
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

  const { mutate: closeJob, isPending: isClosingJob } = useMutation({
    mutationFn: (jobId: string) => updateJob(jobId, { status: "closed" }),
    onSuccess: () => {
      message.success("Position closed successfully");
      refreshRecruitment();
      setSelectedJob(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to close the position."));
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

  const { mutate: shortlistCandidate, isPending: isUpdatingCandidate } =
    useMutation({
      mutationFn: (applicationId: string) =>
        updateJobApplicationStatus(applicationId, { status: "shortlisted" }),
      onSuccess: () => {
        message.success("Candidate shortlisted successfully");
        queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      },
      onError: (error) => {
        message.error(
          getErrorMessage(error, "Failed to shortlist the candidate."),
        );
      },
    });

  const jobRows = useMemo<JobRow[]>(
    () =>
      jobs.map((job) => {
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
    [applicationsByJob, jobs],
  );

  const candidates = useMemo<CandidateRow[]>(
    () =>
      jobs
        .flatMap((job) =>
          (applicationsByJob[job.id] ?? []).map((application) => ({
            ...application,
            key: application.id,
            name:
              application.candidate_name ||
              application.parsed_resume?.full_name ||
              "Candidate",
            email:
              application.candidate_email ||
              application.parsed_resume?.email ||
              "—",
            position: job.title,
            job,
          })),
        )
        .sort(
          (left, right) =>
            (right.ranking_score ?? -1) - (left.ranking_score ?? -1),
        ),
    [applicationsByJob, jobs],
  );

  const stats = useMemo(() => {
    const inProcess = candidates.filter((candidate) =>
      ["submitted", "reviewing", "shortlisted"].includes(candidate.status),
    ).length;
    const hiredThisMonth = candidates.filter(
      (candidate) =>
        candidate.status === "hired" && isThisMonth(candidate.updated_at),
    ).length;

    return [
      {
        title: "Open Positions",
        value: String(jobs.length),
        icon: <FileTextOutlined className="text-3xl text-blue-600" />,
        bgColor: "bg-blue-50",
      },
      {
        title: "Applications",
        value: String(candidates.length),
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
  }, [candidates, jobs.length]);

  const screenedCount = candidates.filter(
    (candidate) => candidate.ranking_status === "completed",
  ).length;
  const shortlistedCount = candidates.filter(
    (candidate) => candidate.status === "shortlisted",
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
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="green">Active</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_value, record) => (
        <Button
          type="primary"
          size="small"
          className="!bg-primaryColor"
          onClick={() => setSelectedJob(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const candidateColumns: ColumnsType<CandidateRow> = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "AI Score",
      dataIndex: "ranking_score",
      key: "ranking_score",
      render: (score: number | null, record) => {
        if (score == null) {
          return (
            <Tag color={record.ranking_status === "failed" ? "red" : "gold"}>
              {record.ranking_status === "failed" ? "Unavailable" : "Pending"}
            </Tag>
          );
        }
        return (
          <div className="flex items-center space-x-2">
            <Progress
              type="circle"
              percent={score}
              size={40}
              strokeColor={
                score >= 80
                  ? "#10b981"
                  : score >= 60
                    ? "#f59e0b"
                    : "#ef4444"
              }
            />
            <span className="font-semibold text-gray-700">{score}%</span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: JobApplicationStatus) => (
        <Tag color={APPLICATION_STATUS_COLORS[status]}>
          {APPLICATION_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_value, record) => {
        const cannotShortlist = ["shortlisted", "rejected", "hired"].includes(
          record.status,
        );
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              className="!bg-green-600"
              disabled={cannotShortlist}
              loading={isUpdatingCandidate}
              onClick={() => shortlistCandidate(record.id)}
            >
              {record.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
            </Button>
            <Button size="small" onClick={() => setResumeTarget(record)}>
              View Resume
            </Button>
          </Space>
        );
      },
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
                : ". Ranked candidates appear below as applications arrive."}
            </p>
          </div>
          <Button
            type="primary"
            className="!bg-purple-600"
            disabled={candidates.length === 0}
            onClick={() =>
              candidatesSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            View Results
          </Button>
        </div>
      </Card>

      <Card
        title={<span className="text-lg font-semibold">Open Positions</span>}
      >
        <Table<JobRow>
          columns={jobColumns}
          dataSource={jobRows}
          pagination={false}
          loading={isLoadingJobs}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: isJobsError
              ? "Failed to load open positions. Please try again."
              : "No open positions yet",
          }}
        />
      </Card>

      <div ref={candidatesSectionRef}>
        <Card
          title={
            <span className="text-lg font-semibold">
              Top AI-Matched Candidates
            </span>
          }
        >
          <Table<CandidateRow>
            columns={candidateColumns}
            dataSource={candidates}
            pagination={false}
            loading={isLoadingApplications || isFetchingApplications}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: isApplicationsError
                ? "Failed to load candidates. Please try again."
                : "No applications received yet",
            }}
          />
        </Card>
      </div>

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
                  key="close"
                  loading={isClosingJob}
                  onClick={() => closeJob(selectedJob.id)}
                >
                  Close Position
                </Button>,
                <Button
                  key="public-page"
                  icon={<ExportOutlined />}
                  href={`/jobs/${user.organization?.slug}/${selectedJob.slug}`}
                  target="_blank"
                  disabled={!user.organization?.slug}
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

      <Modal
        title={
          resumeTarget
            ? `${resumeTarget.name} — Resume`
            : "Candidate Resume"
        }
        open={resumeTarget != null}
        onCancel={() => setResumeTarget(null)}
        footer={<Button onClick={() => setResumeTarget(null)}>Close</Button>}
        width={760}
        centered
      >
        {resumeTarget && (
          <div className="pt-3 max-h-[70vh] overflow-y-auto pr-2">
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Email">
                {resumeTarget.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {resumeTarget.candidate_phone ||
                  resumeTarget.parsed_resume?.phone ||
                  "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {resumeTarget.candidate_location ||
                  resumeTarget.parsed_resume?.location ||
                  "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {resumeTarget.parsed_resume?.total_experience_years != null
                  ? `${resumeTarget.parsed_resume.total_experience_years} years`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="AI recommendation">
                {humanize(resumeTarget.ranking_recommendation)}
              </Descriptions.Item>
              <Descriptions.Item label="AI score">
                {resumeTarget.ranking_score == null
                  ? "Pending"
                  : `${resumeTarget.ranking_score}%`}
              </Descriptions.Item>
            </Descriptions>

            {(resumeTarget.summary || resumeTarget.parsed_resume?.summary) && (
              <>
                <Divider titlePlacement="start">Summary</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {resumeTarget.summary || resumeTarget.parsed_resume?.summary}
                </p>
              </>
            )}

            <Divider titlePlacement="start">Skills</Divider>
            {resumeTarget.parsed_resume?.skills.length ? (
              <Space size={[4, 8]} wrap>
                {resumeTarget.parsed_resume.skills.map((skill) => (
                  <Tag color="blue" key={skill}>
                    {skill}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No skills extracted"
              />
            )}

            {resumeTarget.parsed_resume?.work_experience.map(
              (experience, index) => (
                <div
                  key={`${experience.company}-${experience.title}-${index}`}
                >
                  {index === 0 && (
                    <Divider titlePlacement="start">Work Experience</Divider>
                  )}
                  <p className="font-semibold text-gray-800">
                    {[experience.title, experience.company]
                      .filter(Boolean)
                      .join(" at ") || "Experience"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {[experience.start_date, experience.end_date]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                  {experience.description && (
                    <p className="mt-1 mb-3 whitespace-pre-wrap text-gray-700">
                      {experience.description}
                    </p>
                  )}
                </div>
              ),
            )}

            {resumeTarget.ranking_rationale && (
              <>
                <Divider titlePlacement="start">AI Assessment</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {resumeTarget.ranking_rationale}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-semibold text-green-700 mb-2">
                      Strengths
                    </p>
                    {(resumeTarget.ranking_strengths ?? []).map((strength) => (
                      <p
                        className="text-sm text-gray-700 mb-1"
                        key={strength}
                      >
                        • {strength}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 mb-2">Gaps</p>
                    {(resumeTarget.ranking_gaps ?? []).map((gap) => (
                      <p className="text-sm text-gray-700 mb-1" key={gap}>
                        • {gap}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}

            {resumeTarget.cover_letter && (
              <>
                <Divider titlePlacement="start">Cover Letter</Divider>
                <p className="whitespace-pre-wrap text-gray-700">
                  {resumeTarget.cover_letter}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>

      <MyModal
        open={deleteTarget != null}
        title="Remove Job"
        description={`Remove ${deleteTarget?.title ?? "this job"} from active recruitment?`}
        subDescription="The position and its applications will no longer appear in this dashboard."
        okText="Remove Job"
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
