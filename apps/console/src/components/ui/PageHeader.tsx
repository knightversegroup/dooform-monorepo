import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

/**
 * Slim Linear-style page header. Title is small/medium weight, sits inline with
 * actions. The optional description sits below in muted text. Breadcrumbs go on top
 * as an "eyebrow" line.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="border-b border-border-subtle px-6 py-3 bg-white">
      {breadcrumbs ? (
        <div className="text-[11px] text-ink-faint mb-1">{breadcrumbs}</div>
      ) : null}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-ink tracking-tightish truncate">
            {title}
          </h1>
          {description ? (
            <p className="text-[12px] text-ink-muted mt-0.5">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-1.5 shrink-0">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
