import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-bg-subtle text-ink hover:bg-bg-muted border border-border-subtle disabled:opacity-50',
  outline:
    'border border-border-default bg-white text-ink hover:bg-bg-subtle disabled:opacity-50',
  ghost:
    'text-ink-subtle hover:bg-bg-subtle hover:text-ink disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-1 text-[12px]',
  md: 'px-2.5 py-1.5 text-[13px]',
  lg: 'px-3.5 py-2 text-[14px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...rest }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-white',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
