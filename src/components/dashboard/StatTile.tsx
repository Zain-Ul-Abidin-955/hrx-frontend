import React from "react";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  /** Optional change chip, e.g. "+12%". Omit when there is no comparison. */
  delta?: string;
  direction?: "up" | "down";
  /** Text beside the delta chip, or on its own when there is no delta. */
  caption?: string;
  /** Optional progress rail under the value (0–100). */
  meter?: number;
}

/**
 * One headline number. The icon chip is the brand accent for every tile — the
 * tiles are not a categorical series, so giving each its own hue would encode
 * nothing.
 */
const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  delta,
  direction = "up",
  caption,
  meter,
}) => (
  <article className="hrx-card p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-darkGrayColor">
        {label}
      </p>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accentColor/10 text-sm text-accentDeepColor">
        {icon}
      </span>
    </div>

    <p className="mt-3 text-[32px] font-semibold leading-none tracking-tight text-blackColor">
      {value}
    </p>

    {meter !== undefined && (
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#ECEEF3]">
        <div
          style={{ width: `${Math.min(100, Math.max(0, meter))}%` }}
          className="h-full rounded-full bg-accentDeepColor"
        />
      </div>
    )}

    {(delta || caption) && (
      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
              direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {direction === "up" ? (
              <ArrowUpOutlined style={{ fontSize: 10 }} />
            ) : (
              <ArrowDownOutlined style={{ fontSize: 10 }} />
            )}
            {delta}
          </span>
        )}
        {caption && (
          <span className="truncate text-darkGrayColor">{caption}</span>
        )}
      </div>
    )}
  </article>
);

export default StatTile;
