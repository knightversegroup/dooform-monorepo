export type BadgeVariant = 'default' | 'brand' | 'muted';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[#f5f5f5] text-[#262626]',
  brand:
    'bg-[#2c2585]/10 text-[#2c2585]',
  muted:
    'bg-[#f5f5f5] text-[#737373]',
};

const baseStyles =
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium';

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const styles = [baseStyles, variantStyles[variant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={styles}>{children}</span>;
}
