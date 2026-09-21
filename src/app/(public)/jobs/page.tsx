"use client";

import { useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Empty, Input, Select, Skeleton } from "antd";
import { getPublicJobs } from "@/api/collection/publicJobs";
import type { JobWorkplaceType } from "@/types/job";
import JobsShell from "./components/JobsShell";
import PublicJobCard from "./components/PublicJobCard";

const WORKPLACE_OPTIONS: { label: string; value: JobWorkplaceType | "all" }[] = [
  { label: "All workplaces", value: "all" },
  { label: "On-site", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

export default function PublicJobsPage() {
  const [search, setSearch] = useState("");
  const [workplace, setWorkplace] = useState<JobWorkplaceType | "all">("all");

  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: getPublicJobs,
  });

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesWorkplace = workplace === "all" || job.workplace_type === workplace;
      const matchesSearch =
        !query ||
        [
          job.title,
          job.organization.name,
          job.department,
          job.location,
          job.description,
        ].some((value) => value?.toLowerCase().includes(query));
      return matchesWorkplace && matchesSearch;
    });
  }, [jobs, search, workplace]);

  return (
    <JobsShell>
      <section className="hrx-grid relative overflow-hidden border-b border-lineColor">
        <div className="pointer-events-none absolute -top-52 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accentColor/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 top-16 h-72 w-72 rounded-full bg-glowColor/10 blur-[110px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20">
          <div className="hrx-rise mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-lineColor bg-panelColor/70 px-3 py-1.5 text-xs font-medium tracking-wide text-mutedColor backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-glowColor" />
              Careers across HRX organizations
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Find work worth doing.
              <span className="hrx-gradient-text block">Meet your next team.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mutedColor sm:text-lg">
              Explore open roles from growing organizations and apply directly—no HRX account required.
            </p>
          </div>

          <div className="hrx-rise mx-auto mt-9 grid max-w-3xl gap-3 rounded-2xl border border-lineColor bg-panelColor/80 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:grid-cols-[1fr_190px] [animation-delay:120ms]">
            <Input
              className="w-full"
              size="large"
              allowClear
              prefix={<SearchOutlined className="text-mutedColor" />}
              placeholder="Search role, company, or location"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search jobs"
            />
            <Select
              className="w-full"
              size="large"
              value={workplace}
              options={WORKPLACE_OPTIONS}
              onChange={setWorkplace}
              aria-label="Filter by workplace type"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">
              Opportunities
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-lightColor sm:text-3xl">
              Open positions
            </h2>
          </div>
          <p className="text-sm text-mutedColor" aria-live="polite">
            {isLoading
              ? "Loading roles…"
              : `${visibleJobs.length} role${visibleJobs.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-lineColor bg-panelColor p-6">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-lineColor bg-panelColor px-6 py-14">
            <Empty description="Jobs could not be loaded. Please try again shortly." />
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-lineColor bg-panelColor px-6 py-14">
            <Empty description="No open positions match your search." />
          </div>
        ) : (
          <div className="space-y-4">
            {visibleJobs.map((job) => (
              <PublicJobCard
                key={`${job.organization.slug}/${job.slug}`}
                job={job}
              />
            ))}
          </div>
        )}
      </main>
    </JobsShell>
  );
}
