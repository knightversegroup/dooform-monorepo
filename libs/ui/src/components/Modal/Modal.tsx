'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  /** Whether the modal should be visible. The component manages its own mount
   * lifecycle so the exit animation can finish before the panel unmounts. */
  open: boolean;
  /** Called when the user requests to close (Esc, backdrop click, X button). */
  onClose: () => void;
  /** Modal panel content. The built-in close button is rendered absolutely
   * over the top-right of the panel; pad children accordingly if needed. */
  children: React.ReactNode;
  /** Accessible label for the dialog (read by screen readers). */
  ariaLabel?: string;
  /** Maximum width of the modal panel. Default `'lg'` (≈ max-w-2xl). */
  size?: ModalSize;
  /** Hide the built-in close button if the consumer wants to render its own. */
  hideClose?: boolean;
  /** Aria label for the close button. */
  closeLabel?: string;
}

/* Match the longest exit animation in salespage-preset.css (`modal-exit`). */
const EXIT_MS = 180;

const sizeClass: Record<ModalSize, string> = {
  sm:    'max-w-sm',
  md:    'max-w-md',
  lg:    'max-w-2xl',
  xl:    'max-w-4xl',
  '2xl': 'max-w-5xl',
  full:  'max-w-7xl',
};

/**
 * Modal — accessible dialog with built-in enter/exit animation, body scroll
 * lock, Esc-to-close, and click-outside-to-close. Animations are defined in
 * `libs/ui/src/styles/salespage-preset.css` (classes `animate-fade-in/out`
 * and `animate-modal-enter/exit`); apps consuming this component must
 * include that preset (or define equivalents).
 */
export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
  size = 'lg',
  hideClose = false,
  closeLabel = 'Close',
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  /* Drive the mount/unmount cycle from `open` so callers can stay declarative
   * (`<Modal open={isOpen} ...>`) while exit animations still play. */
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
    return;
  }, [open, mounted]);

  /* Esc-to-close + body scroll lock while the modal is mounted. */
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-sm sm:p-8 ${
        closing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${sizeClass[size]} ${
          closing ? 'animate-modal-exit' : 'animate-modal-enter'
        }`}
      >
        {!hideClose && (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
