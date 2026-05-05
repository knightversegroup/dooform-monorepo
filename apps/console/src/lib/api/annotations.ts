import { apiBaseUrl, http } from './client';
import type {
  AnnotationItem,
  AnnotationsResponse,
  DocumentRecord,
} from './types';

export function getAnnotations(documentId: string) {
  return http.get<AnnotationsResponse>(
    `/v1/documents/${documentId}/annotations`
  );
}

export function saveAnnotations(
  documentId: string,
  data: AnnotationItem[],
  version = 1
) {
  return http.put<AnnotationsResponse>(
    `/v1/documents/${documentId}/annotations`,
    { body: { data, version } }
  );
}

export function finalizeDocument(documentId: string) {
  return http.post<DocumentRecord>(`/v1/documents/${documentId}/finalize`);
}

export function pdfPreviewUrl(documentId: string): string {
  return `${apiBaseUrl}/v1/documents/${documentId}/pdf-preview`;
}
