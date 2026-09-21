"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Result,
  Row,
  Skeleton,
  Space,
  Tag,
  Upload,
  message,
} from "antd";
import type { RcFile } from "antd/es/upload/interface";
import {
  getPublicJob,
  parsePublicJobResume,
  submitPublicJobApplication,
} from "@/api/collection/publicJobs";
import type {
  JobApplicationCreatePayload,
  ParsedResume,
  PublicJob,
} from "@/types/job";
import JobsShell from "../../components/JobsShell";

const RESUME_PROGRESS_MESSAGES = [
  "Uploading your resume…",
  "Reading your experience…",
  "Extracting skills and contact details…",
  "Prefilling your application…",
];

interface ApplicationFormValues {
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  summary?: string;
  cover_letter?: string;
}

function humanize(value?: string | null) {
  if (!value) return "Not specified";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function optionalValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}

function formatSalary(job: PublicJob) {
  if (job.salary_min == null && job.salary_max == null) return "Not disclosed";
  const currency = job.salary_currency || "USD";
  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const min = job.salary_min == null ? null : formatter.format(job.salary_min);
  const max = job.salary_max == null ? null : formatter.format(job.salary_max);
  const range = min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
  return `${currency} ${range}${job.salary_period ? ` / ${job.salary_period}` : ""}`;
}

function DetailSection({ title, content }: { title: string; content?: string | null }) {
  if (!content) return null;
  return (
    <section className="border-t border-lineColor pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight text-lightColor">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-mutedColor sm:text-base">{content}</p>
    </section>
  );
}

