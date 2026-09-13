"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface AuthFormCardProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  /** Optional link rendered under the form, e.g. "Back to sign in". */
  footer?: React.ReactNode;
  /** Small link above the title, used to step back in a flow. */
  back?: { href: string; label: string };
}

/** Shared chrome for every screen in the auth flow. */
const AuthFormCard: React.FC<AuthFormCardProps> = ({
  title,
  subtitle,
  children,
  footer,
  back,
}) => {
  return (
    <div className="w-full">
      <Link
        href={back?.href ?? "/"}
        className="mb-10 inline-flex items-center gap-2 text-sm text-mutedColor transition-colors hover:text-lightColor"
      >
        <ArrowLeftOutlined className="text-xs" />
        {back?.label ?? "Back to home"}
      </Link>

      <h1 className="text-[1.75rem] font-semibold tracking-tight text-lightColor">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mutedColor">{subtitle}</p>

      <div className="mt-8">{children}</div>

      {footer && (
        <div className="mt-7 text-center text-sm text-mutedColor">{footer}</div>
      )}
    </div>
  );
};

export default AuthFormCard;
