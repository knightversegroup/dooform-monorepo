import { type ReactNode } from 'react';

interface KbdProps {
  children: ReactNode;
  className?: string;
}

/** Keyboard-shortcut chip. Linear-style monospace pill. */
export function Kbd({ children, className = '' }: KbdProps) {
  return (
    <kbd
      className={[
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
        'rounded text-[10px] font-mono font-medium text-ink-muted',
        'bg-bg-subtle border border-border-subtle',
        className,
      ].join(' ')}
    >
      {children}
    </kbd>
  );
}
