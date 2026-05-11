/**
 * Salespage typography design system.
 *
 * Variants encode size + line-height + default weight + default tone.
 * Tone colors map to CSS vars in `libs/ui/src/styles/salespage-preset.css`.
 *
 * To enforce the system, raw `text-{size}` / `font-{weight}` / `leading-*` /
 * `tracking-*` Tailwind utilities are banned in `apps/salespage` via ESLint.
 * Use this component (or extend it here) instead of inlining type styles.
 */

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'lead'
  | 'body-lg' // alias of lead, kept for backwards compatibility
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'micro'
  | 'eyebrow'
  | 'overline'
  | 'label'
  | 'quote'
  | 'mono';

export type TypographyTone =
  | 'heading'
  | 'body'
  | 'muted'
  | 'inverse'
  | 'inverse-muted'
  | 'brand'
  | 'inherit';

export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TypographyAlign = 'left' | 'center' | 'right';

type ElementType =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div' | 'label' | 'blockquote' | 'code'
  | 'dt' | 'dd' | 'li';

export interface TypographyProps {
  variant?: TypographyVariant;
  as?: ElementType;
  tone?: TypographyTone;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  className?: string;
  children: React.ReactNode;
}

/* Size + line-height + default weight per variant.
 * Mobile-first; `md:` step bumps for larger viewports where appropriate. */
const variantSize: Record<TypographyVariant, string> = {
  display:   'text-4xl leading-tight md:text-5xl lg:text-6xl',
  h1:        'text-3xl leading-tight md:text-4xl lg:text-5xl',
  h2:        'text-2xl leading-tight md:text-3xl lg:text-4xl',
  h3:        'text-xl leading-snug md:text-2xl',
  h4:        'text-lg leading-snug md:text-xl',
  h5:        'text-base leading-snug md:text-lg',
  lead:      'text-base leading-relaxed md:text-lg',
  'body-lg': 'text-base leading-relaxed md:text-lg',
  body:      'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  caption:   'text-xs leading-normal',
  micro:     'text-[10px] leading-normal',
  eyebrow:   'text-xs uppercase tracking-[0.3em]',
  overline:  'text-xs uppercase tracking-wider',
  label:     'text-xs leading-normal',
  quote:     'text-lg italic leading-relaxed md:text-xl',
  mono:      'font-mono text-sm tracking-widest',
};

const defaultWeight: Record<TypographyVariant, TypographyWeight> = {
  display:   'bold',
  h1:        'bold',
  h2:        'bold',
  h3:        'semibold',
  h4:        'semibold',
  h5:        'semibold',
  lead:      'regular',
  'body-lg': 'regular',
  body:      'regular',
  'body-sm': 'regular',
  caption:   'regular',
  micro:     'medium',
  eyebrow:   'semibold',
  overline:  'medium',
  label:     'semibold',
  quote:     'regular',
  mono:      'regular',
};

const defaultTone: Record<TypographyVariant, TypographyTone> = {
  display:   'heading',
  h1:        'heading',
  h2:        'heading',
  h3:        'heading',
  h4:        'heading',
  h5:        'heading',
  lead:      'muted',
  'body-lg': 'muted',
  body:      'body',
  'body-sm': 'muted',
  caption:   'muted',
  micro:     'muted',
  eyebrow:   'muted',
  overline:  'muted',
  label:     'heading',
  quote:     'body',
  mono:      'heading',
};

const defaultElement: Record<TypographyVariant, ElementType> = {
  display:   'h1',
  h1:        'h1',
  h2:        'h2',
  h3:        'h3',
  h4:        'h4',
  h5:        'h5',
  lead:      'p',
  'body-lg': 'p',
  body:      'p',
  'body-sm': 'p',
  caption:   'p',
  micro:     'span',
  eyebrow:   'span',
  overline:  'span',
  label:     'label',
  quote:     'blockquote',
  mono:      'code',
};

const weightClass: Record<TypographyWeight, string> = {
  regular:  'font-normal',
  medium:   'font-medium',
  semibold: 'font-semibold',
  bold:     'font-bold',
};

const toneClass: Record<TypographyTone, string> = {
  heading:        'text-[color:var(--ui-text-heading)]',
  body:           'text-[color:var(--ui-text-body)]',
  muted:          'text-[color:var(--ui-text-muted)]',
  inverse:        'text-white',
  'inverse-muted':'text-white/60',
  brand:          'text-[color:var(--ui-brand-primary)]',
  inherit:        '',
};

const alignClass: Record<TypographyAlign, string> = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};

export function Typography({
  variant = 'body',
  as,
  tone,
  weight,
  align,
  className = '',
  children,
}: TypographyProps) {
  const Component = as ?? defaultElement[variant];
  const resolvedTone = tone ?? defaultTone[variant];
  const resolvedWeight = weight ?? defaultWeight[variant];

  const styles = [
    variantSize[variant],
    weightClass[resolvedWeight],
    toneClass[resolvedTone],
    align && alignClass[align],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={styles}>{children}</Component>;
}
