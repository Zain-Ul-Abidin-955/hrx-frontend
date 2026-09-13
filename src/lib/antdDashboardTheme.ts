import type { ThemeConfig } from "antd";

/**
 * Ant Design theme for the dashboard's light content area.
 *
 * The shell (rail + navbar) is dark and themed separately via `antdDarkTheme`;
 * this covers everything inside `Content`. Primary is the landing page's indigo
 * rather than the old navy, so buttons, tags, links and focus rings read as the
 * same brand as the marketing site.
 */
const antdDashboardTheme: ThemeConfig = {
  token: {
    colorPrimary: "#4F46E5",
    colorInfo: "#4F46E5",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    colorError: "#EF4444",
    colorTextBase: "#1E1E1E",
    colorBgLayout: "#F9F9F9",
    colorBorderSecondary: "#ECEEF3",
    borderRadius: 12,
    fontFamily: "var(--font-poppins), system-ui, sans-serif",
  },
  components: {
    Card: {
      // Flat cards with a hairline border; elevation is applied on hover only.
      boxShadowTertiary: "none",
      headerFontSize: 15,
      borderRadiusLG: 16,
    },
    Table: {
      headerBg: "#F7F8FB",
      headerColor: "#6B7280",
      headerSplitColor: "transparent",
      rowHoverBg: "#F7F8FB",
      borderColor: "#ECEEF3",
    },
    Button: {
      controlHeight: 38,
      fontWeight: 500,
      primaryShadow: "none",
      defaultShadow: "none",
    },
    Progress: {
      defaultColor: "#4F46E5",
      remainingColor: "#ECEEF3",
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export default antdDashboardTheme;
