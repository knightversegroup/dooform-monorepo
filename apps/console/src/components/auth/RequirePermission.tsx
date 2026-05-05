import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { useCanFn } from '../../lib/auth/useCan';

/**
 * Wraps a route element. If the current user lacks ALL listed permissions, redirects to
 * `redirectTo` (default `/templates`). If they have ANY one of the keys, the children render.
 *
 *   <RequirePermission anyOf={['templates:update']}>
 *     <TemplateFieldsPage />
 *   </RequirePermission>
 */
export function RequirePermission({
  anyOf,
  redirectTo = '/templates',
  children,
}: {
  anyOf: string[];
  redirectTo?: string;
  children: ReactNode;
}) {
  const { status } = useAuth();
  const can = useCanFn();

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  const allowed = anyOf.some((key) => can(key));
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
