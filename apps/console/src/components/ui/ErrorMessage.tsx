interface ErrorMessageProps {
  error: unknown;
  className?: string;
}

export function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null;
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  return (
    <div
      role="alert"
      className={[
        'rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
        className,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
