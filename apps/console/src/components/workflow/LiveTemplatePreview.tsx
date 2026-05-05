import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  getActiveUserId,
  getActiveUserTier,
} from '../../lib/api/client';
import { getPreviewHtmlUrl, getPreviewPdfUrl } from '../../lib/api/templates';
import { ErrorMessage } from '../ui/ErrorMessage';

interface LiveTemplatePreviewProps {
  templateId: string;
  /** Map of placeholder name → current value. Updates re-render the preview. */
  values: Record<string, string>;
  /** Optional: name of the field to highlight in green. */
  hoverField?: string | null;
  /** Whether to show the HTML/PDF tab toggle. Default: true. */
  showTabs?: boolean;
  /** className for the outer wrapper. */
  className?: string;
}

/**
 * Live HTML preview of a template DOCX. The component fetches the rendered HTML once
 * (via `/api/templates/:id/preview`), then on every change to `values` rebuilds the
 * srcdoc with `{{placeholder}}` substrings replaced by `<mark>value</mark>` spans.
 * Used by both the form-fill flow and the document-edit Form data tab.
 */
export function LiveTemplatePreview({
  templateId,
  values,
  hoverField = null,
  showTabs = true,
  className = '',
}: LiveTemplatePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [rawHtml, setRawHtml] = useState<string | null>(null);
  const [htmlError, setHtmlError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    setRawHtml(null);
    setHtmlError(null);
    fetch(getPreviewHtmlUrl(templateId), {
      headers: {
        'x-user-id': getActiveUserId(),
        'x-user-tier': getActiveUserTier(),
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTML preview failed (HTTP ${res.status})`);
        const text = await res.text();
        if (!cancelled) setRawHtml(text);
      })
      .catch((err) => {
        if (!cancelled)
          setHtmlError(err instanceof Error ? err.message : 'Preview failed');
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const deferredValues = useDeferredValue(values);

  const previewHtml = useMemo(() => {
    if (!rawHtml) return null;
    let html = rawHtml.replace(/&#123;/g, '{').replace(/&#125;/g, '}');

    const lookup: Record<string, string> = {};
    for (const [k, v] of Object.entries(deferredValues))
      lookup[k.toLowerCase()] = v ?? '';

    const hoverLower = hoverField?.toLowerCase() ?? null;
    html = html.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, name: string) => {
      const v = lookup[name.toLowerCase()] ?? '';
      const isHover = hoverLower !== null && name.toLowerCase() === hoverLower;
      const safeName = escapeHtml(name);
      const safeValue = escapeHtml(v);
      if (v.length > 0) {
        const style = isHover
          ? 'background-color:#6ee7b7;box-shadow:0 0 0 2px #10b981;color:#064e3b;padding:0 2px;border-radius:2px;font-weight:500;'
          : 'background-color:#fff3a3;padding:0 2px;border-radius:2px;font-weight:500;';
        return `<mark style="${style}" data-ph="${safeName}">${safeValue}</mark>`;
      }
      const style = isHover
        ? 'background-color:#6ee7b7;box-shadow:0 0 0 2px #10b981;color:#064e3b;padding:0 2px;border-radius:2px;'
        : 'background-color:#ffd6d6;color:#b00020;padding:0 2px;border-radius:2px;';
      return `<mark style="${style}" data-ph="${safeName}">{{${safeName}}}</mark>`;
    });

    return html;
  }, [rawHtml, deferredValues, hoverField]);

  return (
    <div className={`flex flex-col bg-surface-alt min-h-[60vh] ${className}`}>
      {showTabs ? (
        <div className="flex items-center gap-1 border-b border-border-default bg-white px-3 py-2">
          <button
            type="button"
            onClick={() => setPreviewMode('html')}
            className={`px-3 py-1 text-xs rounded ${
              previewMode === 'html'
                ? 'bg-primary text-white'
                : 'text-ink-muted hover:bg-surface-alt'
            }`}
          >
            Live HTML
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('pdf')}
            className={`px-3 py-1 text-xs rounded ${
              previewMode === 'pdf'
                ? 'bg-primary text-white'
                : 'text-ink-muted hover:bg-surface-alt'
            }`}
          >
            PDF (template)
          </button>
          <span className="text-[11px] text-ink-muted ml-2">
            HTML updates as you type · PDF shows the unfilled template.
          </span>
        </div>
      ) : null}
      {previewMode === 'html' ? (
        htmlError ? (
          <div className="p-4">
            <ErrorMessage error={htmlError} />
          </div>
        ) : previewHtml ? (
          <iframe
            ref={previewRef}
            srcDoc={previewHtml}
            sandbox="allow-same-origin"
            title="Template preview"
            className="w-full flex-1 min-h-[60vh] bg-white"
          />
        ) : (
          <div className="p-4 text-sm text-ink-muted">Loading HTML preview…</div>
        )
      ) : (
        <iframe
          src={getPreviewPdfUrl(templateId)}
          title="Template preview"
          className="w-full flex-1 min-h-[60vh] bg-white"
        />
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
