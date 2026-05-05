// Compatibility shim. Pre-auth, the app stored a "current user" in localStorage and
// consumers throughout the codebase read getCurrentUserId() / getCurrentUserTier() to
// build query keys, key cached state, and pass identity into iframe URLs.
//
// With real auth in place, identity comes from AuthContext. This module exposes the same
// API surface but reads from an in-memory cache that AuthProvider keeps in sync.

import type { AuthUser } from './auth/types';

let cachedUser: AuthUser | null = null;
let listeners: Array<() => void> = [];

export function setAuthUserCache(user: AuthUser | null): void {
  cachedUser = user;
  for (const fn of listeners) fn();
}

export function getCurrentUserId(): string {
  return cachedUser?.id ?? '';
}

export function getCurrentUserTier(): string {
  return cachedUser?.userTier?.toUpperCase() ?? 'FREE';
}

export function subscribeCurrentUser(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((f) => f !== fn);
  };
}

// Legacy exports — kept as no-ops so any stragglers don't crash. Authentication is now
// driven by AuthContext + httpOnly cookies; switching users in dev means logging out.
export function setCurrentUser(_userId: string, _tier?: string): void {
  // no-op
}
