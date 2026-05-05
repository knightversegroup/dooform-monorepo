import { http } from './client';

export type ShareRole = 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

export interface DocumentShareDto {
  id: string;
  documentId: string;
  userId: string;
  role: ShareRole;
  grantedBy: string;
  createdAt?: string;
}

export function listShares(documentId: string) {
  return http.get<{ data: DocumentShareDto[] }>(
    `/v1/documents/${documentId}/shares`
  );
}

export function createShare(
  documentId: string,
  input: { userId: string; role: ShareRole }
) {
  return http.post<{ id: string; documentId: string; userId: string; role: ShareRole }>(
    `/v1/documents/${documentId}/shares`,
    { body: input }
  );
}

export function updateShare(
  documentId: string,
  shareId: string,
  input: { role: ShareRole }
) {
  return http.put<{ id: string; role: ShareRole }>(
    `/v1/documents/${documentId}/shares/${shareId}`,
    { body: input }
  ) as unknown as Promise<{ id: string; role: ShareRole }>;
}

export function deleteShare(documentId: string, shareId: string) {
  return http.delete<{ ok: true }>(
    `/v1/documents/${documentId}/shares/${shareId}`
  );
}
