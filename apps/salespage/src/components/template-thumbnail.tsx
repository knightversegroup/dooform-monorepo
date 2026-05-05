'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { getPublicThumbnailUrl } from '../lib/dooform-api';

type Variant = 'card' | 'detail';

export function TemplateThumbnail({
  id,
  alt,
  variant = 'card',
  className,
}: {
  id: string;
  alt: string;
  variant?: Variant;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <ThumbnailFallback variant={variant} className={className} />;
  }

  return (
    <img
      src={getPublicThumbnailUrl(id)}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      className={className}
    />
  );
}

export function ThumbnailFallback({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  if (variant === 'detail') {
    return (
      <div className={className}>
        <div className="absolute inset-6 rounded-2xl border border-neutral-200 bg-white shadow-md">
          <div className="flex items-center gap-1.5 border-b border-neutral-100 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-neutral-200" />
            <span className="h-2 w-2 rounded-full bg-neutral-200" />
            <span className="h-2 w-2 rounded-full bg-neutral-200" />
          </div>
          <div className="space-y-3 p-6">
            <div className="h-3 w-2/3 rounded bg-neutral-200" />
            <div className="h-2.5 w-full rounded bg-neutral-100" />
            <div className="h-2.5 w-5/6 rounded bg-neutral-100" />
            <div className="h-2.5 w-4/6 rounded bg-neutral-100" />
            <div className="mt-6 h-2.5 w-1/3 rounded bg-neutral-200" />
            <div className="h-2.5 w-full rounded bg-neutral-100" />
            <div className="h-2.5 w-5/6 rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-50">
      <FileText className="h-8 w-8 text-neutral-300" />
    </div>
  );
}
