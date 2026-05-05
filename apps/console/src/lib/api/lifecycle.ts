import { http } from './client';

export type LifecycleStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SIGNED'
  | 'ARCHIVED';

export const LIFECYCLE_ORDER: LifecycleStatus[] = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'SIGNED',
  'ARCHIVED',
];

export function transitionLifecycle(
  documentId: string,
  to: LifecycleStatus,
  note?: string
) {
  return http.post<{ id: string; lifecycleStatus: LifecycleStatus; ownerUserId: string }>(
    `/v1/documents/${documentId}/transition`,
    { body: { to, note } }
  );
}
