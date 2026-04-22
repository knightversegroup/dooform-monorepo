export type CardRounded = 'xl' | '2xl' | '3xl';
export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  rounded?: CardRounded;
  padding?: CardPadding;
  border?: boolean;
  shadow?: boolean;
  className?: string;
}

const roundedStyles: Record<CardRounded, string> = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  rounded = '2xl',
  padding = 'md',
  border = true,
  shadow = false,
  className = '',
}: CardProps) {
  const styles = [
    'bg-white',
    roundedStyles[rounded],
    paddingStyles[padding],
    border ? 'border border-[#e7e7e7]' : '',
    shadow ? 'shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={styles}>{children}</div>;
}
