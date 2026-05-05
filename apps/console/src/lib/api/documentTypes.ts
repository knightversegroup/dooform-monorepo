import { http } from './client';
import type {
  DocumentType,
  DocumentTypeTemplatesResponse,
  DocumentTypesResponse,
} from './types';

export function listDocumentTypes() {
  return http.get<DocumentTypesResponse>('/document-types');
}

export function getDocumentType(id: string) {
  return http.get<DocumentType>(`/document-types/${id}`);
}

export function getDocumentTypeByCode(code: string) {
  return http.get<DocumentType>(`/document-types/code/${encodeURIComponent(code)}`);
}

export function listDocumentTypeCategories() {
  return http.get<{ categories: string[] }>('/document-types/categories');
}

export function listDocumentTypeTemplates(id: string) {
  return http.get<DocumentTypeTemplatesResponse>(`/document-types/${id}/templates`);
}
