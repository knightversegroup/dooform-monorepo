/**
 * Public client for the dooform-api `/public/forms` endpoints.
 * No auth — these routes only expose PUBLISHED + GLOBAL templates.
 *
 * Server-side (RSC, generateMetadata, route handlers) hits the API directly via
 * the absolute URL. Client-side hits a same-origin proxy (`/api/dooform/...`)
 * that's rewritten to the API in `next.config.js` — no CORS, no preflight.
 */

const SERVER_BASE_URL =
  process.env.DOOFORM_API_URL ??
  process.env.NEXT_PUBLIC_DOOFORM_API_URL ??
  'http://localhost:3000/api';

const CLIENT_BASE_URL = '/api/dooform';

const isServer = typeof window === 'undefined';

export interface PublicForm {
  id: string;
  name: string;
  displayName?: string | null;
  description?: string | null;
  author?: string | null;
  type: string;
  tier: string;
  category?: string | null;
  pageOrientation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFormsList {
  data: PublicForm[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicFormsStats {
  totalForms: number;
}

export interface ListPublicFormsParams {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

async function request<T>(
  path: string,
  params?: Record<string, unknown>,
  init?: RequestInit,
): Promise<T> {
  const base = isServer ? SERVER_BASE_URL : CLIENT_BASE_URL;
  const url = new URL(
    `${base}${path}`,
    isServer ? undefined : window.location.origin,
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    ...init,
  });
  if (!res.ok) {
    throw new Error(`dooform-api ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function listPublicForms(
  params: ListPublicFormsParams = {},
): Promise<PublicFormsList> {
  return request<PublicFormsList>(
    '/public/forms',
    { ...params } as Record<string, unknown>,
    isServer ? { next: { revalidate: 60 } } : undefined,
  );
}

export function getPublicForm(id: string): Promise<PublicForm> {
  return request<PublicForm>(
    `/public/forms/${id}`,
    undefined,
    isServer ? { next: { revalidate: 60 } } : undefined,
  );
}

export function getPublicFormsStats(): Promise<PublicFormsStats> {
  return request<PublicFormsStats>(
    '/public/forms/stats',
    undefined,
    isServer ? { next: { revalidate: 60 } } : undefined,
  );
}

/**
 * Browser-safe URL for a template thumbnail. Goes through the salespage's
 * same-origin proxy (`/api/dooform/...` → dooform-api) so no CORS is needed
 * and the <img> can be rendered directly.
 */
export function getPublicThumbnailUrl(id: string): string {
  return `${CLIENT_BASE_URL}/public/forms/${id}/thumbnail`;
}
