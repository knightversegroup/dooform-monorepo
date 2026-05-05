import { useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Returns whether the current user has a permission. GLOBAL_ADMIN always returns true.
 * Use this to gate UI controls. The backend re-checks on every request, so this is purely
 * a UX layer — never the security boundary.
 *
 *   const canCreate = useCan('templates:create');
 *   {canCreate && <Button>Upload template</Button>}
 */
export function useCan(...keys: string[]): boolean {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return false;
    if (user.role === 'GLOBAL_ADMIN') return true;
    const set = new Set(user.permissions);
    return keys.every((k) => set.has(k));
  }, [user, keys.join('|')]);
}

/** Hook variant returning a checker function — useful when you check many keys in one component. */
export function useCanFn(): (key: string) => boolean {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return () => false;
    if (user.role === 'GLOBAL_ADMIN') return () => true;
    const set = new Set(user.permissions);
    return (key: string) => set.has(key);
  }, [user]);
}
