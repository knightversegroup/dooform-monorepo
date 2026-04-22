import Link from 'next/link';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  primary:
    'bg-[#2c2585] text-white hover:bg-[#231e6b]',
  secondary:
    'bg-[#e4e4e4] text-black hover:bg-[#d4d4d4]',
  dark:
    'bg-[#262626] text-white hover:bg-black',
  outline:
    'border border-[#262626] text-[#262626] hover:bg-[#262626] hover:text-white',
  ghost:
    'bg-[#fcfcfc] text-[#262626] hover:bg-gray-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm font-medium',
  md: 'px-5 py-2 text-base font-medium',
  lg: 'px-7 py-3 text-base font-medium',
};

const baseStyles =
  'inline-flex items-center justify-center rounded-full transition-colors';

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
    ref
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
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          {...linkProps}
        >
          {children}
        </Link>
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
  }
);

Button.displayName = 'Button';
