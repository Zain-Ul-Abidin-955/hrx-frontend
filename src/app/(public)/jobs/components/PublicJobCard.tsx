import Link from "next/link";
import { BankOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Tag } from "antd";
import type { PublicJob } from "@/types/job";

function humanize(value?: string | null) {
  if (!value) return "Not specified";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSalary(job: PublicJob) {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency || "USD";
  const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const min = job.salary_min == null ? null : number.format(job.salary_min);
  const max = job.salary_max == null ? null : number.format(job.salary_max);
  const range =
    min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
  return `${currency} ${range}${job.salary_period ? ` / ${job.salary_period}` : ""}`;
}

export default function PublicJobCard({ job }: { job: PublicJob }) {
  const salary = formatSalary(job);

  return (
    <Card className="border-grayLightColor/50 transition-all hover:-translate-y-0.5 hover:border-primaryColor/30 hover:shadow-lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag color="blue">{humanize(job.employment_type)}</Tag>
            <Tag color="purple">{humanize(job.workplace_type)}</Tag>
            {job.department && <Tag>{job.department}</Tag>}
          </div>
          <h3 className="text-xl font-bold text-blackColor">{job.title}</h3>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-grayColor">
            <Link
              href={`/jobs/${job.organization.slug}`}
              className="flex items-center gap-2 !text-grayColor hover:!text-primaryColor"
            >
              <BankOutlined /> {job.organization.name}
            </Link>
            <span className="flex items-center gap-2">
              <EnvironmentOutlined /> {job.location || "Location flexible"}
            </span>
            {salary && <span>{salary}</span>}
          </div>
          <p className="mt-3 line-clamp-2 max-w-3xl text-grayColor">
            {job.description}
          </p>
        </div>
        <Button
          href={`/jobs/${job.organization.slug}/${job.slug}`}
          type="primary"
          size="large"
          className="!bg-primaryColor"
        >
          View and apply
        </Button>
      </div>
    </Card>
  );
}
