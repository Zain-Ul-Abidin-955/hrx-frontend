"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Empty, Skeleton } from "antd";
import { getPublicOrganizationJobs } from "@/api/collection/publicJobs";
import JobsShell from "../components/JobsShell";
import PublicJobCard from "../components/PublicJobCard";

function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PublicOrganizationJobsPage() {
  const params = useParams<{ organizationSlug: string }>();
  const organizationSlug = params.organizationSlug;
  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["public-organization-jobs", organizationSlug],
    queryFn: () => getPublicOrganizationJobs(organizationSlug),
  });
  const organizationName = jobs[0]?.organization.name || titleFromSlug(organizationSlug);

  return (
    <JobsShell>
      <section className="hrx-grid relative overflow-hidden border-b border-lineColor">
        <div className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-accentColor/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-9 sm:px-8 sm:pb-16 sm:pt-12">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-mutedColor transition-colors hover:text-lightColor"
          >
            <ArrowLeftOutlined className="text-xs" />
            All open jobs
          </Link>

          <div className="mt-9 flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accentColor/20 bg-gradient-to-br from-accentColor/20 to-glowColor/10 text-2xl text-indigo-200 shadow-lg shadow-accentColor/10 sm:h-20 sm:w-20 sm:text-3xl">
              <BankOutlined />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">Careers at</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-lightColor sm:text-5xl">
                {organizationName}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">Join the team</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-lightColor sm:text-3xl">Open positions</h2>
          </div>
          {!isLoading && !isError && (
            <p className="text-sm text-mutedColor">{jobs.length} role{jobs.length === 1 ? "" : "s"}</p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-lineColor bg-panelColor p-6">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-lineColor bg-panelColor px-6 py-14">
            <Empty description="This organization’s jobs could not be loaded." />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-lineColor bg-panelColor px-6 py-14">
            <Empty description="This organization has no open positions right now." />
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => <PublicJobCard key={job.slug} job={job} />)}
          </div>
        )}
      </main>
    </JobsShell>
  );
}
