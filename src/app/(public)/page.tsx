"use client";

import React, { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import {
  RobotOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SafetyOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import LandingNav from "./components/LandingNav";
import SignupDialog from "./components/SignupDialog";
import ProductPreview from "./components/ProductPreview";
import useUserStore from "@/store/userStore";
import { getDashboardPath } from "@/utils/authRoutes";
import antdDarkTheme from "@/lib/antdDarkTheme";

const STATS = [
  { value: "10K+", label: "Active users" },
  { value: "95%", label: "Admin time saved" },
  { value: "24/7", label: "AI support" },
  { value: "99.9%", label: "Uptime" },
];

const FEATURES = [
  {
    icon: <TeamOutlined />,
    title: "Recruitment with built-in ATS",
    description:
      "Publish roles, collect applications, and let AI screen and rank every résumé against the job description.",
    span: "lg:col-span-2",
  },
  {
    icon: <CalendarOutlined />,
    title: "Attendance & leave",
    description:
      "Automated check-ins, real-time monitoring, and leave requests that route themselves to the right approver.",
    span: "lg:col-span-2",
  },
  {
    icon: <LineChartOutlined />,
    title: "Analytics dashboard",
    description:
      "Headcount, productivity trends, and hiring velocity — all live, no spreadsheet exports required.",
    span: "lg:col-span-2",
  },
  {
    icon: <FileTextOutlined />,
    title: "Employee self-service",
    description:
      "A portal where your team handles payroll details, benefits, time off, and documents on their own.",
    span: "lg:col-span-3",
  },
  {
    icon: <SafetyOutlined />,
    title: "Compliance & security",
    description:
      "Role-based access, encrypted records, and audit-ready exports across every organization on the platform.",
    span: "lg:col-span-3",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Set up your organization",
    description:
      "Import employees, define roles and policies, and invite your admins. Takes minutes, not a migration project.",
  },
  {
    step: "02",
    title: "Let the AI take the load",
    description:
      "Résumés get screened and ranked, attendance reconciles itself, and routine employee questions are answered around the clock.",
  },
  {
    step: "03",
    title: "Decide with real numbers",
    description:
      "Live dashboards and an assistant you can ask in plain English — “who is on leave next week?” — before you commit to anything.",
  },
];

const BENEFITS = [
  "Reduce hiring time by 60% with AI-powered screening",
  "Automate 80% of repetitive HR tasks",
  "Real-time workforce analytics and insights",
  "24/7 AI assistant for employee support",
  "Seamless integration with existing tools",
  "Secure, compliant, and scalable for any team size",
];

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [signupOpen, setSignupOpen] = useState(false);

  const user = useUserStore((state) => state.user);
  const checkSession = useUserStore((state) => state.checkSession);

  const dashboardPath = getDashboardPath(user?.role);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openSignup = () => setSignupOpen(true);

  const primaryAction = () => {
    if (dashboardPath) router.push(dashboardPath);
    else openSignup();
  };

  const primaryLabel = dashboardPath
    ? "Go to dashboard"
    : "Create your workspace";

  return (
    <ConfigProvider theme={antdDarkTheme}>
      <div className="hrx-dark min-h-screen bg-nightColor font-[family-name:var(--font-poppins)] text-lightColor antialiased">
        <LandingNav onGetStarted={openSignup} dashboardPath={dashboardPath} />

        {/* ---------------------------------------------------------- Hero */}
        <section className="hrx-grid relative overflow-hidden">
          {/* ambient glows */}
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accentColor/20 blur-[140px]" />
          <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-glowColor/10 blur-[120px]" />

          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
            <div className="hrx-rise mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-lineColor bg-panelColor/70 py-1.5 pl-2.5 pr-4 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-glowColor" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glowColor" />
                </span>
                <span className="text-xs font-medium tracking-wide text-mutedColor">
                  AI-powered workforce management
                </span>
              </div>

              <h1 className="mt-7 text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Hire faster. Manage smarter.
                <span className="hrx-gradient-text mt-2 block">
                  Let AI handle the rest.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-mutedColor sm:text-lg">
                HRX AI brings recruitment, attendance, leave, and workforce
                analytics into one workspace — with an assistant that screens
                candidates, answers employee questions, and tells you what needs
                attention today.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={primaryAction}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lightColor px-7 text-sm font-medium text-nightColor transition-all hover:bg-white sm:w-auto"
                >
                  {primaryLabel}
                  <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/jobs")}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-lineColor bg-panelColor/60 px-7 text-sm font-medium text-lightColor backdrop-blur transition-colors hover:border-mutedColor/40 hover:bg-panelHighColor sm:w-auto"
                >
                  Browse open jobs
                </button>
              </div>

              <p className="mt-5 text-xs text-mutedColor/80">
                Takes about two minutes — we&apos;ll email your setup link.
              </p>
            </div>

            {/* product shot */}
            <div className="hrx-rise relative mx-auto mt-16 max-w-5xl [animation-delay:150ms]">
              <div className="pointer-events-none absolute -inset-x-16 -top-10 bottom-0 rounded-[40px] bg-accentColor/10 blur-[90px]" />
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Stats */}
        <section className="relative border-y border-lineColor bg-nightSoftColor/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-5 sm:px-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-2 py-9 text-center">
                <div className="text-3xl font-semibold tracking-tight text-lightColor sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-xs uppercase tracking-widest text-mutedColor">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ Features */}
        <section id="features" className="scroll-mt-20 px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">
                Platform
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-[2.65rem] sm:leading-tight">
                One workspace for the whole employee lifecycle
              </h2>
              <p className="mt-4 text-base leading-relaxed text-mutedColor">
                Every module shares the same data, so a hire made on Monday is
                on the attendance sheet Tuesday and in your reports by Friday.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-6">
              {/* lead card */}
              <article className="hrx-ring group relative overflow-hidden rounded-2xl border border-lineColor bg-panelColor p-7 transition-colors hover:border-lineColor lg:col-span-6">
                <div className="relative grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accentColor to-accentDeepColor text-lg text-white shadow-lg shadow-accentColor/20">
                      <RobotOutlined />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-lightColor">
                      An assistant that actually knows your company
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-mutedColor">
                      Ask it anything about your workforce and it answers from
                      your live HR data — headcount, policy, leave balances,
                      candidate scores. It drafts job descriptions, screens
                      applicants, and handles employee questions so your team
                      doesn&apos;t answer the same one twice.
                    </p>
                  </div>

                  <div className="space-y-2.5 rounded-xl border border-lineColor bg-nightSoftColor/70 p-4">
                    <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-accentColor px-3.5 py-2.5 text-xs leading-relaxed text-white">
                      Who is out of office next week?
                    </div>
                    <div className="max-w-[85%] rounded-xl rounded-bl-sm border border-lineColor bg-panelHighColor px-3.5 py-2.5 text-xs leading-relaxed text-mutedColor">
                      Four people: two on annual leave, one on sick leave, one
                      remote. Engineering is down 20% — want me to flag it to
                      the sprint owner?
                    </div>
                    <div className="ml-auto max-w-[70%] rounded-xl rounded-br-sm bg-accentColor px-3.5 py-2.5 text-xs leading-relaxed text-white">
                      Yes, and reschedule Thursday&apos;s interviews.
                    </div>
                  </div>
                </div>
              </article>

              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className={`hrx-ring group relative rounded-2xl border border-lineColor bg-panelColor p-6 transition-transform duration-300 hover:-translate-y-1 ${feature.span}`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-lineColor bg-panelHighColor text-base text-accentColor transition-colors group-hover:border-accentColor/40 group-hover:text-glowColor">
                    {feature.icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-lightColor">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mutedColor">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Steps */}
        <section
          id="platform"
          className="scroll-mt-20 border-y border-lineColor bg-nightSoftColor/50 px-5 py-24 sm:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-glowColor">
                How it works
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-[2.65rem] sm:leading-tight">
                Live in a day, not a quarter
              </h2>
            </div>

            <div className="relative mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
              {/* connector */}
              <div className="hrx-rule pointer-events-none absolute left-0 right-0 top-5 hidden lg:block" />

              {STEPS.map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lineColor bg-panelColor text-xs font-semibold text-accentColor">
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-lightColor">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mutedColor">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- Why */}
        <section id="why" className="scroll-mt-20 px-5 py-24 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-accentColor">
                Why HRX
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-[2.65rem] sm:leading-tight">
                Built for teams that outgrew the spreadsheet
              </h2>
              <p className="mt-4 text-base leading-relaxed text-mutedColor">
                HR teams spend most of their week on work a system should do on
                its own. HRX takes that layer off your plate and leaves the
                judgement calls to you.
              </p>
              <button
                type="button"
                onClick={primaryAction}
                className="group mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-accentColor px-6 text-sm font-medium text-white transition-colors hover:bg-accentDeepColor"
              >
                {primaryLabel}
                <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <ul className="space-y-3">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-4 rounded-xl border border-lineColor bg-panelColor/60 p-5 transition-colors hover:border-accentColor/30 hover:bg-panelColor"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accentColor/15 text-[10px] text-glowColor">
                    <CheckOutlined />
                  </span>
                  <span className="text-sm leading-relaxed text-lightColor/90">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ----------------------------------------------------------- CTA */}
        <section className="px-5 pb-24 sm:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-lineColor bg-panelColor px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-accentColor/25 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-glowColor/10 blur-[100px]" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-tight">
                Give your HR team its week back
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mutedColor">
                Set up your workspace today and see what the assistant finds in
                your first hiring cycle.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={primaryAction}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lightColor px-7 text-sm font-medium text-nightColor transition-colors hover:bg-white sm:w-auto"
                >
                  {primaryLabel}
                  <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
                </button>
                {!dashboardPath && (
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="flex h-12 w-full items-center justify-center rounded-xl border border-lineColor px-7 text-sm font-medium text-lightColor transition-colors hover:border-mutedColor/40 hover:bg-panelHighColor sm:w-auto"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Footer */}
        <footer className="border-t border-lineColor px-5 py-12 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-sm font-bold text-white">
                H
              </span>
              <div>
                <div className="text-sm font-semibold text-lightColor">
                  HRX AI
                </div>
                <div className="text-xs text-mutedColor">
                  AI-powered workforce management
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-mutedColor">
              <a href="#features" className="transition-colors hover:text-lightColor">
                Features
              </a>
              <a href="#platform" className="transition-colors hover:text-lightColor">
                How it works
              </a>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="transition-colors hover:text-lightColor"
              >
                Jobs
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="transition-colors hover:text-lightColor"
              >
                Sign in
              </button>
            </nav>
          </div>

          <div className="mx-auto mt-10 max-w-6xl border-t border-lineColor pt-6 text-xs text-mutedColor/70">
            © {new Date().getFullYear()} HRX AI. All rights reserved.
          </div>
        </footer>

        <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
