import { apiBaseUrl, http } from './client';
import type {
  DocumentFormat,
  DocumentHistoryResponse,
  DocumentRecord,
} from './types';

export function processTemplate(
  templateId: string,
  data: Record<string, string>,
  options: { file?: File; filename?: string } = {}
) {
  const { file, filename } = options;
  if (file) {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('data', JSON.stringify(data));
    if (filename) formData.append('filename', filename);
    return http.post<DocumentRecord>(`/v1/templates/${templateId}/process`, {
      formData,
    });
  }
  return http.post<DocumentRecord>(`/v1/templates/${templateId}/process`, {
    body: { data, filename },
  });
}

export function getDocument(id: string) {
  return http.get<DocumentRecord>(`/v1/documents/${id}`);
}

/**
 * Stable, browser-cacheable URL for the document's already-generated PDF.
 * The endpoint streams the saved file inline (no regeneration) so an <iframe>
 * pointing at this URL renders without re-rendering on every visit. Auth flows
 * via the existing httpOnly cookie because the iframe is same-origin.
 */
export function getDocumentPreviewPdfUrl(id: string): string {
  return `${apiBaseUrl}/v1/documents/${id}/preview.pdf`;
}

export interface DownloadOptions {
  format: DocumentFormat;
  watermarkPresetId?: string;
}

export async function downloadDocument(
  id: string,
  { format, watermarkPresetId }: DownloadOptions
): Promise<Blob> {
  return http.get<Blob>(`/v1/documents/${id}/download`, {
    query: {
      format,
      watermark_preset_id: watermarkPresetId,
    },
    responseType: 'blob',
  });
}

export function deleteDocument(id: string) {
  return http.delete<void>(`/v1/documents/${id}`);
}

/** Rename a document in place (does NOT spawn a new document). */
export function renameDocument(id: string, filename: string) {
  return http.patch<{ id: string; filename: string }>(
    `/v1/documents/${id}`,
    { body: { filename } },
  );
}

export interface HistoryParams {
  page?: number;
  pageSize?: number;
  scope?: 'owned' | 'shared' | 'all';
  lifecycleStatus?: string | string[];
}

export function getHistory(params: HistoryParams = {}) {
  const lifecycle = Array.isArray(params.lifecycleStatus)
    ? params.lifecycleStatus.join(',')
    : params.lifecycleStatus;
  return http.get<DocumentHistoryResponse>('/v1/documents/history', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      scope: params.scope,
      lifecycleStatus: lifecycle,
    },
  });
}

export function regenerateDocument(
  id: string,
  options: { data?: Record<string, string>; filename?: string } = {}
) {
  const body =
    options.data || options.filename
      ? { data: options.data, filename: options.filename }
      : undefined;
  return http.post<DocumentRecord>(`/v1/documents/${id}/regenerate`, {
    body,
  });
}
