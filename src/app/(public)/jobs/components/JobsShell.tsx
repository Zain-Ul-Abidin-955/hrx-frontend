"use client";

import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import antdDarkTheme from "@/lib/antdDarkTheme";
import LandingHeader from "../../components/LandingHeader";

export default function JobsShell({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={antdDarkTheme}>
      <div className="hrx-dark min-h-screen bg-nightColor font-[family-name:var(--font-poppins)] text-lightColor antialiased">
        <LandingHeader />
        {children}
      </div>
    </ConfigProvider>
  );
}
