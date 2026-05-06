import { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'outline'
  | 'outline-primary'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never;
}

interface ButtonAsLink
  extends ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> {
  href: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#2C2585] text-white hover:bg-[#231E6B]',
  secondary: 'bg-[#e4e4e4] text-black hover:bg-[#d4d4d4]',
  dark: 'bg-[#262626] text-white hover:bg-black',
  outline:
    'border-2 border-[#262626] text-[#262626] hover:bg-[#262626] hover:text-white',
  // Console-style outline pill: primary-indigo border + text, soft tint on hover.
  'outline-primary':
    'border-2 border-[#2C2585] text-[#2C2585] hover:bg-[#2C2585]/5',
  ghost: 'bg-[#fcfcfc] text-[#262626] hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  // xs / sm are the dense console-toolbar sizes.
  xs: 'h-7 px-3 text-[12px] font-medium',
  sm: 'h-8 px-3.5 text-[13px] font-medium',
  // md / lg are the salespage hero sizes.
  md: 'px-5 py-2 text-base font-medium',
  lg: 'px-7 py-3 text-base font-medium',
  // Square icon button — same height as `sm`, no horizontal padding.
  icon: 'h-8 w-8 p-0',
};

const baseStyles =
  'inline-flex items-center justify-center gap-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if ('href' in props && props.href) {
      const { href, ...linkProps } = props;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          {...linkProps}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        {...(props as ButtonAsButton)}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
