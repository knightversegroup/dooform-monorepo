'use client';

import { useContext, useMemo } from 'react';
import { AuthContext } from './context';
import type { QuotaInfo, UserTierName, TierCapabilities, MonthlyUsage } from './types';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useQuota(): {
  quota: QuotaInfo | undefined;
  hasQuota: boolean;
  remaining: number;
  refreshQuota: () => Promise<void>;
} {
  const { user, refreshQuota } = useAuth();

  return useMemo(() => ({
    quota: user?.quota,
    hasQuota: (user?.quota?.total ?? 0) > 0,
    remaining: user?.quota?.remaining ?? 0,
    refreshQuota,
  }), [user?.quota, refreshQuota]);
}

export function useTier(): {
  tierName: UserTierName;
  capabilities: TierCapabilities | undefined;
  canDownloadDocx: boolean;
  canAccessTemplate: (templateTier: string) => boolean;
  hasPdfEditor: boolean;
  monthlyUsage: MonthlyUsage | null;
  refreshTier: () => Promise<void>;
} {
  const { user, userTier, canDownloadDocx, canAccessTemplate, hasPdfEditor, monthlyUsage, refreshTier } = useAuth();

  return useMemo(() => ({
    tierName: userTier,
    capabilities: user?.tier?.capabilities,
    canDownloadDocx,
    canAccessTemplate,
    hasPdfEditor,
    monthlyUsage,
    refreshTier,
  }), [user?.tier?.capabilities, userTier, canDownloadDocx, canAccessTemplate, hasPdfEditor, monthlyUsage, refreshTier]);
}
