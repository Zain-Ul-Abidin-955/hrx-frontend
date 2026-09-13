import { theme } from "antd";
import type { ThemeConfig } from "antd";

/**
 * Ant Design theme for the dark public surfaces (landing page and auth flow).
 * Values mirror the landing palette declared in globals.css.
 */
const antdDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#6366F1",
    colorBgElevated: "#10131D",
    colorBgContainer: "#0B0D14",
    colorBorder: "#232839",
    colorText: "#EEF0F6",
    colorTextPlaceholder: "#98A1B4",
    borderRadius: 10,
    fontFamily: "var(--font-poppins), system-ui, sans-serif",
  },
};

export default antdDarkTheme;
