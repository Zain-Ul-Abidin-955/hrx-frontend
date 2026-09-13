"use client";

import React from "react";
import {
  AppstoreOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  LineChartOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";

const NAV_ITEMS = [
  { icon: <AppstoreOutlined />, label: "Dashboard", active: true },
  { icon: <TeamOutlined />, label: "Employees" },
  { icon: <FileSearchOutlined />, label: "Recruitment" },
  { icon: <CalendarOutlined />, label: "Attendance" },
  { icon: <LineChartOutlined />, label: "Reports" },
  { icon: <SettingOutlined />, label: "Settings" },
];

const STATS = [
  { label: "Headcount", value: "248", delta: "+12" },
  { label: "Open roles", value: "14", delta: "+3" },
  { label: "Attendance", value: "96.4%", delta: "+1.8" },
];

/** Relative bar heights for the mock hiring-funnel chart. */
const BARS = [38, 56, 44, 72, 61, 88, 70, 96, 64, 82, 54, 76];

const PIPELINE = [
  { stage: "Screened by AI", count: 412, pct: 100 },
  { stage: "Shortlisted", count: 96, pct: 58 },
  { stage: "Interviewing", count: 31, pct: 32 },
  { stage: "Offer sent", count: 8, pct: 14 },
];

/**
 * Static, non-interactive rendering of the HRX workspace used as the hero
 * visual. Purely decorative — hidden from assistive tech.
 */
const ProductPreview: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative select-none overflow-hidden rounded-2xl border border-lineColor bg-panelColor shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
    >
      {/* window chrome */}
      <div className="flex h-11 items-center gap-3 border-b border-lineColor bg-nightSoftColor px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        </div>
        <div className="mx-auto hidden rounded-md border border-lineColor bg-panelColor px-3 py-1 text-[11px] text-mutedColor sm:block">
          app.hrx.ai/dashboard
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-lineColor bg-nightSoftColor/60 p-3 md:block">
          <div className="mb-5 flex items-center gap-2 px-2 pt-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-[11px] font-bold text-white">
              H
            </span>
            <span className="text-sm font-semibold text-lightColor">HRX AI</span>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                  item.active
                    ? "bg-accentColor/15 font-medium text-lightColor ring-1 ring-accentColor/30"
                    : "text-mutedColor"
                }`}
              >
                <span
                  className={item.active ? "text-accentColor" : "text-mutedColor"}
                >
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* main panel */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-lightColor">
                Good morning, Sarah
              </div>
              <div className="text-[11px] text-mutedColor">
                Here is what moved overnight
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-lineColor bg-nightSoftColor px-2.5 py-1.5 text-[11px] text-mutedColor sm:flex">
                <SearchOutlined />
                Search
              </div>
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-accentColor to-glowColor" />
            </div>
          </div>

          {/* stat row */}
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-lineColor bg-nightSoftColor/70 p-3"
              >
                <div className="text-[10px] uppercase tracking-wide text-mutedColor">
                  {stat.label}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold text-lightColor">
                    {stat.value}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-glowColor">
                    <ArrowUpOutlined style={{ fontSize: 9 }} />
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2.5 lg:grid-cols-5">
            {/* chart */}
            <div className="rounded-xl border border-lineColor bg-nightSoftColor/70 p-3.5 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-lightColor">
                  Applications this quarter
                </span>
                <span className="rounded-md bg-accentColor/15 px-1.5 py-0.5 text-[10px] text-accentColor">
                  +24%
                </span>
              </div>
              <div className="flex h-24 items-end gap-1.5">
                {BARS.map((height, index) => (
                  <div
                    key={index}
                    style={{ height: `${height}%` }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-accentColor/25 to-accentColor"
                  />
                ))}
              </div>
            </div>

            {/* pipeline */}
            <div className="rounded-xl border border-lineColor bg-nightSoftColor/70 p-3.5 lg:col-span-2">
              <div className="mb-3 text-xs font-medium text-lightColor">
                Hiring pipeline
              </div>
              <div className="space-y-2.5">
                {PIPELINE.map((row) => (
                  <div key={row.stage}>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="text-mutedColor">{row.stage}</span>
                      <span className="text-lightColor">{row.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-lineColor">
                      <div
                        style={{ width: `${row.pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-accentColor to-glowColor"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* assistant */}
          <div className="mt-2.5 rounded-xl border border-accentColor/25 bg-gradient-to-r from-accentColor/10 to-glowColor/5 p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-glowColor" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glowColor" />
              </span>
              <span className="text-[11px] font-medium text-lightColor">
                HRX Assistant
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-mutedColor">
              3 candidates for{" "}
              <span className="text-lightColor">Senior Backend Engineer</span>{" "}
              scored above 90%. Shall I schedule interviews for Thursday?
            </p>
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-lineColor bg-nightColor/60 px-2.5 py-1.5">
              <span className="flex-1 text-[11px] text-mutedColor/70">
                Ask anything about your workforce…
              </span>
              <SendOutlined className="text-[11px] text-accentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
