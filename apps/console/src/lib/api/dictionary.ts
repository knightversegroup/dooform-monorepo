import { http } from './client';
import type {
  DictionaryCollection,
  DictionaryCollectionListResponse,
  DictionaryEntry,
  DictionaryEntryListResponse,
  DictionaryScope,
  DictionaryScopeFilter,
} from './types';

// ---------------- Collections ----------------

export interface ListCollectionsParams {
  scope?: DictionaryScopeFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function listCollections(params: ListCollectionsParams = {}) {
  return http.get<DictionaryCollectionListResponse>('/v1/dictionary/collections', {
    query: params,
  });
}

export function getCollection(id: string) {
  return http.get<DictionaryCollection>(`/v1/dictionary/collections/${id}`);
}

export interface CreateCollectionInput {
  name: string;
  description?: string | null;
  scope: DictionaryScope;
}

export function createCollection(input: CreateCollectionInput) {
  return http.post<DictionaryCollection>('/v1/dictionary/collections', { body: input });
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  scope?: DictionaryScope;
}

export function updateCollection(id: string, input: UpdateCollectionInput) {
  return http.put<DictionaryCollection>(`/v1/dictionary/collections/${id}`, { body: input });
}

export function deleteCollection(id: string) {
  return http.delete<{ success: boolean }>(`/v1/dictionary/collections/${id}`);
}

export function publishCollection(id: string) {
  return http.put<{ id: string; status: string }>(`/v1/dictionary/collections/${id}/publish`);
}

export function unpublishCollection(id: string) {
  return http.put<{ id: string; status: string }>(`/v1/dictionary/collections/${id}/unpublish`);
}

// ---------------- Entries ----------------

export interface ListEntriesParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export function listEntries(collectionId: string, params: ListEntriesParams = {}) {
  return http.get<DictionaryEntryListResponse>(
    `/v1/dictionary/collections/${collectionId}/entries`,
    { query: params },
  );
}

export interface CreateEntryInput {
  term: string;
  termTh?: string | null;
  definition: string;
  definitionTh?: string | null;
  tags?: string[] | null;
}

export function createEntry(collectionId: string, input: CreateEntryInput) {
  return http.post<DictionaryEntry>(
    `/v1/dictionary/collections/${collectionId}/entries`,
    { body: input },
  );
}

export type UpdateEntryInput = Partial<CreateEntryInput>;

export function updateEntry(id: string, input: UpdateEntryInput) {
  return http.put<DictionaryEntry>(`/v1/dictionary/entries/${id}`, { body: input });
}

export function deleteEntry(id: string) {
  return http.delete<{ success: boolean }>(`/v1/dictionary/entries/${id}`);
}
