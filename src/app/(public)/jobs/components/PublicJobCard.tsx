import Link from "next/link";
import {
  ArrowRightOutlined,
  BankOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
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
  const jobHref = `/jobs/${job.organization.slug}/${job.slug}`;

  return (
    <article className="hrx-ring group relative overflow-hidden rounded-2xl border border-lineColor bg-panelColor p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accentColor/40 hover:bg-panelHighColor/80 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-accentColor/25 bg-accentColor/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-indigo-300">
              {humanize(job.employment_type)}
            </span>
            <span className="rounded-full border border-glowColor/20 bg-glowColor/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-cyan-300">
              {humanize(job.workplace_type)}
            </span>
            {job.department && (
              <span className="rounded-full border border-lineColor bg-nightSoftColor px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-mutedColor">
                {job.department}
              </span>
            )}
          </div>

          <Link href={jobHref} className="inline-block">
            <h3 className="text-xl font-semibold tracking-tight text-lightColor transition-colors group-hover:text-white sm:text-[22px]">
              {job.title}
            </h3>
          </Link>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mutedColor">
            <Link
              href={`/jobs/${job.organization.slug}`}
              className="flex items-center gap-2 transition-colors hover:text-lightColor"
            >
              <BankOutlined className="text-xs text-indigo-300" />
              {job.organization.name}
            </Link>
            <span className="flex items-center gap-2">
              <EnvironmentOutlined className="text-xs text-cyan-300" />
              {job.location || "Location flexible"}
            </span>
            {salary && <span>{salary}</span>}
          </div>

          <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-mutedColor">
            {job.description}
          </p>
        </div>

        <Link
          href={jobHref}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-lineColor bg-nightSoftColor px-4 py-2.5 text-sm font-medium text-lightColor transition-colors hover:border-accentColor/50 hover:bg-accentColor hover:text-white sm:self-center"
        >
          View role
          <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
