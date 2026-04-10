"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@dooform/shared/api/client";

/**
 * Returns an object URL for the given preset's stored logo, or null if the
 * preset has no logo. Refetches whenever `presetId` or `logoPath` changes
 * (the latter is used as a cache-busting key so re-uploads refresh the
 * preview immediately). The object URL is revoked on cleanup.
 */
export function useWatermarkLogoUrl(presetId: string | null | undefined, logoPath: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let currentUrl: string | null = null;

    if (!presetId || !logoPath) {
      setUrl(null);
      return;
    }

    apiClient
      .fetchWatermarkLogoBlob(presetId)
      .then((blob) => {
        if (cancelled || !blob) {
          if (!cancelled) setUrl(null);
          return;
        }
        currentUrl = URL.createObjectURL(blob);
        setUrl(currentUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [presetId, logoPath]);

  return url;
}
