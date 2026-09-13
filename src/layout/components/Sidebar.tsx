"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton, Tooltip } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  FileSearchOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  RobotOutlined,
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
  /** Renders a live cyan dot next to the label. */
  pulse?: boolean;
}

/** Nav is grouped so the rail scans as sections rather than one long list. */
interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const SIDEBAR_BY_ROLE: Record<AppRole, SidebarSection[]> = {
  superadmin: [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: <AppstoreOutlined />,
          link: "/superadmin/dashboard",
          paths: ["/superadmin/dashboard", "/superadmin"],
        },
      ],
    },
    {
      label: "Manage",
      items: [
        {
          name: "Organizations",
          icon: <BankOutlined />,
          link: "/superadmin/organization",
          paths: ["/superadmin/organization"],
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          name: "Profile",
          icon: <UserOutlined />,
          link: "/superadmin/profile",
          paths: ["/superadmin/profile"],
        },
      ],
    },
  ],

  org_admin: [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: <AppstoreOutlined />,
          link: "/orgnization/dashboard",
          paths: ["/orgnization/dashboard", "/orgnization"],
        },
        {
          name: "AI Assistant",
          icon: <RobotOutlined />,
          link: "/orgnization/chat-bot",
          paths: ["/orgnization/chat-bot"],
          pulse: true,
        },
      ],
    },
    {
      label: "Workforce",
      items: [
        {
          name: "Employees",
          icon: <TeamOutlined />,
          link: "/orgnization/employees",
          paths: ["/orgnization/employees"],
        },
        {
          name: "Attendance",
          icon: <ClockCircleOutlined />,
          link: "/orgnization/attendance",
          paths: ["/orgnization/attendance"],
        },
        {
          name: "Leaves",
          icon: <CalendarOutlined />,
          link: "/orgnization/leaves",
          paths: ["/orgnization/leaves"],
        },
      ],
    },
    {
      label: "Hiring",
      items: [
        {
          name: "Recruitment",
          icon: <FileSearchOutlined />,
          link: "/orgnization/recruitment",
          paths: ["/orgnization/recruitment"],
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          name: "Profile",
          icon: <UserOutlined />,
          link: "/orgnization/profile",
          paths: ["/orgnization/profile"],
        },
      ],
    },
  ],

  employee: [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: <AppstoreOutlined />,
          link: "/employee/dashboard",
          paths: ["/employee/dashboard", "/employee"],
        },
      ],
    },
    {
      label: "My time",
      items: [
        {
          name: "Attendance",
          icon: <ClockCircleOutlined />,
          link: "/employee/attendance",
          paths: ["/employee/attendance"],
        },
        {
          name: "Leave",
          icon: <CalendarOutlined />,
          link: "/employee/leaves",
          paths: ["/employee/leaves"],
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          name: "Profile",
          icon: <UserOutlined />,
          link: "/employee/profile",
          paths: ["/employee/profile"],
        },
      ],
    },
  ],
};

/** Shared shape for every row in the rail, active or not. */
const ROW_BASE =
  "group relative flex items-center rounded-xl transition-colors duration-200";
const ROW_IDLE =
  "!text-mutedColor hover:!bg-white/[0.06] hover:!text-lightColor";
