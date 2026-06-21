"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Tooltip } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BankOutlined,
} from "@ant-design/icons";
import LogoutModal from "@/components/modal/LogoutModal";
import type { AppRole } from "@/layout/Layout";


interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  link: string;
  paths: string[];
}


const SIDEBAR_BY_ROLE: Record<AppRole, SidebarItem[]> = {
  superadmin: [
    {
      name: "Dashboard",
      icon: <DashboardOutlined />,
      link: "/superadmin/dashboard",
      paths: ["/superadmin/dashboard", "/superadmin"],
    },
    {
      name: "Organizations",
      icon: <BankOutlined />,
      link: "/superadmin/organization",
      paths: ["/superadmin/organization"],
    },
    {
      name: "Settings",
      icon: <SettingOutlined />,
      link: "/superadmin/settings",
      paths: ["/superadmin/settings"],
    },
  ],
  org_admin: [
    {
      name: "Dashboard",
      icon: <DashboardOutlined />,
      link: "/orgnization/dashboard",
      paths: ["/orgnization/dashboard", "/orgnization"],
    },
    {
      name: "Employees",
      icon: <TeamOutlined />,
      link: "/orgnization/employees",
      paths: ["/orgnization/employees"],
    },
    {
      name: "Recruitment",
      icon: <UserAddOutlined />,
      link: "/orgnization/recruitment",
      paths: ["/orgnization/recruitment"],
    },
    {
      name: "Attendance",
      icon: <CalendarOutlined />,
      link: "/orgnization/attendance",
      paths: ["/orgnization/attendance"],
    },
    {
      name: "AI Assistant",
      icon: <RobotOutlined />,
      link: "/orgnization/chat-bot",
      paths: ["/orgnization/chat-bot"],
    },
    {
      name: "Reports",
      icon: <FileTextOutlined />,
      link: "/orgnization/reports",
      paths: ["/orgnization/reports"],
    },
    {
      name: "Settings",
      icon: <SettingOutlined />,
      link: "/orgnization/settings",
      paths: ["/orgnization/settings"],
    },
  ],
};

interface SidebarProps {
  role: AppRole;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  role,
  isCollapsed = false,
  onNavigate,
}) => {
  const sidebarItems = SIDEBAR_BY_ROLE[role] ?? SIDEBAR_BY_ROLE.org_admin;
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActiveRoute = (item: SidebarItem): boolean => {
    return item.paths.some((path) => pathname === path);
  };

  const showLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const linkContent = (item: SidebarItem) => (
    <>
      <span className="text-xl shrink-0">{item.icon}</span>
      {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
    </>
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 w-full flex flex-col">
      {/* Logo Section */}
      <div
        className={`text-center border-b border-gray-200 flex flex-col items-center justify-center ${isCollapsed ? "py-6 px-2" : "py-6 px-4"
          }`}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-center space-x-2"}`}
        >
          <RobotOutlined className="text-3xl text-blue-600 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HRX AI
              </span>
            </>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-xs text-gray-500 mt-2">HR Management System</p>
        )}
      </div>

      {/* Sidebar Items */}
      <div className="flex-1 py-6 overflow-y-auto">
        <ul className={`space-y-2 ${isCollapsed ? "px-2" : "px-3"}`}>
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <Tooltip
                title={item.name}
                placement="right"
                trigger="hover"
                open={isCollapsed ? undefined : false}
              >
                <Link
                  href={item.link}
                  onClick={onNavigate}
                  className={`flex items-center rounded-lg transition-all duration-200 ${isCollapsed
                    ? "justify-center px-3 py-3"
                    : "space-x-3 px-4 py-3"
                    } ${isActiveRoute(item)
                      ? "!bg-primaryColor !text-white shadow-md"
                      : "!text-gray-700 hover:!bg-gray-100 hover:!text-primaryColor"
                    }`}
                >
                  {linkContent(item)}
                </Link>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Section */}
      <div
        className={`border-t border-gray-200 space-y-3 ${isCollapsed ? "p-2" : "p-4"}`}
      >
        <Tooltip
          title="Logout"
          placement="right"
          trigger="hover"
          open={isCollapsed ? undefined : false}
        >
          <button
            onClick={showLogoutModal}
            className={`w-full flex items-center rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 ${isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-4 py-3"
              }`}
          >
            <LogoutOutlined className="text-xl shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        open={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
};

export default Sidebar;
