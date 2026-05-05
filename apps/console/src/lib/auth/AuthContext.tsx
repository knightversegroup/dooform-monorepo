import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, onUnauthorized } from '../api/client';
import { setAuthUserCache } from '../currentUser';
import { authApi } from './api';
import type { AuthUser, LoginPayload, RegisterPayload } from './types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: Status;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const refetchMe = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authenticated');
      return me;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setStatus('unauthenticated');
        return null;
      }
      // Other errors leave us unauthenticated as well — safer default.
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => {
    void refetchMe();
  }, [refetchMe]);

  // Keep the legacy currentUser shim in sync.
  useEffect(() => {
    setAuthUserCache(user);
  }, [user]);

  // Listen for global 401s after a failed refresh — flip to unauthenticated so the
  // ProtectedRoute can redirect to /auth/login.
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  // Refresh user (and effective permissions) when the tab regains focus. This is how the
  // sidebar / button gates pick up role-permission changes pushed by an admin without
  // requiring the user to log out and back in.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const onFocus = () => {
      void refetchMe();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [status, refetchMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    const me = await authApi.login(payload);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const me = await authApi.register(payload);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    }
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refetchMe, setUser }),
    [user, status, login, register, logout, refetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
