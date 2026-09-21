"use client";

import React, { useEffect } from "react";
import { DashboardOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import { getDashboardPath } from "@/utils/authRoutes";

interface LandingHeaderProps {
  dashboardPath?: string | null;
  isSessionLoading?: boolean;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  dashboardPath,
  isSessionLoading,
}) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const sessionChecked = useUserStore((state) => state.sessionChecked);
  const checkSession = useUserStore((state) => state.checkSession);
  const shouldCheckSession = dashboardPath === undefined;
  const resolvedDashboardPath = shouldCheckSession
    ? getDashboardPath(user?.role)
    : dashboardPath;
  const resolvedSessionLoading =
    isSessionLoading ?? (loading || !sessionChecked);

  useEffect(() => {
    if (shouldCheckSession) checkSession();
  }, [checkSession, shouldCheckSession]);

  return (
    <header className="sticky top-0 z-50 border-b border-lineColor bg-nightColor/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5"
          aria-label="HRX AI home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-sm font-bold text-white">
            H
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-lightColor">
            HRX <span className="text-mutedColor">AI</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="rounded-lg px-3 py-2 text-sm text-lightColor transition-colors hover:bg-white/5 sm:px-3.5"
          >
            Open jobs
          </button>

          {resolvedSessionLoading ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-panelHighColor" />
          ) : resolvedDashboardPath ? (
            <button
              type="button"
              onClick={() => router.push(resolvedDashboardPath)}
              className="inline-flex items-center gap-2 rounded-lg bg-accentColor px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accentDeepColor"
            >
              <DashboardOutlined />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="hidden rounded-lg px-3.5 py-2 text-sm text-mutedColor transition-colors hover:text-lightColor sm:block"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg bg-lightColor px-3.5 py-2 text-sm font-medium text-nightColor transition-colors hover:bg-white"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
