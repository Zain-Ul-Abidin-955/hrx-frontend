"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Empty, Skeleton } from "antd";
import { getPublicOrganizationJobs } from "@/api/collection/publicJobs";
import LandingHeader from "../../components/LandingHeader";
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
    <div className="min-h-screen bg-offWhiteColor">
      <LandingHeader />
      <section className="bg-primaryColor px-4 py-14 text-whiteColor sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/jobs" className="mb-6 inline-flex items-center gap-2 !text-whiteColor/75 hover:!text-whiteColor">
            <ArrowLeftOutlined /> All organizations
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-whiteColor/10">
              <BankOutlined className="text-2xl" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-blue-200">Careers at</p>
              <h1 className="mt-1 text-4xl font-bold">{organizationName}</h1>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-blackColor">Open positions</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <Card key={item}><Skeleton active paragraph={{ rows: 2 }} /></Card>
            ))}
          </div>
        ) : isError ? (
          <Card><Empty description="This organization’s jobs could not be loaded." /></Card>
        ) : jobs.length === 0 ? (
          <Card><Empty description="This organization has no open positions." /></Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <PublicJobCard key={job.slug} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
