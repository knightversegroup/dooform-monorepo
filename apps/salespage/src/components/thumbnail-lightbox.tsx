'use client';

import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { getPublicThumbnailUrl } from '../lib/dooform-api';

export function ThumbnailLightbox({
  id,
  alt,
  label = 'ดูตัวอย่าง',
}: {
  id: string;
  alt: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white/90 px-6 py-3 text-sm font-medium text-neutral-900 backdrop-blur transition hover:bg-white"
      >
        <Eye className="h-4 w-4" />
        {label}
      </button>
      {/* aria-label handled below */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            aria-label="ปิดตัวอย่าง"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <img
              src={getPublicThumbnailUrl(id)}
              alt={alt}
              className="block max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
