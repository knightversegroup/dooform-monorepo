import { useCallback, useEffect, useRef, useState } from 'react';
import { generateLivePdfPreview } from '../../lib/api/templates';
import { ErrorMessage } from '../ui/ErrorMessage';

interface LiveTemplatePreviewProps {
  templateId: string;
  /** Map of placeholder name → current value. Updates re-render the preview. */
  values: Record<string, string>;
  /** className for the outer wrapper. */
  className?: string;
}

/**
 * Live PDF preview of a template DOCX with filled placeholder values.
 * On every change to `values` (debounced), calls the API to generate a new PDF.
 */
export function LiveTemplatePreview({
  templateId,
  values,
  className = '',
}: LiveTemplatePreviewProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfBlobUrlRef = useRef<string | null>(null);

  const generatePdf = useCallback(async () => {
    if (!templateId) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const blob = await generateLivePdfPreview(templateId, values);
      // Revoke old URL to prevent memory leaks
      if (pdfBlobUrlRef.current) URL.revokeObjectURL(pdfBlobUrlRef.current);
      const newUrl = URL.createObjectURL(blob);
      pdfBlobUrlRef.current = newUrl;
      setPdfBlobUrl(newUrl);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'สร้าง PDF ไม่สำเร็จ');
    } finally {
      setPdfLoading(false);
    }
  }, [templateId, values]);

  // Debounced PDF generation when values change
  useEffect(() => {
    if (!templateId) return;

    // Clear any pending debounce
    if (pdfDebounceRef.current) {
      clearTimeout(pdfDebounceRef.current);
    }

    // Debounce PDF generation by 600ms
    pdfDebounceRef.current = setTimeout(() => {
      generatePdf();
    }, 600);

    return () => {
      if (pdfDebounceRef.current) {
        clearTimeout(pdfDebounceRef.current);
      }
    };
  }, [templateId, values, generatePdf]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrlRef.current) URL.revokeObjectURL(pdfBlobUrlRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col bg-surface-alt min-h-[60vh] ${className}`}>
      <div className="flex items-center gap-1 border-b border-border-default bg-white px-3 py-2">
        <span className="text-xs font-medium text-ink-default">ตัวอย่าง PDF</span>
        <span className="text-[11px] text-ink-muted ml-2">
          {pdfLoading ? 'กำลังสร้าง PDF...' : 'อัปเดตหลังหยุดพิมพ์ ~0.6s'}
        </span>
      </div>
      {pdfError ? (
        <div className="p-4">
          <ErrorMessage error={pdfError} />
        </div>
      ) : pdfLoading && !pdfBlobUrl ? (
        <div className="flex items-center justify-center flex-1 min-h-[60vh] bg-white">
          <div className="text-sm text-ink-muted">กำลังสร้าง PDF...</div>
        </div>
      ) : pdfBlobUrl ? (
        <iframe
          src={pdfBlobUrl}
          title="PDF preview"
          className="w-full flex-1 min-h-[60vh] bg-white"
        />
      ) : (
        <div className="flex items-center justify-center flex-1 min-h-[60vh] bg-white">
          <div className="text-sm text-ink-muted">กำลังโหลด...</div>
        </div>
      )}
    </div>
  );
}
