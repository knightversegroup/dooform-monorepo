import { getCurrentUserId, getCurrentUserTier } from '../currentUser';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api') as string;

export const apiBaseUrl = API_BASE_URL;

// Deprecated. Pre-auth, identity rode in x-user-id / x-user-tier headers and consumers
// pulled them via these helpers when constructing iframe srcs or hand-rolled fetches.
// Auth is now httpOnly-cookie-driven, so cookies follow naturally as long as the request
// uses credentials:'include'. These remain only because a few iframe-style spots still
// build URLs that legacy admin-debug code reads. They return the current logged-in user.
export const getActiveUserId = (): string => getCurrentUserId();
export const getActiveUserTier = (): string => getCurrentUserTier();

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  query?: Record<string, QueryValue> | { [key: string]: QueryValue };
  body?: unknown;
  formData?: FormData;
  responseType?: 'json' | 'blob' | 'text';
  signal?: AbortSignal;
  headers?: Record<string, string>;
  // Internal: skip auto-refresh-on-401 to prevent loops on /auth/* endpoints.
  skipAuthRefresh?: boolean;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export function buildAssetUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// One-flight refresh: if multiple parallel requests 401 simultaneously, dedupe the refresh call.
let pendingRefresh: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Allow next refresh after this resolves.
      setTimeout(() => {
        pendingRefresh = null;
      }, 0);
    }
  })();
  return pendingRefresh;
}

// Listeners notified when a global auth failure (refresh failed) happens. The AuthProvider
// subscribes so it can flip status -> unauthenticated and trigger a redirect.
type UnauthorizedHandler = () => void;
const unauthorizedHandlers = new Set<UnauthorizedHandler>();

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function notifyUnauthorized() {
  for (const fn of unauthorizedHandlers) fn();
}

async function rawFetch(
  method: string,
  path: string,
  options: RequestOptions,
): Promise<Response> {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined && options.body !== null) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  return fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
    signal: options.signal,
  });
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await rawFetch(method, path, options);

  if (res.status === 401 && !options.skipAuthRefresh && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawFetch(method, path, options);
    } else {
      notifyUnauthorized();
    }
  }

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      try {
        payload = await res.text();
      } catch {
        // ignore
      }
    }
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : null) ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  const responseType = options.responseType ?? 'json';
  if (responseType === 'blob') return (await res.blob()) as T;
  if (responseType === 'text') return (await res.text()) as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>('PUT', path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
