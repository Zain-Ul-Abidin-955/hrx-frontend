"use client";

import React from "react";
import { LoadingOutlined } from "@ant-design/icons";

interface AuthSubmitButtonProps {
  loading?: boolean;
  loadingLabel: string;
  children: React.ReactNode;
}

const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  loading = false,
  loadingLabel,
  children,
}) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accentColor text-sm font-medium text-white transition-colors hover:bg-accentDeepColor disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? (
      <>
        <LoadingOutlined />
        {loadingLabel}
      </>
    ) : (
      children
    )}
  </button>
);

export default AuthSubmitButton;