export default function PublicJobDetailPage() {
  const params = useParams<{ organizationSlug: string; jobSlug: string }>();
  const { organizationSlug, jobSlug } = params;
  const applySectionRef = useRef<HTMLDivElement>(null);
  const [applicationForm] = Form.useForm<ApplicationFormValues>();
  const [resumeFile, setResumeFile] = useState<RcFile | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeProgressIndex, setResumeProgressIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["public-job", organizationSlug, jobSlug],
    queryFn: () => getPublicJob(organizationSlug, jobSlug),
  });

  const { mutate: parseResume, isPending: isParsingResume } = useMutation({
    mutationFn: (file: RcFile) =>
      parsePublicJobResume(organizationSlug, jobSlug, file),
    onSuccess: (data) => {
      setResumeText(data.resume_text);
      setParsedResume(data.parsed_resume);
      const current = applicationForm.getFieldsValue();
      applicationForm.setFieldsValue({
        candidate_name: data.parsed_resume.full_name || current.candidate_name,
        candidate_email: data.parsed_resume.email || current.candidate_email,
        candidate_phone: data.parsed_resume.phone || current.candidate_phone,
        candidate_location: data.parsed_resume.location || current.candidate_location,
        linkedin_url: data.parsed_resume.linkedin_url || current.linkedin_url,
        portfolio_url: data.parsed_resume.portfolio_url || current.portfolio_url,
        summary: data.parsed_resume.summary || current.summary,
      });
      message.success("Resume parsed and application fields updated");
    },
    onError: (error) => {
      setResumeFile(null);
      setResumeText(null);
      setParsedResume(null);
      message.error(getErrorMessage(error, "Resume could not be parsed. Please try again."));
    },
  });

  useEffect(() => {
    if (!isParsingResume) return;
    const timer = window.setInterval(() => {
      setResumeProgressIndex((current) =>
        Math.min(current + 1, RESUME_PROGRESS_MESSAGES.length - 1),
      );
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isParsingResume]);

  const { mutate: submitApplication, isPending: isSubmitting } = useMutation({
    mutationFn: (values: ApplicationFormValues) => {
      const payload: JobApplicationCreatePayload = {
        candidate_name: values.candidate_name.trim(),
        candidate_email: values.candidate_email.trim(),
        candidate_phone: optionalValue(values.candidate_phone),
        candidate_location: optionalValue(values.candidate_location),
        linkedin_url: optionalValue(values.linkedin_url),
        portfolio_url: optionalValue(values.portfolio_url),
        summary: optionalValue(values.summary),
        cover_letter: optionalValue(values.cover_letter),
        resume_text: resumeText,
        parsed_resume: parsedResume,
      };
      return submitPublicJobApplication(organizationSlug, jobSlug, payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      applicationForm.resetFields();
      setResumeFile(null);
      setResumeText(null);
      setParsedResume(null);
      applySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onError: (error) => message.error(getErrorMessage(error, "Application could not be submitted.")),
  });

  if (isLoading) {
    return (
      <JobsShell>
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-lineColor bg-panelColor p-7"><Skeleton active paragraph={{ rows: 10 }} /></div>
        </main>
      </JobsShell>
    );
  }

  if (isError || !job) {
    return (
      <JobsShell>
        <Result
          status="404"
          title="Position not found"
          subTitle="This job may have closed, moved, or no longer be available."
          extra={<Link href="/jobs"><Button type="primary">Browse open jobs</Button></Link>}
        />
      </JobsShell>
    );
  }

  const scrollToApply = () => applySectionRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <JobsShell>
      <section className="hrx-grid relative overflow-hidden border-b border-lineColor">
        <div className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-accentColor/15 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-glowColor/10 blur-[110px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
          <Link href={`/jobs/${organizationSlug}`} className="inline-flex items-center gap-2 text-sm text-mutedColor transition-colors hover:text-lightColor">
            <ArrowLeftOutlined className="text-xs" /> Careers at {job.organization.name}
          </Link>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-accentColor/25 bg-accentColor/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-indigo-300">{humanize(job.employment_type)}</span>
                <span className="rounded-full border border-glowColor/20 bg-glowColor/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-cyan-300">{humanize(job.workplace_type)}</span>
                {job.department && <span className="rounded-full border border-lineColor bg-panelColor px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-mutedColor">{job.department}</span>}
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-lightColor sm:text-5xl">{job.title}</h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mutedColor">
                <Link href={`/jobs/${organizationSlug}`} className="flex items-center gap-2 transition-colors hover:text-lightColor"><BankOutlined className="text-indigo-300" /> {job.organization.name}</Link>
                <span className="flex items-center gap-2"><EnvironmentOutlined className="text-cyan-300" /> {job.location || "Location flexible"}</span>
              </div>
            </div>
            <button type="button" onClick={scrollToApply} className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-lightColor px-6 text-sm font-medium text-nightColor transition-colors hover:bg-white">
              Apply for this role
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <article className="space-y-8 rounded-2xl border border-lineColor bg-panelColor p-6 sm:p-8">
            <DetailSection title="About the role" content={job.description} />
            <DetailSection title="What you’ll do" content={job.responsibilities} />
            <DetailSection title="What we’re looking for" content={job.requirements} />
            <DetailSection title="Benefits" content={job.benefits} />
          </article>

          <aside className="rounded-2xl border border-lineColor bg-panelColor p-6 lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">Role details</p>
            <dl className="mt-5 divide-y divide-lineColor">
              {[
                ["Experience", job.experience_level || "Not specified"],
                ["Workplace", humanize(job.workplace_type)],
                ["Employment", humanize(job.employment_type)],
                ["Salary", formatSalary(job)],
              ].map(([label, value]) => (
                <div key={label} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-xs text-mutedColor">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-lightColor">{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={scrollToApply} className="mt-6 flex w-full items-center justify-center rounded-xl bg-accentColor px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accentDeepColor">Apply now</button>
          </aside>
        </div>

        <section ref={applySectionRef} className="scroll-mt-20 rounded-2xl border border-lineColor bg-panelColor p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">Application</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-lightColor">Apply for {job.title}</h2>
            <p className="mt-2 text-sm text-mutedColor">No HRX account required. Your application goes directly to {job.organization.name}.</p>
          </div>

          {submitted ? (
            <Result
              status="success"
              icon={<CheckCircleOutlined className="!text-cyan-400" />}
              title="Application submitted"
              subTitle={`${job.organization.name} has received your application for ${job.title}.`}
              extra={<Space wrap><Button onClick={() => setSubmitted(false)}>Submit another</Button><Link href="/jobs"><Button type="primary">Browse more jobs</Button></Link></Space>}
            />
          ) : (
            <Form<ApplicationFormValues> form={applicationForm} layout="vertical" requiredMark={false} onFinish={(values) => submitApplication(values)}>
              <Alert type="info" showIcon className="mb-7" message="Start with your resume" description="Upload one PDF (maximum 5 MB). We’ll read it and prefill the application automatically, or you can complete the fields manually." />

              <Form.Item label={<span className="font-medium">Resume <span className="font-normal text-mutedColor">(optional)</span></span>}>
                <div className="space-y-3">
                  <Upload
                    accept=".pdf,application/pdf"
                    disabled={isParsingResume}
                    maxCount={1}
                    fileList={resumeFile ? [resumeFile] : []}
                    beforeUpload={(file) => {
                      const extension = file.name.split(".").pop()?.toLowerCase();
                      if (extension !== "pdf") { message.error("Please choose a PDF resume."); return Upload.LIST_IGNORE; }
                      if (file.size > 5 * 1024 * 1024) { message.error("Resume must be 5 MB or smaller."); return Upload.LIST_IGNORE; }
                      setResumeFile(file);
                      setResumeText(null);
                      setParsedResume(null);
                      setResumeProgressIndex(0);
                      parseResume(file);
                      return false;
                    }}
                    onRemove={() => { setResumeFile(null); setResumeText(null); setParsedResume(null); }}
                  >
                    <Button icon={<UploadOutlined />} loading={isParsingResume}>Upload PDF resume</Button>
                  </Upload>

                  {isParsingResume && (
                    <div className="flex items-center gap-3 rounded-xl border border-accentColor/25 bg-accentColor/10 px-4 py-3" aria-live="polite">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-glowColor" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-glowColor" />
                      </span>
                      <span className="text-sm text-indigo-100">{RESUME_PROGRESS_MESSAGES[resumeProgressIndex]}</span>
                    </div>
                  )}

                  {parsedResume && !isParsingResume && (
                    <Tag color="cyan" icon={<CheckCircleOutlined />}>Resume parsed and application prefilled</Tag>
                  )}
                </div>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="candidate_name" label="Full name" rules={[{ required: true, whitespace: true, message: "Please enter your full name" }]}><Input size="large" placeholder="Your full name" /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="candidate_email" label="Email" rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}><Input size="large" type="email" placeholder="you@example.com" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="candidate_phone" label="Phone"><Input size="large" placeholder="Your phone number" /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="candidate_location" label="Location"><Input size="large" placeholder="City, country" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="linkedin_url" label="LinkedIn URL" rules={[{ type: "url", message: "Please enter a valid URL" }]}><Input size="large" placeholder="https://linkedin.com/in/your-profile" /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="portfolio_url" label="Portfolio URL" rules={[{ type: "url", message: "Please enter a valid URL" }]}><Input size="large" placeholder="https://your-portfolio.com" /></Form.Item></Col>
              </Row>
              <Form.Item name="summary" label="Professional summary"><Input.TextArea rows={4} placeholder="Briefly introduce your experience and strengths" /></Form.Item>
              <Form.Item name="cover_letter" label="Cover letter"><Input.TextArea rows={6} placeholder="Why are you interested in this role?" /></Form.Item>
              <Button type="primary" htmlType="submit" size="large" loading={isSubmitting} disabled={isParsingResume}>Submit application</Button>
            </Form>
          )}
        </section>
      </main>
    </JobsShell>
  );
}
