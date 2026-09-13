import React from "react";

/**
 * Card shell for the light dashboard content area.
 *
 * Flat hairline border by default, elevation applied on hover — the `.hrx-card`
 * rules live in globals.css so the same treatment is available to plain
 * elements (stat tiles) that don't need a header.
 */
const Panel: React.FC<{
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** Removes the body padding, for panels whose child is a full-bleed table. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, icon, action, flush = false, className = "", children }) => (
  <section className={`hrx-card flex flex-col ${flush ? "p-0" : "p-5"} ${className}`}>
    {(title || action) && (
      <div
        className={`flex items-center justify-between gap-3 ${
          flush ? "border-b border-[#ECEEF3] px-5 py-4" : "mb-5"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accentColor/10 text-[13px] text-accentDeepColor">
              {icon}
            </span>
          )}
          <h2 className="truncate text-sm font-semibold text-blackColor">
            {title}
          </h2>
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export default Panel;
