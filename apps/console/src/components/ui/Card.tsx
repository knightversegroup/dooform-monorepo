import { type ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  // Removes inner padding so the body can flush its own table or list.
  flush?: boolean;
}

/**
 * Linear-style content card. Hairline border, no shadow, breathable padding.
 * Optional header row with title/description/actions on the right.
 */
export function Card({
  title,
  description,
  actions,
  children,
  className = '',
  flush,
}: CardProps) {
  return (
    <section
      className={[
        'bg-white border border-border-subtle rounded-lg',
        className,
      ].join(' ')}
    >
      {title || description || actions ? (
        <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border-subtle">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[13px] font-semibold text-ink tracking-tightish truncate">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[12px] text-ink-muted mt-0.5">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-1.5 shrink-0">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </section>
  );
}
