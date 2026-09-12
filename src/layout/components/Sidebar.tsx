"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton, Tooltip } from "antd";
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
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { AppRole } from "@/layout/Layout";
import useUserStore from "@/store/userStore";
import MyModal from "@/components/modal/MyModal";

interface SidebarChildItem {
  name: string;
  link: string;
  paths: string[];
}

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  link?: string;
  paths: string[];
  children?: SidebarChildItem[];
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
      name: "Profile",
      icon: <UserOutlined />,
      link: "/superadmin/profile",
      paths: ["/superadmin/profile"],
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
      name: "Leaves",
      icon: <FileTextOutlined />,
      link: "/orgnization/leaves",
      paths: ["/orgnization/leaves"],
    },
    {
      name: "AI Assistant",
      icon: <RobotOutlined />,
      link: "/orgnization/chat-bot",
      paths: ["/orgnization/chat-bot"],
    },
    {
      name: "Profile",
      icon: <UserOutlined />,
      link: "/orgnization/profile",
      paths: ["/orgnization/profile"],
    },
  ],
  employee: [
    {
      name: "Dashboard",
      icon: <DashboardOutlined />,
      link: "/employee/dashboard",
      paths: ["/employee/dashboard", "/employee"],
    },
    {
      name: "Attendance",
      icon: <CalendarOutlined />,
      link: "/employee/attendance",
      paths: ["/employee/attendance"],
    },
    {
      name: "Leave",
      icon: <FileTextOutlined />,
      link: "/employee/leaves",
      paths: ["/employee/leaves"],
    },
    {
      name: "Profile",
      icon: <UserOutlined />,
      link: "/employee/profile",
      paths: ["/employee/profile"],
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
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const orgName = user?.organization?.name;
  const hasRole = Boolean(user?.role);
  const sidebarItems = hasRole
    ? (SIDEBAR_BY_ROLE[role] ?? SIDEBAR_BY_ROLE.org_admin)
    : [];

  const isActiveRoute = (paths: string[]): boolean => {
    return paths.some((path) => pathname === path);
  };

  const isParentActive = (item: SidebarItem): boolean => {
    return item.paths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  const isMenuOpen = (item: SidebarItem): boolean => {
    if (openMenus[item.name] !== undefined) {
      return openMenus[item.name];
    }
    return isParentActive(item);
  };

  const toggleMenu = (item: SidebarItem) => {
    setOpenMenus((prev) => ({
      ...prev,
      [item.name]: !isMenuOpen(item),
    }));
  };

  const showLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("role");
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const renderParentButton = (item: SidebarItem, isOpen: boolean) => {
    const active = isParentActive(item);

    return (
      <button
        type="button"
        onClick={() => {
          if (isCollapsed) {
            router.push(item.children?.[0]?.link ?? "#");
            onNavigate?.();
            return;
          }
          toggleMenu(item);
        }}
        className={`w-full flex items-center rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center px-3 py-3" : "justify-between px-4 py-3"
          } ${active
            ? "bg-primaryColor text-white shadow-md"
            : "text-primaryColor hover:bg-gray-100 hover:text-primaryColor"
          }`}
      >
        <span className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}>
          <span className="text-xl shrink-0">{item.icon}</span>
          {!isCollapsed && (
            <span className="font-medium text-sm">{item.name}</span>
          )}
        </span>
        {!isCollapsed && (
          <DownOutlined
            className={`text-xs text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"
              }`}
          />
        )}
      </button>
    );
  };

  const renderChildren = (item: SidebarItem, isOpen: boolean) => {
    if (!item.children?.length || isCollapsed || !isOpen) return null;

    return (
      <ul className="mt-1 ml-7 border-l border-gray-200 pl-3 space-y-1">
        {item.children.map((child) => {
          const childActive = isActiveRoute(child.paths);

          return (
            <li key={child.link}>
              <Link
                href={child.link}
                onClick={onNavigate}
                className={`block rounded-md px-3 py-2 mt-2 text-sm transition-colors ${childActive
                    ? "!bg-gray-100 !text-primaryColor font-medium"
                    : "!text-primaryColor hover:!bg-gray-100 hover:!text-primaryColor"
                  }`}
              >
                {child.name}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 w-full flex flex-col">
      <div
        className={`text-center border-b border-gray-200 flex flex-col items-center justify-center ${isCollapsed ? "py-6 px-2" : "py-6 px-4"
          }`}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-center space-x-2"
            }`}
        >
          {/* <RobotOutlined className="text-3xl text-primaryColor  shrink-0" /> */}
          {!isCollapsed && (
            <span className="text-2xl font-bold bg-linear-to-r from-primaryColor to-primaryColor bg-clip-text text-transparent">
              HRX AI
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-2 w-full flex justify-center">
            {hasRole ? (
              <p className="text-xs text-gray-500">
                {orgName || "HR Management System"}
              </p>
            ) : (
              <Skeleton.Input active size="small" style={{ width: 140, height: 14 }} />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        {!hasRole ? (
          <ul className={`space-y-3 ${isCollapsed ? "px-2" : "px-3"}`}>
            {Array.from({ length: isCollapsed ? 5 : 6 }).map((_, index) => (
              <li
                key={index}
                className={`flex items-center ${isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-4 py-3"}`}
              >
                <Skeleton.Avatar active size="small" shape="square" />
                {!isCollapsed && (
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "70%", height: 16, minWidth: 0 }}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ul className={`space-y-2 ${isCollapsed ? "px-2" : "px-3"}`}>
            {sidebarItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isOpen = isMenuOpen(item);

              if (hasChildren) {
                return (
                  <li key={item.name}>
                    <Tooltip
                      title={item.name}
                      placement="right"
                      trigger="hover"
                      open={isCollapsed ? undefined : false}
                    >
                      {renderParentButton(item, isOpen)}
                    </Tooltip>
                    {renderChildren(item, isOpen)}
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Tooltip
                    title={item.name}
                    placement="right"
                    trigger="hover"
                    open={isCollapsed ? undefined : false}
                  >
                    <Link
                      href={item.link ?? "#"}
                      onClick={onNavigate}
                      className={`flex items-center rounded-lg transition-all duration-200 ${isCollapsed
                          ? "justify-center px-3 py-3"
                          : "space-x-3 px-4 py-3"
                        } ${isActiveRoute(item.paths)
                          ? "!bg-primaryColor !text-white shadow-md"
                          : "!text-primaryColor hover:!bg-gray-100 hover:!text-primaryColor"
                        }`}
                    >
                      <span className="text-xl shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.name}</span>
                      )}
                    </Link>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        className={`border-t border-gray-200 space-y-3 ${isCollapsed ? "p-2" : "p-4"
          }`}
      >
        <Tooltip
          title="Logout"
          placement="right"
          trigger="hover"
          open={isCollapsed ? undefined : false}
        >
          <button
            onClick={showLogoutModal}
            className={`w-full flex items-center rounded-lg text-primaryColor hover:bg-gray-100 transition-all duration-200 ${isCollapsed
                ? "justify-center px-3 py-3"
                : "space-x-3 px-4 py-3"
              }`}
          >
            <LogoutOutlined className="text-xl shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </Tooltip>
      </div>

      <MyModal
        open={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
};

export default Sidebar;
