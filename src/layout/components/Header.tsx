"use client";
import React, { useState } from "react";
import { Badge, Dropdown, ConfigProvider } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import LogoutModal from "@/components/modal/MyModal";
import type { AppRole } from "@/layout/Layout";
import useUserStore from "@/store/userStore";
import antdDarkTheme from "@/lib/antdDarkTheme";
import { getNameInitial } from "@/utils/getNameInitial";
import { getUserDisplayName } from "@/utils/profileHelpers";

const SETTINGS_PATH_BY_ROLE: Record<AppRole, string> = {
  superadmin: "/superadmin/profile",
  org_admin: "/orgnization/profile",
  employee: "/employee/profile",
};

/** Second path segment → the title shown in the navbar. */
const TITLE_BY_SEGMENT: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  recruitment: "Recruitment",
  attendance: "Attendance",
  leaves: "Leaves",
  reports: "Reports",
  profile: "Profile",
  organization: "Organizations",
  "chat-bot": "AI Assistant",
  chatbot: "AI Assistant",
};

interface HeaderProps {
  role: AppRole;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

function formatRoleLabel(role?: string | null): string {
  if (!role) return "User";
  return role.replace(/_/g, " ");
}

/** "/orgnization/recruitment/senior-dev" → "Recruitment" */
function pageTitleFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[1];
  return TITLE_BY_SEGMENT[segment ?? ""] ?? "Dashboard";
}

const TOGGLE_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded-lg text-mutedColor transition-colors hover:bg-white/[0.06] hover:text-lightColor";

const Header: React.FC<HeaderProps> = ({
  role,
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const clearUser = useUserStore((state) => state.clearUser);

  const userEmail = user?.email ?? "";
  const userRole = formatRoleLabel(user?.role);
  const userName = getUserDisplayName(user);
  const displayName = userName || userRole;
  const avatarInitial = getNameInitial(userName || displayName);
  const title = pageTitleFromPath(pathname);

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("role");
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push(SETTINGS_PATH_BY_ROLE[role]),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => setIsLogoutModalOpen(true),
      danger: true,
    },
  ];

  const toggleButton = onToggleSidebar && (
    <button
      onClick={onToggleSidebar}
      aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={TOGGLE_BUTTON}
    >
      {isSidebarCollapsed ? (
        <MenuUnfoldOutlined className="text-[17px]" />
      ) : (
        <MenuFoldOutlined className="text-[17px]" />
      )}
    </button>
  );

  return (
    <>
      {/* Only the bar itself is dark-themed; the logout modal is a content-layer
          dialog and stays on the light dashboard theme, like the sidebar's. */}
      <ConfigProvider theme={antdDarkTheme}>
        <header className="hrx-dark h-16 w-full border-b border-lineColor bg-nightColor">
          <div className="flex h-full items-center gap-3 px-4 sm:px-6">
            {toggleButton}

            <div className="min-w-0 flex-1">
              {loading && !user ? (
                <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
              ) : (
                <h1 className="truncate text-[15px] font-semibold tracking-tight text-lightColor">
                  {title}
                </h1>
              )}
            </div>

           
            <span className="hidden h-6 w-px bg-lineColor sm:block" />

            {loading && !user ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
            ) : (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.06]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accentColor to-glowColor text-sm font-semibold text-white">
                    {avatarInitial}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-[160px] truncate text-xs font-medium capitalize text-lightColor">
                      {displayName}
                    </span>
                    <span className="block max-w-[160px] truncate text-[11px] text-mutedColor">
                      {userEmail || userRole}
                    </span>
                  </span>
                  <DownOutlined className="hidden text-[10px] text-mutedColor sm:block" />
                </button>
              </Dropdown>
            )}
          </div>
        </header>
      </ConfigProvider>

      <LogoutModal
        open={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Header;
