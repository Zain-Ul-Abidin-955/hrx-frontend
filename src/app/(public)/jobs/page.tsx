"use client";

import { useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Empty, Input, Select, Skeleton, Tag } from "antd";
import { getPublicJobs } from "@/api/collection/publicJobs";
import type { JobWorkplaceType } from "@/types/job";
import LandingHeader from "../components/LandingHeader";
import PublicJobCard from "./components/PublicJobCard";

const WORKPLACE_OPTIONS: { label: string; value: JobWorkplaceType | "all" }[] = [
  { label: "All workplace types", value: "all" },
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
    <div className="min-h-screen bg-offWhiteColor">
      <LandingHeader />
      <section className="bg-primaryColor px-4 py-16 text-whiteColor sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            Careers across HRX organizations
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Find your next opportunity</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-whiteColor/75">
            Explore open roles and apply directly without account registration.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl bg-whiteColor p-3 shadow-xl sm:grid-cols-[1fr_220px]">
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search role, company, department, or location"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              size="large"
              value={workplace}
              options={WORKPLACE_OPTIONS}
              onChange={setWorkplace}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blackColor">Open positions</h2>
            <p className="mt-1 text-grayColor">
              {isLoading ? "Loading opportunities…" : `${visibleJobs.length} role${visibleJobs.length === 1 ? "" : "s"} available`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Card key={item}><Skeleton active paragraph={{ rows: 2 }} /></Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <Empty description="Jobs could not be loaded. Please try again shortly." />
          </Card>
        ) : visibleJobs.length === 0 ? (
          <Card>
            <Empty description="No open positions match your search." />
          </Card>
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
    </div>
  );
}
