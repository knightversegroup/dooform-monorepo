export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'eyebrow';

type ElementType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';

export interface TypographyProps {
  variant?: TypographyVariant;
  as?: ElementType;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-3xl font-bold text-[#262626] md:text-5xl',
  h2: 'text-2xl font-bold text-[#262626] md:text-3xl',
  h3: 'text-xl font-semibold text-[#262626] md:text-2xl',
  h4: 'text-lg font-semibold text-[#262626]',
  'body-lg': 'text-lg text-[#4d4d4d]',
  body: 'text-base text-[#4d4d4d]',
  'body-sm': 'text-sm text-[#737373]',
  eyebrow: 'text-xs font-bold uppercase tracking-[0.3em] text-[#737373]',
};

const defaultElement: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  eyebrow: 'span',
};

export function Typography({
  variant = 'body',
  as,
  className = '',
  children,
}: TypographyProps) {
  const Component = as ?? defaultElement[variant];
  const styles = [variantStyles[variant], className].filter(Boolean).join(' ');

  return <Component className={styles}>{children}</Component>;
}
