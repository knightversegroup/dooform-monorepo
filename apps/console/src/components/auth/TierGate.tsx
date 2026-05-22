import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight } from 'lucide-react';
import { useCapability, useTierLimit } from '../../lib/auth/useCapability';
import { useAuth } from '../../lib/auth/AuthContext';
import type { UserTier } from '../../lib/auth/types';

interface BaseProps {
  /** Where the upgrade CTA navigates. Defaults to /settings/organization (tier picker). */
  upgradeHref?: string;
  /** Override the lock message. Default surfaces the required tier name. */
  message?: ReactNode;
  /** What to render when blocked. Defaults to a disabled-clone of `children` with a tooltip + upgrade link. */
  fallback?: ReactNode;
  children: ReactNode;
}

interface CapabilityGateProps extends BaseProps {
  capability: string;
  limit?: undefined;
}

interface LimitGateProps extends BaseProps {
  limit: string;
  /** Current count for the limit (e.g. forms.length). Required for limit-based gating. */
  current: number;
  capability?: undefined;
}

type TierGateProps = CapabilityGateProps | LimitGateProps;

const TIER_LABEL: Record<UserTier, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  advance: 'Advance',
  enterprise: 'Enterprise',
};

/**
 * Renders `children` when the org's tier permits the gated feature; otherwise
 * renders the same children disabled, wrapped in a tooltip with an upgrade CTA.
 *
 * Two modes:
 *  - `capability`: binary feature flag (e.g. PDF editor).
 *  - `limit` + `current`: numeric cap (e.g. max forms, max members). Blocks
 *    when `current >= cap`.
 *
 * Server-side guards (CapabilityGuard, assertWithinLimit) are the security
 * boundary — this component is UX sugar so users see why a button is locked
 * before clicking it.
 */
export function TierGate(props: TierGateProps) {
  const { user } = useAuth();
  const isCapabilityGate = 'capability' in props && typeof props.capability === 'string';
  const capability = isCapabilityGate ? props.capability! : undefined;
  const limit = !isCapabilityGate ? (props as LimitGateProps).limit : undefined;
  const current = !isCapabilityGate ? (props as LimitGateProps).current : undefined;

  const hasCapability = useCapability(capability ?? '');
  const limitState = useTierLimit(limit ?? '', current);

  const allowed = isCapabilityGate ? hasCapability : !limitState.exceeded;
  if (allowed) {
    return <>{props.children}</>;
  }

  if (props.fallback !== undefined) {
    return <>{props.fallback}</>;
  }

  const currentTier = user?.tier?.label ?? TIER_LABEL[user?.userTier ?? 'free'];
  const reason = isCapabilityGate
    ? `ฟีเจอร์นี้ต้องใช้แผนที่สูงกว่าแผนปัจจุบัน (${currentTier})`
    : `คุณใช้งานครบโควต้าของแผน ${currentTier} แล้ว (${limitState.current}/${limitState.cap})`;
  const tooltip = props.message ?? reason;

  return (
    <span
      className="relative inline-flex items-center group"
      title={typeof tooltip === 'string' ? tooltip : undefined}
    >
      <span className="opacity-50 pointer-events-none inline-flex">
        {isValidElement(props.children)
          ? cloneElement(props.children as ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>, {
              disabled: true,
              'aria-disabled': true,
            })
          : props.children}
      </span>
      <Link
        to={props.upgradeHref ?? '/settings/organization'}
        className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
        title="อัปเกรดแผน"
      >
        <Lock className="w-3 h-3" />
        อัปเกรด
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </span>
  );
}
