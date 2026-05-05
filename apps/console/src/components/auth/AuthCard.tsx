import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary text-white text-[13px] font-semibold flex items-center justify-center">
              D
            </div>
            <span className="text-[14px] font-semibold text-ink">Dooform</span>
          </Link>
        </div>
        <div className="bg-white border border-border-subtle rounded-lg p-6">
          <h1 className="text-[16px] font-semibold text-ink tracking-tightish">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[12px] text-ink-muted mt-1">{subtitle}</p>
          ) : null}
          <div className="mt-5">{children}</div>
        </div>
        {footer ? (
          <div className="mt-4 text-center text-[12px] text-ink-muted">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

// Shared form-control class strings for the auth pages. Updated to match the new
// Input/Button primitives so existing JSX keeps working without rewriting every page.
export const inputClass =
  'w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary';
export const labelClass = 'block text-[12px] font-medium text-ink-subtle mb-1';
export const primaryBtn =
  'w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed';
export const secondaryBtn =
  'w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] font-medium text-ink-subtle hover:bg-bg-subtle hover:text-ink';
