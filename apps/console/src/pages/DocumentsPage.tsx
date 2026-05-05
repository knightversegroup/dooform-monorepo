import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHistory } from '../lib/api/documents';
import { stripDocxExtension } from '../lib/filename';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoader } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import {
  LIFECYCLE_ORDER,
  type LifecycleStatus,
} from '../lib/api/lifecycle';

const PAGE_SIZE = 20;

type Scope = 'all' | 'owned' | 'shared';

export default function DocumentsPage() {
  const [scope, setScope] = useState<Scope>('all');
  const [lifecycle, setLifecycle] = useState<LifecycleStatus | ''>('');
  const [page, setPage] = useState(1);

  // The API treats `page` as 0-indexed (`skip = page * pageSize`); the UI is 1-indexed.
  const params = useMemo(
    () => ({
      page: page - 1,
      pageSize: PAGE_SIZE,
      scope,
      lifecycleStatus: lifecycle || undefined,
    }),
    [page, scope, lifecycle]
  );

  const historyQuery = useQuery({
    queryKey: queryKeys.documents.history(params),
    queryFn: () => getHistory(params),
  });

  const total = historyQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Documents you own or that have been shared with you."
      />
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 border-b border-border-subtle">
        <ScopeTabs value={scope} onChange={(s) => { setScope(s); setPage(1); }} />
        <div className="md:ml-auto flex items-center gap-2">
          <span className="text-xs text-ink-muted">Lifecycle:</span>
          <select
            value={lifecycle}
            onChange={(e) => {
              setLifecycle(e.target.value as LifecycleStatus | '');
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-md border border-border-subtle bg-white text-sm"
          >
            <option value="">All states</option>
            {LIFECYCLE_ORDER.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <section className="px-6 py-6 space-y-4">
        {historyQuery.isLoading ? <PageLoader /> : null}
        {historyQuery.error ? <ErrorMessage error={historyQuery.error} /> : null}

        {historyQuery.data?.data?.length ? (
          <div className="overflow-x-auto rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt text-ink-muted text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Document</th>
                  <th className="px-4 py-2 font-medium">Lifecycle</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {historyQuery.data.data.map((doc) => (
                  <tr key={doc.id} className="border-t border-border-subtle hover:bg-surface-alt/50">
                    <td className="px-4 py-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {stripDocxExtension(doc.filename ?? '') || doc.templateId}
                      </Link>
                      <div className="text-xs text-ink-muted truncate">{doc.id}</div>
                    </td>
                    <td className="px-4 py-2">
                      <LifecycleBadge status={doc.lifecycleStatus ?? 'DRAFT'} />
                    </td>
                    <td className="px-4 py-2 text-ink-muted">
                      {doc.ownerUserId ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-ink-muted">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !historyQuery.isLoading ? (
          <p className="text-sm text-ink-muted">No documents yet.</p>
        ) : null}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ScopeTabs({
  value,
  onChange,
}: {
  value: Scope;
  onChange: (s: Scope) => void;
}) {
  const tabs: { value: Scope; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'owned', label: 'My documents' },
    { value: 'shared', label: 'Shared with me' },
  ];
  return (
    <div className="inline-flex rounded-md border border-border-subtle overflow-hidden">
      {tabs.map((t, i) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            value === t.value
              ? 'bg-primary text-white'
              : 'bg-white text-ink-subtle hover:bg-surface-alt'
          } ${i > 0 ? 'border-l border-border-subtle' : ''}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function LifecycleBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    IN_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    SIGNED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-gray-200 text-gray-500',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
