"use client";
import { ConfigProvider, Layout } from "antd";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import useUserStore from "@/store/userStore";
import antdDashboardTheme from "@/lib/antdDashboardTheme";

const { Content, Sider } = Layout;

const MOBILE_BREAKPOINT = 768;

export type AppRole = "superadmin" | "org_admin" | "employee";

export function normalizeAppRole(raw?: string | null): AppRole {
  const s = (raw ?? "").toLowerCase().trim();
  if (s === "superadmin") return "superadmin";
  if (s === "employee") return "employee";
  return "org_admin";
}

interface LayoutProps {
  children: React.ReactNode;
}

const MyLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 80 : 250;

  const user = useUserStore((state) => state.user);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const role = normalizeAppRole(user?.role);

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  // On mobile the sider is a drawer, so "not collapsed" means "covering the
  // page". Close it when we cross into mobile — but only on the crossing, since
  // mobile browsers fire resize as the address bar hides, and that would slam
  // shut a drawer the user had just opened.
  const wasMobile = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile && !wasMobile.current) setSidebarCollapsed(true);
      wasMobile.current = mobile;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleSidebarNavigate = () => {
    if (isMobile) setSidebarCollapsed(true);
  };

  return (
    <ConfigProvider theme={antdDashboardTheme}>
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}

        <Sider
          width={isMobile ? 250 : sidebarWidth}
          collapsed={isMobile ? false : sidebarCollapsed}
          className="sider-style"
          style={{
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
            transition: "all 0.3s ease",
            zIndex: 50,
            transform:
              isMobile && sidebarCollapsed ? "translateX(-100%)" : "none",
            width: isMobile ? 250 : undefined,
          }}
        >
          <Sidebar
            role={role}
            isCollapsed={!isMobile && sidebarCollapsed}
            onNavigate={handleSidebarNavigate}
          />
        </Sider>

        <Layout
          style={{
            marginLeft: isMobile ? 0 : sidebarWidth,
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              position: "fixed",
              top: 0,
              left: isMobile ? 0 : sidebarWidth,
              right: 0,
              width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
              transition: "all 0.3s ease",
              zIndex: 30,
            }}
          >
            <Header
              role={role}
              onToggleSidebar={toggleSidebar}
              isSidebarCollapsed={sidebarCollapsed}
            />
          </div>

          <Content
            className="bg-offWhiteColor"
            style={{
              marginTop: "64px",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <div id="detail" className="p-4 sm:p-6">
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MyLayout;
