import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-ink-muted mb-4">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/templates" className="text-primary underline">
        Go to Templates
      </Link>
    </div>
  );
}
