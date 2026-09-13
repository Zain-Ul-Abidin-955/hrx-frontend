import React from "react";

export type DefinitionItem = [label: string, value: React.ReactNode];

/**
 * Label/value grid used wherever AntD `Descriptions bordered` used to be — the
 * bordered variant reads like a spreadsheet; this keeps one hairline box and
 * lets the values carry the weight.
 */
export const DefinitionGrid: React.FC<{
  items: DefinitionItem[];
  className?: string;
}> = ({ items, className = "" }) => (
  <dl
    className={`grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-[#ECEEF3] p-4 sm:grid-cols-3 ${className}`}
  >
    {items.map(([label, value]) => (
      <div key={label} className="min-w-0">
        <dt className="text-[10px] font-medium uppercase tracking-wide text-darkGrayColor">
          {label}
        </dt>
        <dd className="mt-1 truncate text-sm text-blackColor">{value}</dd>
      </div>
    ))}
  </dl>
);

/** A titled block of long-form text (description, requirements, …). */
export const ProseSection: React.FC<{
  heading: string;
  children: React.ReactNode;
}> = ({ heading, children }) => (
  <section className="mt-6">
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-darkGrayColor">
      {heading}
    </h3>
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondaryTextColor">
      {children}
    </div>
  </section>
);

/** Section heading inside a long form, so the fields group visually. */
export const FormSection: React.FC<{
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, hint, children, className = "" }) => (
  <div className={`mb-1 ${className}`}>
    <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b border-[#ECEEF3] pb-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-blackColor">
        {title}
      </span>
      {hint && <span className="text-xs text-darkGrayColor">{hint}</span>}
    </div>
    {children}
  </div>
);
