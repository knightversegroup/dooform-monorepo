import { http } from './client';

export type ActivityType =
  | 'CREATED'
  | 'SHARED'
  | 'UNSHARED'
  | 'ROLE_CHANGED'
  | 'EDITED'
  | 'COMMENTED'
  | 'STATE_CHANGED'
  | 'SIGNED'
  | 'FINALIZED'
  | 'ARCHIVED';

export interface DocumentActivityDto {
  id: string;
  type: ActivityType;
  userId: string;
  payload: Record<string, unknown>;
  createdAt?: string;
}

export function listActivities(
  documentId: string,
  params: { page?: number; pageSize?: number } = {}
) {
  return http.get<{
    data: DocumentActivityDto[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/v1/documents/${documentId}/activities`, { query: params });
}
