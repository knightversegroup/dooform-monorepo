import { http } from './client';

export interface DocumentCommentDto {
  id: string;
  documentId: string;
  userId: string;
  body: string;
  parentId: string | null;
  createdAt?: string;
}

export function listComments(documentId: string) {
  return http.get<{ data: DocumentCommentDto[] }>(
    `/v1/documents/${documentId}/comments`
  );
}

export function createComment(
  documentId: string,
  input: { body: string; parentId?: string | null }
) {
  return http.post<{
    id: string;
    body: string;
    parentId: string | null;
    createdAt: string;
  }>(`/v1/documents/${documentId}/comments`, { body: input });
}

export function deleteComment(documentId: string, commentId: string) {
  return http.delete<{ ok: true }>(
    `/v1/documents/${documentId}/comments/${commentId}`
  );
}
