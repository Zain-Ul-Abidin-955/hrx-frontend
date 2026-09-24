"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  Popconfirm,
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
  FileTextOutlined,
  InboxOutlined,
  ReloadOutlined,
  RobotOutlined,
  TeamOutlined,
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
import Panel from "@/components/dashboard/Panel";
import StatTile from "@/components/dashboard/StatTile";
import {
  DefinitionGrid,
  ProseSection,
} from "@/components/dashboard/DefinitionGrid";
import useUserStore from "@/store/userStore";
import type { Job, JobApplication, JobApplicationStatus } from "@/types/job";

type CandidateFilter = "active" | JobApplicationStatus;

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
  reviewing: "processing",
  shortlisted: "geekblue",
  rejected: "error",
  hired: "success",
};

/** Score bands for the AI match ring — good / fair / weak, not a series. */
function scoreTone(score: number) {
  if (score >= 80)
    return { ring: "#059669", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 60)
    return { ring: "#D97706", text: "text-amber-700", bg: "bg-amber-50" };
  return { ring: "#DC2626", text: "text-rose-700", bg: "bg-rose-50" };
}

/** Two-letter monogram for a candidate with no avatar. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
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

export default function JobCandidatesPage() {
  const params = useParams<{ jobSlug: string }>();
  const jobSlug = params.jobSlug;
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const profileLoading = useUserStore((state) => state.loading);
  const organizationId = user?.organization_id ?? user?.organization?.id;
  const canManageRecruitment =
    user?.role === "hr_manager" || user?.role === "org_admin";
  const [filter, setFilter] = useState<CandidateFilter>("active");
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
  const job = Array.isArray(jobs)
    ? jobs.find((candidateJob) => candidateJob.slug === jobSlug)
    : undefined;
  const jobId = job?.id;

  const {
    data: applicationsData,
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
  const applications = Array.isArray(applicationsData) ? applicationsData : [];

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
          application.candidate_email ||
          application.parsed_resume?.email ||
          "—",
      })),
    [applications],
  );

  const visibleCandidates = useMemo(() => {
    if (filter === "rejected") {
      return candidates.filter((candidate) => candidate.status === "rejected");
    }

    const withoutRejected = candidates.filter(
      (candidate) => candidate.status !== "rejected",
    );

    if (filter === "active") return withoutRejected;
    return withoutRejected.filter((candidate) => candidate.status === filter);
  }, [candidates, filter]);

  const counts = useMemo(
    () => ({
      active: candidates.filter((candidate) => candidate.status !== "rejected")
        .length,
      shortlisted: candidates.filter(
        (candidate) => candidate.status === "shortlisted",
      ).length,
      rejected: candidates.filter(
        (candidate) => candidate.status === "rejected",
      ).length,
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
        (current) => {
          const list = Array.isArray(current) ? current : [];
          return list.map((application) =>
            application.id === updatedApplication.id
              ? updatedApplication
              : application,
          );
        },
      );
      message.success(
        variables.status === "shortlisted"
          ? "Candidate shortlisted successfully"
          : "Candidate rejected and moved to the Rejected view",
      );
      queryClient.invalidateQueries({
        queryKey: ["job-applications", jobId],
      });
      queryClient.invalidateQueries({ queryKey: ["job-applications-map"] });
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
        Array.isArray(rankedApplications) ? rankedApplications : [],
      );
      message.success(`Rankings updated for ${job?.title ?? "this job"}`);
      queryClient.invalidateQueries({ queryKey: ["job-applications-map"] });
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
    mutationFn: (applicationId: string) => deleteJobApplication(applicationId),
    onSuccess: (_result, applicationId) => {
      queryClient.setQueryData<JobApplication[]>(
        ["job-applications", jobId],
        (current) => {
          const list = Array.isArray(current) ? current : [];
          return list.filter((application) => application.id !== applicationId);
        },
      );
      if (resumeTarget?.id === applicationId) setResumeTarget(null);
      message.success("Candidate application permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications-map"] });
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
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-blackColor">
              {name}
            </p>
            <p className="truncate text-xs text-darkGrayColor">
              {record.email}
            </p>
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
            <Tag
              variant="filled"
              className="!rounded-md !px-2 !py-0.5 !text-xs !font-medium"
              color={record.ranking_status === "failed" ? "error" : "default"}
            >
              {record.ranking_status === "failed" ? "Unavailable" : "Pending"}
            </Tag>
          );
        }
        const tone = scoreTone(score);
        return (
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${tone.ring} ${score * 3.6}deg, #ECEEF3 0deg)`,
              }}
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-whiteColor" />
            </span>
            <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>
              {score}%
            </span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: JobApplicationStatus) => (
        <Tag
          variant="filled"
          className="!rounded-md !px-2 !py-0.5 !text-xs !font-medium"
          color={STATUS_COLORS[status]}
        >
          {STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: "Applied",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: string) => (
        <span className="text-sm text-secondaryTextColor">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_value, record) => {
        const cannotShortlist = ["shortlisted", "hired"].includes(
          record.status,
        );
        const cannotReject = ["rejected", "hired"].includes(record.status);
        return (
          <Space wrap size={8} className="justify-end">
            <Button
              size="small"
              onClick={() => setResumeTarget(record)}
              icon={<FileTextOutlined />}
            >
              Resume
            </Button>
            <Button
              type="primary"
              size="small"
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
                aria-label="Delete application"
              />
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
      <div className="hrx-card flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
          <InboxOutlined />
        </span>
        <p className="mt-1 text-sm font-medium text-blackColor">
          You do not have access to recruitment
        </p>
        <p className="max-w-sm text-sm text-grayColor">
          Ask an organization admin to grant you recruitment permissions.
        </p>
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="space-y-5">
        <Link
          href="/orgnization/recruitment"
          className="inline-flex items-center gap-1.5 text-xs font-medium !text-grayColor hover:!text-accentDeepColor"
        >
          <ArrowLeftOutlined style={{ fontSize: 11 }} /> Back to recruitment
        </Link>
        <div className="hrx-card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
            <InboxOutlined />
          </span>
          <p className="mt-1 text-sm font-medium text-blackColor">
            This job could not be loaded
          </p>
          <p className="max-w-sm text-sm text-grayColor">
            It may have been removed, or the link may be out of date.
          </p>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { label: `Active (${counts.active})`, value: "active" },
    {
      label: `Submitted (${candidates.filter((item) => item.status === "submitted").length})`,
      value: "submitted",
    },
    {
      label: `Screening (${candidates.filter((item) => item.status === "reviewing").length})`,
      value: "reviewing",
    },
    { label: `Shortlisted (${counts.shortlisted})`, value: "shortlisted" },
    { label: `Rejected (${counts.rejected})`, value: "rejected" },
    {
      label: `Hired (${candidates.filter((item) => item.status === "hired").length})`,
      value: "hired",
    },
  ];

  const screenPercent = candidates.length
    ? Math.round((counts.screened / candidates.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* ---------- Page header ---------- */}
      <header>
        <Link
          href="/orgnization/recruitment"
          className="inline-flex items-center gap-1.5 text-xs font-medium !text-grayColor transition-colors hover:!text-accentDeepColor"
        >
          <ArrowLeftOutlined style={{ fontSize: 11 }} /> Back to recruitment
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
                {job.title}
              </h1>
              <Tag
                variant="filled"
                className="!m-0 !rounded-md !px-2 !py-0.5 !text-xs !font-medium"
                color={job.is_active ? "success" : "default"}
              >
                {job.is_active ? "Live" : "Inactive"}
              </Tag>
            </div>
            <p className="mt-1 text-sm text-grayColor">
              {[
                job.department,
                humanize(job.employment_type),
                humanize(job.workplace_type),
                job.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <Button
            icon={<ExportOutlined />}
            className="shrink-0"
            href={`/jobs/${user.organization?.slug}/${job.slug}`}
            target="_blank"
            disabled={!user.organization?.slug || !job.is_active}
          >
            View public page
          </Button>
        </div>
      </header>

      {/* ---------- Stat tiles ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Active candidates"
          value={counts.active}
          icon={<TeamOutlined />}
          caption={`${candidates.length} total applications`}
        />
        <StatTile
          label="AI screened"
          value={counts.screened}
          icon={<RobotOutlined />}
          meter={screenPercent}
          caption={`${screenPercent}% of applications`}
        />
        <StatTile
          label="Shortlisted"
          value={counts.shortlisted}
          icon={<CheckCircleOutlined />}
          caption="moved forward"
        />
        <StatTile
          label="Rejected"
          value={counts.rejected}
          icon={<CloseCircleOutlined />}
          caption="kept on file"
        />
      </div>

      {/* ---------- Candidates ---------- */}
      <Panel
        flush
        title="Candidates"
        icon={<TeamOutlined />}
        action={
          <Space wrap size={8}>
            <Select<CandidateFilter>
              value={filter}
              onChange={setFilter}
              options={filterOptions}
              size="small"
              className="min-w-44"
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={isReranking}
              disabled={candidates.length === 0}
              onClick={() => rerankCandidates()}
            >
              Re-evaluate
            </Button>
          </Space>
        }
      >
        <Table<CandidateRow>
          columns={candidateColumns}
          dataSource={visibleCandidates}
          loading={isLoadingApplications || isFetchingApplications}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
                  <InboxOutlined />
                </span>
                <p className="mt-1 text-sm font-medium text-blackColor">
                  {isApplicationsError
                    ? "Could not load candidates"
                    : filter === "rejected"
                      ? "No rejected applications"
                      : "No candidates in this view"}
                </p>
                <p className="max-w-sm text-sm text-grayColor">
                  {isApplicationsError
                    ? "Something went wrong fetching applications. Try again in a moment."
                    : filter === "rejected"
                      ? "Rejected applications stay here until you delete them."
                      : "Rejected candidates are hidden here — open the Rejected filter to review them."}
                </p>
              </div>
            ),
          }}
        />
      </Panel>

      {/* ---------- The role itself ---------- */}
      <Panel title="Job description" icon={<FileTextOutlined />}>
        <DefinitionGrid
          items={[
            ["Department", job.department || "—"],
            ["Location", job.location || "—"],
            ["Employment", humanize(job.employment_type)],
            ["Workplace", humanize(job.workplace_type)],
            ["Experience", job.experience_level || "—"],
            ["Salary", formatSalary(job)],
          ]}
        />
        {(
          [
            ["Description", job.description],
            ["Requirements", job.requirements],
            ["Responsibilities", job.responsibilities],
            ["Benefits", job.benefits],
          ] as const
        ).map(([heading, body]) =>
          body ? (
            <ProseSection key={heading} heading={heading}>
              {body}
            </ProseSection>
          ) : null,
        )}
      </Panel>

      <Modal
        title={
          resumeTarget ? (
            <div className="flex min-w-0 items-center gap-3 pr-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
                {initials(resumeTarget.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-blackColor">
                  {resumeTarget.name}
                </p>
                <p className="truncate text-xs font-normal text-grayColor">
                  {resumeTarget.email}
                </p>
              </div>
            </div>
          ) : (
            "Candidate resume"
          )
        }
        open={resumeTarget != null}
        onCancel={() => setResumeTarget(null)}
        footer={<Button onClick={() => setResumeTarget(null)}>Close</Button>}
        width={760}
        centered
      >
        {resumeTarget && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 pt-2">
            {/* Score first — it is why this dialog gets opened. */}
            {resumeTarget.ranking_score != null && (
              <div
                className={`mb-4 flex items-center gap-3 rounded-xl px-4 py-3 ${scoreTone(resumeTarget.ranking_score).bg}`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${scoreTone(resumeTarget.ranking_score).ring} ${resumeTarget.ranking_score * 3.6}deg, #ffffff 0deg)`,
                  }}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-whiteColor text-[11px] font-semibold tabular-nums ${scoreTone(resumeTarget.ranking_score).text}`}
                  >
                    {resumeTarget.ranking_score}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-darkGrayColor">
                    AI match
                  </p>
                  <p
                    className={`text-sm font-medium ${scoreTone(resumeTarget.ranking_score).text}`}
                  >
                    {humanize(resumeTarget.ranking_recommendation)}
                  </p>
                </div>
              </div>
            )}

            <DefinitionGrid
              items={[
                [
                  "Phone",
                  resumeTarget.candidate_phone ||
                    resumeTarget.parsed_resume?.phone ||
                    "—",
                ],
                [
                  "Location",
                  resumeTarget.candidate_location ||
                    resumeTarget.parsed_resume?.location ||
                    "—",
                ],
                [
                  "Experience",
                  resumeTarget.parsed_resume?.total_experience_years != null
                    ? `${resumeTarget.parsed_resume.total_experience_years} years`
                    : "—",
                ],
                ["Status", STATUS_LABELS[resumeTarget.status]],
                [
                  "Applied",
                  new Date(resumeTarget.created_at).toLocaleDateString(),
                ],
                [
                  "AI score",
                  resumeTarget.ranking_score == null
                    ? "Pending"
                    : `${resumeTarget.ranking_score}%`,
                ],
              ]}
            />

            {(resumeTarget.summary || resumeTarget.parsed_resume?.summary) && (
              <ProseSection heading="Summary">
                {resumeTarget.summary || resumeTarget.parsed_resume?.summary}
              </ProseSection>
            )}

            <ProseSection heading="Skills">
              {resumeTarget.parsed_resume?.skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {resumeTarget.parsed_resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-accentColor/10 px-2 py-0.5 text-xs font-medium text-accentDeepColor"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-darkGrayColor">
                  No skills extracted
                </span>
              )}
            </ProseSection>

            {!!resumeTarget.parsed_resume?.work_experience.length && (
              <ProseSection heading="Work experience">
                <ol className="relative space-y-4 border-l border-[#ECEEF3] pl-4">
                  {resumeTarget.parsed_resume.work_experience.map(
                    (experience, index) => (
                      <li
                        key={`${experience.company}-${experience.title}-${index}`}
                        className="relative"
                      >
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-accentDeepColor" />
                        <p className="text-sm font-medium text-blackColor">
                          {[experience.title, experience.company]
                            .filter(Boolean)
                            .join(" at ") || "Experience"}
                        </p>
                        <p className="mt-0.5 text-xs text-darkGrayColor">
                          {[experience.start_date, experience.end_date]
                            .filter(Boolean)
                            .join(" – ") || "Dates not listed"}
                        </p>
                        {experience.description && (
                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-secondaryTextColor">
                            {experience.description}
                          </p>
                        )}
                      </li>
                    ),
                  )}
                </ol>
              </ProseSection>
            )}

            {resumeTarget.ranking_rationale && (
              <ProseSection heading="AI assessment">
                {resumeTarget.ranking_rationale}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#ECEEF3] p-3.5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Strengths
                    </p>
                    {(resumeTarget.ranking_strengths ?? []).length ? (
                      <ul className="space-y-1.5">
                        {(resumeTarget.ranking_strengths ?? []).map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm text-secondaryTextColor"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-darkGrayColor">
                        None listed
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl border border-[#ECEEF3] p-3.5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Gaps
                    </p>
                    {(resumeTarget.ranking_gaps ?? []).length ? (
                      <ul className="space-y-1.5">
                        {(resumeTarget.ranking_gaps ?? []).map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm text-secondaryTextColor"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-darkGrayColor">
                        None listed
                      </span>
                    )}
                  </div>
                </div>
              </ProseSection>
            )}

            {resumeTarget.cover_letter && (
              <ProseSection heading="Cover letter">
                {resumeTarget.cover_letter}
              </ProseSection>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
