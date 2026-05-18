import { apiBaseUrl, http } from './client';
import type {
  FieldDefinition,
  FieldDefinitionsResponse,
  PlaceholdersResponse,
  Template,
  TemplatesListResponse,
} from './types';

export interface CreateTemplateInput {
  file: File;
  name: string;
  displayName?: string;
  description?: string;
  author?: string;
  type?: string;
  tier?: string;
  category?: string;
  pageOrientation?: 'PORTRAIT' | 'LANDSCAPE';
  visibility?: 'ORGANIZATION' | 'GLOBAL';
  htmlFile?: File;
}

export function createTemplate(input: CreateTemplateInput) {
  const formData = new FormData();
  formData.append('template', input.file);
  formData.append('name', input.name);
  if (input.displayName) formData.append('displayName', input.displayName);
  if (input.description) formData.append('description', input.description);
  if (input.author) formData.append('author', input.author);
  if (input.type) formData.append('type', input.type);
  if (input.tier) formData.append('tier', input.tier);
  if (input.category) formData.append('category', input.category);
  if (input.pageOrientation)
    formData.append('pageOrientation', input.pageOrientation);
  if (input.visibility) formData.append('visibility', input.visibility);
  if (input.htmlFile) formData.append('htmlPreview', input.htmlFile);
  return http.post<Template>('/templates', { formData });
}

export interface UpdateTemplateInput {
  displayName?: string;
  description?: string;
  author?: string;
  type?: string;
  tier?: string;
  visibility?: 'ORGANIZATION' | 'GLOBAL';
  category?: string;
  pageOrientation?: 'PORTRAIT' | 'LANDSCAPE';
  remarks?: string;
}

export function updateTemplate(id: string, input: UpdateTemplateInput) {
  return http.put<Template>(`/templates/${id}`, { body: input });
}

export function publishTemplate(id: string) {
  return http.put<Template>(`/templates/${id}/publish`);
}

export function unpublishTemplate(id: string) {
  return http.put<Template>(`/templates/${id}/unpublish`);
}

export function archiveTemplate(id: string) {
  return http.put<Template>(`/templates/${id}/archive`);
}

export function deleteTemplate(id: string) {
  return http.delete<void>(`/templates/${id}`);
}

export function replaceTemplateFile(id: string, file: File) {
  const formData = new FormData();
  formData.append('template', file);
  return http.post<Template>(`/templates/${id}/files`, { formData });
}

export function replaceTemplateHtml(id: string, htmlFile: File) {
  const formData = new FormData();
  formData.append('htmlPreview', htmlFile);
  return http.post<{ id: string; filePathHTML: string | null; updatedAt: string }>(
    `/templates/${id}/preview-html`,
    { formData }
  );
}

export interface ListTemplatesParams {
  status?: string;
  type?: string;
  tier?: string;
  category?: string;
  search?: string;
  documentTypeId?: string;
  page?: number;
  pageSize?: number;
  grouped?: boolean;
}

export function listTemplates(params: ListTemplatesParams = {}) {
  return http.get<TemplatesListResponse>('/templates', {
    query: { ...params },
  });
}

export function getTemplate(id: string) {
  return http.get<Template>(`/templates/${id}`);
}

export function getPlaceholders(id: string) {
  return http.get<PlaceholdersResponse>(`/templates/${id}/placeholders`);
}

export function getFieldDefinitions(id: string) {
  return http.get<FieldDefinitionsResponse>(`/templates/${id}/field-definitions`);
}

export function regenerateFieldDefinitions(id: string) {
  return http.post<FieldDefinitionsResponse>(
    `/templates/${id}/field-definitions/regenerate`
  );
}

export function updateFieldDefinitions(id: string, fieldDefinitions: FieldDefinition[]) {
  return http.put<FieldDefinitionsResponse>(`/templates/${id}/field-definitions`, {
    body: { fieldDefinitions },
  });
}

export function getPreviewHtmlUrl(id: string): string {
  return `${apiBaseUrl}/templates/${id}/preview`;
}

export function getPreviewPdfUrl(id: string): string {
  return `${apiBaseUrl}/templates/${id}/preview/pdf`;
}

export function getThumbnailUrl(id: string): string {
  return `${apiBaseUrl}/templates/${id}/thumbnail`;
}
