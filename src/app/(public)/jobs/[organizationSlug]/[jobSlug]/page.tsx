"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
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
import LandingHeader from "../../../components/LandingHeader";

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
  return trimmed ? trimmed : null;
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

export default function PublicJobDetailPage() {
  const params = useParams<{ organizationSlug: string; jobSlug: string }>();
  const organizationSlug = params.organizationSlug;
  const jobSlug = params.jobSlug;
  const applySectionRef = useRef<HTMLDivElement>(null);
  const [applicationForm] = Form.useForm<ApplicationFormValues>();
  const [resumeFile, setResumeFile] = useState<RcFile | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["public-job", organizationSlug, jobSlug],
    queryFn: () => getPublicJob(organizationSlug, jobSlug),
  });

  const { mutate: parseResume, isPending: isParsingResume } = useMutation({
    mutationFn: () => {
      if (!resumeFile) throw new Error("Choose a resume first");
      return parsePublicJobResume(organizationSlug, jobSlug, resumeFile);
    },
    onSuccess: (data) => {
      setResumeText(data.resume_text);
      setParsedResume(data.parsed_resume);
      const current = applicationForm.getFieldsValue();
      applicationForm.setFieldsValue({
        candidate_name: data.parsed_resume.full_name || current.candidate_name,
        candidate_email: data.parsed_resume.email || current.candidate_email,
        candidate_phone: data.parsed_resume.phone || current.candidate_phone,
        candidate_location:
          data.parsed_resume.location || current.candidate_location,
        linkedin_url:
          data.parsed_resume.linkedin_url || current.linkedin_url,
        portfolio_url:
          data.parsed_resume.portfolio_url || current.portfolio_url,
        summary: data.parsed_resume.summary || current.summary,
      });
      message.success("Resume parsed and application fields updated");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Resume could not be parsed."));
    },
  });

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
    onError: (error) => {
      message.error(getErrorMessage(error, "Application could not be submitted."));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offWhiteColor">
        <LandingHeader />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
        </main>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-offWhiteColor">
        <LandingHeader />
        <Result
          status="404"
          title="Position not found"
          subTitle="This job may have closed, moved, or no longer be available."
          extra={
            <Link href="/jobs">
              <Button type="primary" className="!bg-primaryColor">Browse open jobs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhiteColor">
      <LandingHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs" className="mb-6 inline-flex items-center gap-2 !text-primaryColor">
          <ArrowLeftOutlined /> Back to open jobs
        </Link>

        <Card className="overflow-hidden border-grayLightColor/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Tag color="blue">{humanize(job.employment_type)}</Tag>
                <Tag color="purple">{humanize(job.workplace_type)}</Tag>
                {job.department && <Tag>{job.department}</Tag>}
              </div>
              <h1 className="text-3xl font-bold text-blackColor sm:text-4xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-grayColor">
                <span className="flex items-center gap-2"><BankOutlined /> {job.organization.name}</span>
                <span className="flex items-center gap-2"><EnvironmentOutlined /> {job.location || "Location flexible"}</span>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              className="!bg-primaryColor"
              onClick={() => applySectionRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Apply for this job
            </Button>
          </div>

          <Descriptions
            bordered
            className="mt-8"
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
          >
            <Descriptions.Item label="Experience">{job.experience_level || "Not specified"}</Descriptions.Item>
            <Descriptions.Item label="Workplace">{humanize(job.workplace_type)}</Descriptions.Item>
            <Descriptions.Item label="Salary">{formatSalary(job)}</Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="start">About the role</Divider>
          <p className="whitespace-pre-wrap leading-7 text-grayColor">{job.description}</p>

          {job.requirements && (
            <>
              <Divider titlePlacement="start">Requirements</Divider>
              <p className="whitespace-pre-wrap leading-7 text-grayColor">{job.requirements}</p>
            </>
          )}
          {job.responsibilities && (
            <>
              <Divider titlePlacement="start">Responsibilities</Divider>
              <p className="whitespace-pre-wrap leading-7 text-grayColor">{job.responsibilities}</p>
            </>
          )}
          {job.benefits && (
            <>
              <Divider titlePlacement="start">Benefits</Divider>
              <p className="whitespace-pre-wrap leading-7 text-grayColor">{job.benefits}</p>
            </>
          )}
        </Card>

        <div ref={applySectionRef} className="scroll-mt-20 pt-8">
          <Card
            title={
              <div>
                <p className="text-xl font-bold text-blackColor">Apply for {job.title}</p>
                <p className="mt-1 text-sm font-normal text-grayColor">
                  No HRX account is required. Your application goes directly to {job.organization.name}.
                </p>
              </div>
            }
          >
            {submitted ? (
              <Result
                status="success"
                icon={<CheckCircleOutlined className="!text-green-600" />}
                title="Application submitted"
                subTitle={`${job.organization.name} has received your application for ${job.title}.`}
                extra={
                  <Space wrap>
                    <Button onClick={() => setSubmitted(false)}>Submit another application</Button>
                    <Link href="/jobs"><Button type="primary" className="!bg-primaryColor">Browse more jobs</Button></Link>
                  </Space>
                }
              />
            ) : (
              <Form<ApplicationFormValues>
                form={applicationForm}
                layout="vertical"
                requiredMark={false}
                onFinish={(values) => submitApplication(values)}
              >
                <Alert
                  type="info"
                  showIcon
                  className="mb-6"
                  message="Resume upload is optional"
                  description="Upload a PDF or DOCX and let AI prefill the form, or complete the fields manually."
                />

                <Form.Item label={<span className="font-medium">Resume</span>}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Upload
                      accept=".pdf,.docx"
                      maxCount={1}
                      fileList={resumeFile ? [resumeFile] : []}
                      beforeUpload={(file) => {
                        const extension = file.name.split(".").pop()?.toLowerCase();
                        if (!extension || !["pdf", "docx"].includes(extension)) {
                          message.error("Please choose a PDF or DOCX resume.");
                          return Upload.LIST_IGNORE;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          message.error("Resume must be 5 MB or smaller.");
                          return Upload.LIST_IGNORE;
                        }
                        setResumeFile(file);
                        setResumeText(null);
                        setParsedResume(null);
                        return false;
                      }}
                      onRemove={() => {
                        setResumeFile(null);
                        setResumeText(null);
                        setParsedResume(null);
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Choose resume</Button>
                    </Upload>
                    <Button
                      icon={<FilePdfOutlined />}
                      disabled={!resumeFile}
                      loading={isParsingResume}
                      onClick={() => parseResume()}
                    >
                      Parse and prefill
                    </Button>
                    {parsedResume && <Tag color="green" icon={<CheckCircleOutlined />}>Resume parsed</Tag>}
                  </div>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="candidate_name"
                      label={<span className="font-medium">Full Name</span>}
                      rules={[{ required: true, whitespace: true, message: "Please enter your full name" }]}
                    >
                      <Input size="large" placeholder="Your full name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="candidate_email"
                      label={<span className="font-medium">Email</span>}
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input size="large" type="email" placeholder="you@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="candidate_phone" label={<span className="font-medium">Phone</span>}>
                      <Input size="large" placeholder="Your phone number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="candidate_location" label={<span className="font-medium">Location</span>}>
                      <Input size="large" placeholder="City, country" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="linkedin_url"
                      label={<span className="font-medium">LinkedIn URL</span>}
                      rules={[{ type: "url", message: "Please enter a valid URL" }]}
                    >
                      <Input size="large" placeholder="https://linkedin.com/in/your-profile" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="portfolio_url"
                      label={<span className="font-medium">Portfolio URL</span>}
                      rules={[{ type: "url", message: "Please enter a valid URL" }]}
                    >
                      <Input size="large" placeholder="https://your-portfolio.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="summary" label={<span className="font-medium">Professional Summary</span>}>
                  <Input.TextArea rows={4} placeholder="Briefly introduce your experience and strengths" />
                </Form.Item>
                <Form.Item name="cover_letter" label={<span className="font-medium">Cover Letter</span>}>
                  <Input.TextArea rows={6} placeholder="Why are you interested in this role?" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting}
                  disabled={isParsingResume}
                  className="!bg-primaryColor"
                >
                  Submit application
                </Button>
              </Form>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
