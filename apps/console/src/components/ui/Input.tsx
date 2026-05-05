import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-ink-subtle"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] text-ink',
            'placeholder:text-ink-faint',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {hint && !error ? (
          <span className="text-[11px] text-ink-faint">{hint}</span>
        ) : null}
        {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
