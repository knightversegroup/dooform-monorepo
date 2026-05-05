export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={[
        'inline-block w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin',
        className,
      ].join(' ')}
      role="status"
      aria-label="loading"
    />
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-ink-muted">
      <Spinner className="text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