const ROW_ACTIVE =
  "!bg-accentColor/15 !text-lightColor ring-1 ring-inset ring-accentColor/30";

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
  const sections = hasRole
    ? (SIDEBAR_BY_ROLE[role] ?? SIDEBAR_BY_ROLE.org_admin)
    : [];

  const isActiveRoute = (paths: string[]): boolean =>
    paths.some((path) => pathname === path);

  const isParentActive = (item: SidebarItem): boolean =>
    item.paths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  const isMenuOpen = (item: SidebarItem): boolean =>
    openMenus[item.name] ?? isParentActive(item);

  const toggleMenu = (item: SidebarItem) => {
    setOpenMenus((prev) => ({ ...prev, [item.name]: !isMenuOpen(item) }));
  };

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("role");
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  /** Accent bar on the left edge of the active row. */
  const activeMarker = (
    <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-accentColor to-glowColor" />
  );

  const renderIcon = (item: SidebarItem, active: boolean) => (
    <span
      className={`shrink-0 text-[17px] transition-colors ${
        active ? "text-accentColor" : "text-mutedColor group-hover:text-lightColor"
      }`}
    >
      {item.icon}
    </span>
  );

  const renderLabel = (item: SidebarItem) => (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate text-sm font-medium">{item.name}</span>
      {item.pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="hrx-ping-soft absolute inline-flex h-full w-full rounded-full bg-glowColor" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glowColor" />
        </span>
      )}
    </span>
  );

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
        className={`${ROW_BASE} w-full ${
          isCollapsed ? "justify-center px-3 py-2.5" : "justify-between px-3 py-2.5"
        } ${active ? ROW_ACTIVE : ROW_IDLE}`}
      >
        {active && !isCollapsed && activeMarker}
        <span className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
          {renderIcon(item, active)}
          {!isCollapsed && renderLabel(item)}
        </span>
        {!isCollapsed && (
          <DownOutlined
            className={`text-[10px] text-mutedColor transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
        )}
      </button>
    );
  };

  const renderChildren = (item: SidebarItem, isOpen: boolean) => {
    if (!item.children?.length || isCollapsed || !isOpen) return null;

    return (
      <ul className="ml-[26px] mt-1 space-y-0.5 border-l border-lineColor pl-3">
        {item.children.map((child) => {
          const childActive = isActiveRoute(child.paths);

          return (
            <li key={child.link}>
              <Link
                href={child.link}
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  childActive
                    ? "!bg-white/[0.06] !text-lightColor font-medium"
                    : "!text-mutedColor hover:!bg-white/[0.04] hover:!text-lightColor"
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

  const renderItem = (item: SidebarItem) => {
    const hasChildren = Boolean(item.children?.length);
    const isOpen = isMenuOpen(item);
    const active = isActiveRoute(item.paths);

    return (
      <li key={item.name}>
        <Tooltip
          title={item.name}
          placement="right"
          trigger="hover"
          color="#161A26"
          open={isCollapsed ? undefined : false}
        >
          {hasChildren ? (
            renderParentButton(item, isOpen)
          ) : (
            <Link
              href={item.link ?? "#"}
              onClick={onNavigate}
              className={`${ROW_BASE} ${
                isCollapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2.5"
              } ${active ? ROW_ACTIVE : ROW_IDLE}`}
            >
              {active && !isCollapsed && activeMarker}
              {renderIcon(item, active)}
              {!isCollapsed && renderLabel(item)}
            </Link>
          )}
        </Tooltip>
        {hasChildren && renderChildren(item, isOpen)}
      </li>
    );
  };

  return (
    <div className="hrx-dark hrx-rail flex h-full w-full flex-col border-r border-lineColor bg-nightColor">
      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-lineColor ${
          isCollapsed ? "justify-center px-2" : "gap-2.5 px-5"
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-sm font-bold text-white">
          H
        </span>
        {!isCollapsed && (
          <span className="truncate text-[15px] font-semibold tracking-tight text-lightColor">
            HRX <span className="text-mutedColor">AI</span>
          </span>
        )}
      </div>

      {/* Org chip — the tenant you are looking at, not a tagline. */}
      {!isCollapsed && (
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-lineColor bg-nightSoftColor px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accentColor/15 text-[13px] text-accentColor">
              <BankOutlined />
            </span>
            <div className="min-w-0 flex-1">
              {hasRole ? (
                <>
                  <p className="truncate text-xs font-medium text-lightColor">
                    {orgName || "Your organization"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-mutedColor">
                    Workspace
                  </p>
                </>
              ) : (
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "100%", height: 14, minWidth: 0 }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="hrx-rail-scroll flex-1 overflow-y-auto px-3 py-4">
        {!hasRole ? (
          <ul className="space-y-2">
            {Array.from({ length: isCollapsed ? 5 : 6 }).map((_, index) => (
              <li
                key={index}
                className={`flex items-center px-3 py-2.5 ${
                  isCollapsed ? "justify-center" : "gap-3"
                }`}
              >
                <Skeleton.Avatar active size="small" shape="square" />
                {!isCollapsed && (
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "70%", height: 14, minWidth: 0 }}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          sections.map((section, index) => (
            <div key={section.label} className={index > 0 ? "mt-6" : ""}>
              {isCollapsed ? (
                index > 0 && <div className="mx-auto mb-3 h-px w-8 bg-lineColor" />
              ) : (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedColor/70">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">{section.items.map(renderItem)}</ul>
            </div>
          ))
        )}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-lineColor p-3">
        <Tooltip
          title="Logout"
          placement="right"
          trigger="hover"
          color="#161A26"
          open={isCollapsed ? undefined : false}
        >
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`${ROW_BASE} w-full text-mutedColor hover:bg-secondaryColor/10 hover:text-secondaryColor ${
              isCollapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogoutOutlined className="shrink-0 text-[17px]" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </Tooltip>
      </div>

      <MyModal
        open={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
