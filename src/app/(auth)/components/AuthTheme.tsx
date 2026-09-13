"use client";

import React from "react";
import { ConfigProvider } from "antd";
import antdDarkTheme from "@/lib/antdDarkTheme";

const AuthTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider theme={antdDarkTheme}>{children}</ConfigProvider>
);

export default AuthTheme;
