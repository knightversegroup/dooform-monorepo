import { type ReactNode } from 'react';

type Tone = 'default' | 'muted' | 'info' | 'success' | 'warn' | 'danger' | 'accent';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  // Show a leading status dot. Useful for status pills (Active / Used / Expired etc.).
  dot?: boolean;
  // Render text in uppercase tracking-wide style. Off by default.
  caps?: boolean;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-bg-subtle text-ink-subtle border-border-subtle',
  muted: 'bg-bg-subtle text-ink-muted border-border-subtle',
  info: 'bg-primary-subtle text-primary border-primary/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  accent: 'bg-violet-50 text-violet-700 border-violet-200',
};

const dotClasses: Record<Tone, string> = {
  default: 'bg-ink-faint',
  muted: 'bg-ink-faint',
  info: 'bg-primary',
  success: 'bg-emerald-500',
  warn: 'bg-amber-500',
  danger: 'bg-red-500',
  accent: 'bg-violet-500',
};

/**
 * Tight pill-style label. Replace ad-hoc `text-[10px] uppercase px-2 py-0.5 rounded`
 * patterns scattered through the pages.
 */
export function Badge({
  tone = 'default',
  children,
  className = '',
  dot,
  caps,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5',
        caps ? 'text-[10px] uppercase tracking-wide font-medium' : 'text-[11px] font-medium',
        toneClasses[tone],
        className,
      ].join(' ')}
    >
      {dot ? (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClasses[tone]}`}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
