"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  RobotOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  deleteJobApplication,
  getJobApplications,
  getOrganizationJobs,
  rerankJobApplications,
  updateJobApplicationStatus,
} from "@/api/collection/jobs";
import { LoadingSpinner } from "@/components/loader/Loading";
import useUserStore from "@/store/userStore";
import type {
  Job,
  JobApplication,
  JobApplicationStatus,
} from "@/types/job";

type CandidateFilter = "active" | "all" | JobApplicationStatus;

interface CandidateRow extends JobApplication {
  key: string;
  name: string;
  email: string;
}

const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  submitted: "Submitted",
  reviewing: "Screening",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

const STATUS_COLORS: Record<JobApplicationStatus, string> = {
  submitted: "default",
  reviewing: "orange",
  shortlisted: "blue",
  rejected: "red",
  hired: "green",
};

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
  const minimum =
    job.salary_min == null ? null : formatter.format(job.salary_min);
  const maximum =
    job.salary_max == null ? null : formatter.format(job.salary_max);
  const range =
    minimum && maximum
      ? `${minimum} – ${maximum}`
      : minimum
        ? `From ${minimum}`
        : `Up to ${maximum}`;
  return `${range}${job.salary_period ? ` / ${job.salary_period}` : ""}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item?.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}

export default function JobCandidatesPage() {
  const params = useParams<{ jobSlug: string }>();
  const jobSlug = params.jobSlug;
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const profileLoading = useUserStore((state) => state.loading);
  const organizationId = user?.organization_id ?? user?.organization?.id;
  const canManageRecruitment =
    user?.role === "hr_manager" || user?.role === "org_admin";
  const [filter, setFilter] = useState<CandidateFilter>("all");
  const [resumeTarget, setResumeTarget] = useState<CandidateRow | null>(null);

  const {
    data: jobs = [],
    isLoading: isLoadingJob,
    isError: isJobError,
  } = useQuery({
    queryKey: ["organization-jobs", organizationId, "all"],
    queryFn: () => getOrganizationJobs(organizationId as string),
    enabled: Boolean(organizationId && canManageRecruitment),
  });
  const job = jobs.find((candidateJob) => candidateJob.slug === jobSlug);
  const jobId = job?.id;

  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    isFetching: isFetchingApplications,
    isError: isApplicationsError,
  } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: () => getJobApplications(jobId as string),
    enabled: Boolean(jobId && canManageRecruitment),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const candidates = useMemo<CandidateRow[]>(
    () =>
      applications.map((application) => ({
        ...application,
        key: application.id,
        name:
          application.candidate_name ||
          application.parsed_resume?.full_name ||
          "Candidate",
        email:
          application.candidate_email || application.parsed_resume?.email || "—",
      })),
    [applications],
  );

  const visibleCandidates = useMemo(() => {
    if (filter === "all") return candidates;
    if (filter === "active") {
      return candidates.filter((candidate) => candidate.status !== "rejected");
    }
    return candidates.filter((candidate) => candidate.status === filter);
  }, [candidates, filter]);

  const counts = useMemo(
    () => ({
      active: candidates.filter((candidate) => candidate.status !== "rejected")
        .length,
      shortlisted: candidates.filter(
        (candidate) => candidate.status === "shortlisted",
      ).length,
      rejected: candidates.filter((candidate) => candidate.status === "rejected")
        .length,
      screened: candidates.filter(
        (candidate) => candidate.ranking_status === "completed",
      ).length,
    }),
    [candidates],
  );

  const {
    mutate: changeCandidateStatus,
    isPending: isUpdatingCandidate,
    variables: statusVariables,
  } = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: "shortlisted" | "rejected";
    }) => updateJobApplicationStatus(applicationId, { status }),
    onSuccess: (updatedApplication, variables) => {
      queryClient.setQueryData<JobApplication[]>(
        ["job-applications", jobId],
        (current = []) =>
          current.map((application) =>
            application.id === updatedApplication.id
              ? updatedApplication
              : application,
          ),
      );
      message.success(
        variables.status === "shortlisted"
          ? "Candidate shortlisted successfully"
          : "Candidate rejected and moved to the Rejected view",
      );
      queryClient.invalidateQueries({
        queryKey: ["job-applications", jobId],
      });
    },
    onError: (error, variables) => {
      message.error(
        getErrorMessage(
          error,
          variables.status === "shortlisted"
            ? "Failed to shortlist the candidate."
            : "Failed to reject the candidate.",
        ),
      );
    },
  });

  const { mutate: rerankCandidates, isPending: isReranking } = useMutation({
    mutationFn: () => rerankJobApplications(jobId as string),
    onSuccess: (rankedApplications) => {
      queryClient.setQueryData(
        ["job-applications", jobId],
        rankedApplications,
      );
      message.success(`Rankings updated for ${job?.title ?? "this job"}`);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Failed to re-evaluate rankings."));
    },
  });

  const {
    mutate: removeCandidate,
    isPending: isDeletingCandidate,
    variables: deletingApplicationId,
  } = useMutation({
    mutationFn: (applicationId: string) =>
      deleteJobApplication(applicationId),
    onSuccess: (_result, applicationId) => {
      queryClient.setQueryData<JobApplication[]>(
        ["job-applications", jobId],
        (current = []) =>
          current.filter((application) => application.id !== applicationId),
      );
      if (resumeTarget?.id === applicationId) setResumeTarget(null);
      message.success("Candidate application permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to delete the candidate application."),
      );
    },
  });

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
      title: "AI Score",
      dataIndex: "ranking_score",
      key: "ranking_score",
      sorter: (left, right) =>
        (left.ranking_score ?? -1) - (right.ranking_score ?? -1),
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
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: "Applied",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_value, record) => {
        const cannotShortlist = ["shortlisted", "hired"].includes(record.status);
        const cannotReject = ["rejected", "hired"].includes(record.status);
        return (
          <Space wrap>
            <Button
              type="primary"
              size="small"
              className="!bg-green-600"
              disabled={cannotShortlist}
              loading={
                isUpdatingCandidate &&
                statusVariables?.applicationId === record.id &&
                statusVariables.status === "shortlisted"
              }
              onClick={() =>
                changeCandidateStatus({
                  applicationId: record.id,
                  status: "shortlisted",
                })
              }
            >
              {record.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
            </Button>
            <Popconfirm
              title="Reject this candidate?"
              description="The record will be retained under the Rejected filter and the candidate will be notified by email."
              okText="Reject and notify"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              disabled={cannotReject}
              onConfirm={() =>
                changeCandidateStatus({
                  applicationId: record.id,
                  status: "rejected",
                })
              }
            >
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                disabled={cannotReject}
                loading={
                  isUpdatingCandidate &&
                  statusVariables?.applicationId === record.id &&
                  statusVariables.status === "rejected"
                }
              >
                {record.status === "rejected" ? "Rejected" : "Reject"}
              </Button>
            </Popconfirm>
            <Button size="small" onClick={() => setResumeTarget(record)}>
              View Resume
            </Button>
            <Popconfirm
              title="Delete this candidate application?"
              description="This permanently removes the application and ranking data. This action cannot be undone."
              okText="Delete permanently"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={() => removeCandidate(record.id)}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={
                  isDeletingCandidate && deletingApplicationId === record.id
                }
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  if (!user || profileLoading || isLoadingJob) {
    return <LoadingSpinner />;
  }

  if (!canManageRecruitment) {
    return (
      <Card>
        <p className="text-gray-600">
          You do not have permission to manage recruitment.
        </p>
      </Card>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="space-y-4">
        <Link href="/orgnization/recruitment">
          <Button icon={<ArrowLeftOutlined />}>Back to Recruitment</Button>
        </Link>
        <Card>
          <Empty description="This job could not be loaded." />
        </Card>
      </div>
    );
  }

  const filterOptions = [
    { label: `Active (${counts.active})`, value: "active" },
    { label: `All (${candidates.length})`, value: "all" },
    { label: `Submitted (${candidates.filter((item) => item.status === "submitted").length})`, value: "submitted" },
    { label: `Screening (${candidates.filter((item) => item.status === "reviewing").length})`, value: "reviewing" },
    { label: `Shortlisted (${counts.shortlisted})`, value: "shortlisted" },
    { label: `Rejected (${counts.rejected})`, value: "rejected" },
    { label: `Hired (${candidates.filter((item) => item.status === "hired").length})`, value: "hired" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/orgnization/recruitment">
          <Button type="link" className="!px-0" icon={<ArrowLeftOutlined />}>
            Back to Recruitment
          </Button>
        </Link>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
              <Tag color={job.is_active ? "green" : "default"}>
                {job.is_active ? "Active" : "Inactive"}
              </Tag>
            </div>
            <p className="mt-1 text-gray-600">
              Candidates and rankings for this position only
            </p>
          </div>
          <Button
            icon={<ExportOutlined />}
            href={`/jobs/${user.organization?.slug}/${job.slug}`}
            target="_blank"
            disabled={!user.organization?.slug || !job.is_active}
          >
            View Public Job
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Candidates</p>
                <p className="text-3xl font-bold text-gray-800">{counts.active}</p>
              </div>
              <TeamOutlined className="text-3xl text-blue-600" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI Screened</p>
                <p className="text-3xl font-bold text-gray-800">{counts.screened}</p>
              </div>
              <RobotOutlined className="text-3xl text-purple-600" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-800">
                  {counts.shortlisted}
                </p>
              </div>
              <CheckCircleOutlined className="text-3xl text-green-600" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-3xl font-bold text-gray-800">{counts.rejected}</p>
              </div>
              <CloseCircleOutlined className="text-3xl text-red-500" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Job Description">
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Department">
            {job.department || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {job.location || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Employment">
            {humanize(job.employment_type)}
          </Descriptions.Item>
          <Descriptions.Item label="Workplace">
            {humanize(job.workplace_type)}
          </Descriptions.Item>
          <Descriptions.Item label="Experience">
            {job.experience_level || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Salary">{formatSalary(job)}</Descriptions.Item>
        </Descriptions>
        <Divider titlePlacement="start">Description</Divider>
        <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
        {job.requirements && (
          <>
            <Divider titlePlacement="start">Requirements</Divider>
            <p className="whitespace-pre-wrap text-gray-700">
              {job.requirements}
            </p>
          </>
        )}
        {job.responsibilities && (
          <>
            <Divider titlePlacement="start">Responsibilities</Divider>
            <p className="whitespace-pre-wrap text-gray-700">
              {job.responsibilities}
            </p>
          </>
        )}
        {job.benefits && (
          <>
            <Divider titlePlacement="start">Benefits</Divider>
            <p className="whitespace-pre-wrap text-gray-700">{job.benefits}</p>
          </>
        )}
      </Card>

      <Card
        title="Candidates"
        extra={
          <Space wrap>
            <Select<CandidateFilter>
              value={filter}
              onChange={setFilter}
              options={filterOptions}
              className="min-w-44"
            />
            <Button
              icon={<ReloadOutlined />}
              loading={isReranking}
              disabled={candidates.length === 0}
              onClick={() => rerankCandidates()}
            >
              Re-evaluate Rankings
            </Button>
          </Space>
        }
      >
        <p className="mb-4 text-sm text-gray-500">
          Use the filter to review every workflow state. Rejected applications are
          retained unless you explicitly delete them.
        </p>
        <Table<CandidateRow>
          columns={candidateColumns}
          dataSource={visibleCandidates}
          loading={isLoadingApplications || isFetchingApplications}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: isApplicationsError
              ? "Failed to load candidates. Please try again."
              : filter === "rejected"
                ? "No rejected applications"
                : "No candidates in this view",
          }}
        />
      </Card>

      <Modal
        title={resumeTarget ? `${resumeTarget.name} — Resume` : "Candidate Resume"}
        open={resumeTarget != null}
        onCancel={() => setResumeTarget(null)}
        footer={<Button onClick={() => setResumeTarget(null)}>Close</Button>}
        width={760}
        centered
      >
        {resumeTarget && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 pt-3">
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Email">{resumeTarget.email}</Descriptions.Item>
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
                <div key={`${experience.company}-${experience.title}-${index}`}>
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
                    <p className="mb-3 mt-1 whitespace-pre-wrap text-gray-700">
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
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 font-semibold text-green-700">Strengths</p>
                    {(resumeTarget.ranking_strengths ?? []).map((strength) => (
                      <p className="mb-1 text-sm text-gray-700" key={strength}>
                        • {strength}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 font-semibold text-orange-700">Gaps</p>
                    {(resumeTarget.ranking_gaps ?? []).map((gap) => (
                      <p className="mb-1 text-sm text-gray-700" key={gap}>
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
    </div>
  );
}
