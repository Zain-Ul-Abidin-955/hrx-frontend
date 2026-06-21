"use client";
import { Layout } from "antd";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const { Content, Sider } = Layout;

const MOBILE_BREAKPOINT = 768;

export type AppRole = "superadmin" | "org_admin";

function readRoleFromStorage(): AppRole {
  if (typeof window === "undefined") return "org_admin";
  const raw = (localStorage.getItem("role") ?? "").toLowerCase().trim();
  if (raw === "superadmin") return "superadmin";
  if (
    raw === "org_admin" ||
    raw === "admin" ||
    raw === "hr" ||
    raw === "employee"
  ) {
    return "org_admin";
  }
  return "org_admin";
}

interface LayoutProps {
  children: React.ReactNode;
}

const MyLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [role, setRole] = useState<AppRole>("org_admin");
  const sidebarWidth = sidebarCollapsed ? 80 : 250;

  // Role from localStorage (set on login)
  useEffect(() => {
    const storedRole = readRoleFromStorage();
    queueMicrotask(() => setRole(storedRole));
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // On mobile, close sidebar when navigating
  const handleSidebarNavigate = () => {
    if (isMobile) setSidebarCollapsed(true);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      {/* Mobile overlay backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Fixed Sidebar - overlay on mobile when open */}
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
          transform: isMobile && sidebarCollapsed ? "translateX(-100%)" : "none",
          width: isMobile ? 250 : undefined,
        }}
      >
        <Sidebar
          role={role}
          isCollapsed={!isMobile && sidebarCollapsed}
          onNavigate={handleSidebarNavigate}
        />
      </Sider>

      {/* Main Layout with Header */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: "all 0.3s ease",
        }}
      >
        {/* Fixed Header */}
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

        {/* Content Area with top padding for fixed header */}
        <Content
          className="bg-offWhiteColor"
          style={{
            marginTop: "64px", // Height of fixed header
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <div id="detail" className="p-6">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyLayout;
