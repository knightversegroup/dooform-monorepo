import { useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Returns whether the current user's org has the given capability. Unlike
 * `useCan` (which checks role-based permissions), this checks the *subscription
 * tier*'s entitlements. Use it to render upgrade prompts when a feature is
 * gated by plan rather than role.
 *
 *   const hasEditor = useCapability('feature:pdf_editor');
 *   <TierGate capability="feature:pdf_editor">
 *     <Button onClick={openEditor}>เปิดเครื่องมือแก้ไข PDF</Button>
 *   </TierGate>
 *
 * GLOBAL_ADMIN does NOT auto-pass — admins on a free org should still see the
 * same gating their org sees, otherwise demoing tier upgrades from inside the
 * product is impossible.
 */
export function useCapability(capability: string): boolean {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user?.tier) return false;
    return user.tier.capabilities.includes(capability);
  }, [user, capability]);
}

/** Hook variant returning a checker function — useful when you check many capabilities in one component. */
export function useCapabilityFn(): (capability: string) => boolean {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user?.tier) return () => false;
    const set = new Set(user.tier.capabilities);
    return (key: string) => set.has(key);
  }, [user]);
}

/**
 * Resolves a numeric tier limit (e.g. 'limit:max_forms') plus the optional
 * current count the caller provides. `cap` is the configured maximum (null =
 * unlimited); `remaining` is `cap - current`; `exceeded` is true when adding
 * one more would push past `cap`.
 */
export function useTierLimit(
  limit: string,
  current?: number,
): {
  cap: number | null;
  current: number | undefined;
  remaining: number | null;
  exceeded: boolean;
} {
  const { user } = useAuth();
  return useMemo(() => {
    const cap = user?.tier?.limits?.[limit] ?? null;
    if (cap === null) {
      return { cap: null, current, remaining: null, exceeded: false };
    }
    if (current === undefined) {
      return { cap, current: undefined, remaining: cap, exceeded: false };
    }
    return {
      cap,
      current,
      remaining: Math.max(0, cap - current),
      exceeded: current >= cap,
    };
  }, [user, limit, current]);
}
