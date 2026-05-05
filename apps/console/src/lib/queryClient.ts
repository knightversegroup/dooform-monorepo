import { QueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from './currentUser';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Every user-scoped query key includes the active user id so React Query partitions
// its cache per identity. Without this, switching users in the user-switcher would
// briefly re-render the previous user's results (and pollute the cache) until the
// invalidation-driven refetch lands.
const u = () => getCurrentUserId();

export const queryKeys = {
  templates: {
    all: ['templates'] as const,
    list: (params: Record<string, unknown> = {}) =>
      ['templates', 'list', params] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
    placeholders: (id: string) => ['templates', id, 'placeholders'] as const,
    fieldDefinitions: (id: string) =>
      ['templates', id, 'field-definitions'] as const,
  },
  documentTypes: {
    all: ['document-types'] as const,
    list: () => ['document-types', 'list'] as const,
    detail: (id: string) => ['document-types', 'detail', id] as const,
    templates: (id: string) => ['document-types', id, 'templates'] as const,
    categories: () => ['document-types', 'categories'] as const,
  },
  documents: {
    all: ['documents'] as const,
    detail: (id: string) => ['documents', 'detail', id, u()] as const,
    history: (params: Record<string, unknown> = {}) =>
      ['documents', 'history', u(), params] as const,
    annotations: (id: string) => ['documents', id, 'annotations', u()] as const,
  },
  watermarks: {
    all: ['watermark-presets'] as const,
    list: () => ['watermark-presets', 'list', u()] as const,
    detail: (id: string) => ['watermark-presets', 'detail', id, u()] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => ['users', 'list'] as const,
    me: () => ['users', 'me', u()] as const,
  },
  shares: {
    forDocument: (documentId: string) =>
      ['shares', documentId, u()] as const,
  },
  comments: {
    forDocument: (documentId: string) =>
      ['comments', documentId, u()] as const,
  },
  activities: {
    forDocument: (documentId: string) =>
      ['activities', documentId, u()] as const,
  },
  signatures: {
    forDocument: (documentId: string) =>
      ['signatures', documentId, u()] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: Record<string, unknown> = {}) =>
      ['notifications', 'list', u(), params] as const,
  },
  dataTypes: {
    all: ['data-types'] as const,
    list: () => ['data-types', 'list'] as const,
  },
  dictionary: {
    all: ['dictionary'] as const,
    collections: (params: Record<string, unknown> = {}) =>
      ['dictionary', 'collections', u(), params] as const,
    collection: (id: string) => ['dictionary', 'collection', id, u()] as const,
    entries: (collectionId: string, params: Record<string, unknown> = {}) =>
      ['dictionary', 'collection', collectionId, 'entries', u(), params] as const,
  },
};
