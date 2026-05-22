import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted text-sm">
        กำลังโหลด…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  // Authenticated but missing required profile data — funnel through onboarding.
  if (user && !user.onboarded && location.pathname !== '/auth/onboarding') {
    return <Navigate to="/auth/onboarding" replace />;
  }

  return <>{children}</>;
}
