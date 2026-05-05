import { http } from './client';

export type TaxonomyKind = 'TYPE' | 'TIER' | 'CATEGORY';

export interface TaxonomyEntry {
  id: string;
  kind: TaxonomyKind;
  code: string;
  label: string;
  description: string | null;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const taxonomyApi = {
  listAll: () => http.get<TaxonomyEntry[]>('/template-taxonomy'),
  listByKind: (kind: TaxonomyKind, includeDisabled = false) =>
    http.get<TaxonomyEntry[]>(`/template-taxonomy/${kind}`, {
      query: includeDisabled ? { includeDisabled: 'true' } : undefined,
    }),
  create: (input: {
    kind: TaxonomyKind;
    code: string;
    label: string;
    description?: string;
    sortOrder?: number;
    enabled?: boolean;
  }) => http.post<TaxonomyEntry>('/template-taxonomy', { body: input }),
  update: (
    id: string,
    input: {
      label?: string;
      description?: string;
      sortOrder?: number;
      enabled?: boolean;
    },
  ) => http.patch<TaxonomyEntry>(`/template-taxonomy/${id}`, { body: input }),
  delete: (id: string) => http.delete<{ ok: boolean }>(`/template-taxonomy/${id}`),
};
