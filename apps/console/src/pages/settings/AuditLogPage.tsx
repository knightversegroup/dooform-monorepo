import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { authApi } from '../../lib/auth/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { ApiError } from '../../lib/api/client';

const PAGE_SIZE = 50;

// Human-readable labels for the most common action keys. Anything not in this map
// falls back to a prettified version of the auto-derived key.
const ACTION_LABELS: Record<string, { label: string; category: string }> = {
  'auth.register': { label: 'Registered account', category: 'Auth' },
  'auth.login': { label: 'Logged in', category: 'Auth' },
  'auth.logout': { label: 'Logged out', category: 'Auth' },
  'auth.password.change': { label: 'Changed password', category: 'Auth' },
  'organization.member.role_change': { label: 'Changed member role', category: 'Organization' },
  'organization.member.remove': { label: 'Removed member', category: 'Organization' },
  'organization.invite.create': { label: 'Created invite code', category: 'Organization' },
  'templates.create': { label: 'Created template', category: 'Templates' },
  'templates.update': { label: 'Updated template', category: 'Templates' },
  'templates.delete': { label: 'Deleted template', category: 'Templates' },
  'documents.create': { label: 'Created document', category: 'Documents' },
  'documents.update': { label: 'Updated document', category: 'Documents' },
  'documents.delete': { label: 'Deleted document', category: 'Documents' },
};

function categorize(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action].category;
  if (action.startsWith('auth.')) return 'Auth';
  if (action.startsWith('organization.')) return 'Organization';
  if (action.startsWith('templates.')) return 'Templates';
  if (action.startsWith('documents.')) return 'Documents';
  if (action.startsWith('admin.')) return 'Platform';
  if (action.includes('watermark')) return 'Watermarks';
  return 'Other';
}

function prettyAction(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action].label;
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/[_-]/g, ' '))
    .join(' › ');
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function escapeCsv(value: unknown): string {
  if (value == null) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function AuditLogPage() {
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const params = useMemo(
    () => ({
      action: actionFilter || undefined,
      outcome: outcomeFilter || undefined,
      organizationId: isGlobalAdmin && orgFilter ? orgFilter : undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [actionFilter, outcomeFilter, orgFilter, from, to, page, isGlobalAdmin],
  );

  const logsQuery = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => authApi.listAuditLogs(params),
    refetchInterval: 30_000,
  });

  const rows = logsQuery.data?.data ?? [];
  const total = logsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Client-side actor filter — backend doesn't support actor email substring search.
  // Acceptable since admins typically narrow by date/action first.
  const filteredRows = useMemo(() => {
    if (!actorFilter.trim()) return rows;
    const needle = actorFilter.toLowerCase().trim();
    return rows.filter(
      (r) =>
        (r.actorEmail ?? '').toLowerCase().includes(needle) ||
        (r.actorUserId ?? '').toLowerCase().includes(needle),
    );
  }, [rows, actorFilter]);

  // Page-level summary stats. For full-history aggregates we'd add a /audit-logs/stats
  // endpoint; current-page numbers are still useful for compliance review.
  const stats = useMemo(() => {
    const successes = rows.filter((r) => r.outcome === 'success').length;
    const failures = rows.filter((r) => r.outcome === 'failure').length;
    const uniqueActors = new Set(
      rows.map((r) => r.actorUserId ?? r.actorEmail).filter(Boolean),
    ).size;
    const last24h = rows.filter(
      (r) => Date.now() - new Date(r.createdAt).getTime() < 24 * 3_600_000,
    ).length;
    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      const cat = categorize(r.action);
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }
    return { successes, failures, uniqueActors, last24h, byCategory };
  }, [rows]);

  const downloadCsv = () => {
    const header = [
      'createdAt',
      'organizationId',
      'actorEmail',
      'actorUserId',
      'actorRole',
      'action',
      'category',
      'resourceType',
      'resourceId',
      'outcome',
      'ip',
      'userAgent',
      'metadata',
    ].join(',');
    const lines = filteredRows.map((r) =>
      [
        r.createdAt,
        r.organizationId ?? '',
        r.actorEmail ?? '',
        r.actorUserId ?? '',
        r.actorRole ?? '',
        r.action,
        categorize(r.action),
        r.resourceType ?? '',
        r.resourceId ?? '',
        r.outcome,
        r.ip ?? '',
        r.userAgent ?? '',
        r.metadata ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    );
    const blob = new Blob([header + '\n' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold text-ink tracking-tightish">Audit log</h1>
          <p className="text-[12px] text-ink-muted">
            {isGlobalAdmin
              ? 'Compliance trail across every tenant. Click any row to expand the full details.'
              : 'Compliance trail for your organization. Click any row to expand the full details.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => logsQuery.refetch()}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-border-subtle hover:border-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={downloadCsv}
            disabled={filteredRows.length === 0}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          icon={Clock}
          label="Total events"
          value={total.toLocaleString()}
          hint={`${filteredRows.length} on this page`}
        />
        <StatCard
          icon={CircleCheck}
          label="Successful"
          value={stats.successes.toLocaleString()}
          tone="ok"
        />
        <StatCard
          icon={CircleX}
          label="Failures"
          value={stats.failures.toLocaleString()}
          tone={stats.failures > 0 ? 'warn' : undefined}
        />
        <StatCard
          icon={Users}
          label="Unique actors"
          value={stats.uniqueActors.toLocaleString()}
          hint="on this page"
        />
        <StatCard
          icon={AlertTriangle}
          label="Last 24h"
          value={stats.last24h.toLocaleString()}
          hint="on this page"
        />
      </div>

      {/* Category breakdown */}
      {Object.keys(stats.byCategory).length > 0 ? (
        <div className="bg-white border border-border-subtle rounded-lg p-3 flex flex-wrap gap-2 text-xs">
          <span className="text-ink-muted self-center">Categories on this page:</span>
          {Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, n]) => (
              <span key={cat} className="px-2 py-0.5 rounded bg-surface-alt text-ink-subtle">
                {cat} <span className="font-semibold text-ink">{n}</span>
              </span>
            ))}
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white border border-border-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-ink-muted uppercase tracking-wide">
          <Filter className="w-3.5 h-3.5" /> Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div>
            <label className="block text-xs text-ink-muted mb-1">Action key</label>
            <input
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              placeholder="auth.login"
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Actor (email/uid)</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-7 pr-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
            >
              <option value="">Any</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">From</label>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">To</label>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
            />
          </div>
          {isGlobalAdmin ? (
            <div>
              <label className="block text-xs text-ink-muted mb-1">Tenant id</label>
              <input
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setPage(0);
                }}
                placeholder="all tenants"
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </div>
          ) : null}
        </div>
      </div>

      {logsQuery.isError ? (
        <div className="text-sm text-red-600">
          {logsQuery.error instanceof ApiError
            ? logsQuery.error.message
            : 'Failed to load audit log.'}
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white border border-border-subtle rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="py-2 px-3 w-6"></th>
              <th className="py-2 px-3">When</th>
              <th className="py-2 px-3">Who</th>
              <th className="py-2 px-3">Action</th>
              <th className="py-2 px-3">Resource</th>
              <th className="py-2 px-3">Outcome</th>
              {isGlobalAdmin ? <th className="py-2 px-3">Tenant</th> : null}
              <th className="py-2 px-3">Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {logsQuery.isLoading ? (
              <tr>
                <td className="py-3 px-4 text-ink-muted text-sm" colSpan={isGlobalAdmin ? 8 : 7}>
                  Loading…
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td
                  className="py-6 px-4 text-center text-ink-muted text-sm"
                  colSpan={isGlobalAdmin ? 8 : 7}
                >
                  No events match the filters.
                </td>
              </tr>
            ) : (
              filteredRows.flatMap((log) => {
                const isOpen = expanded[log.id];
                const cat = categorize(log.action);
                const out: ReactNode[] = [
                  <tr
                    key={log.id}
                    className={`align-top hover:bg-surface-alt/50 cursor-pointer ${
                      isOpen ? 'bg-surface-alt/40' : ''
                    }`}
                    onClick={() => setExpanded((e) => ({ ...e, [log.id]: !e[log.id] }))}
                  >
                    <td className="py-2 px-3">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-ink-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-ink-muted" />
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs text-ink-muted whitespace-nowrap">
                      <div>{relativeTime(log.createdAt)}</div>
                      <div className="text-[10px] opacity-60">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-ink">{log.actorEmail ?? '—'}</div>
                      {log.actorRole ? (
                        <div className="text-[10px] uppercase text-ink-muted">{log.actorRole}</div>
                      ) : null}
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-ink">{prettyAction(log.action)}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-alt text-ink-subtle">
                          {cat}
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-ink-muted">
                      {log.resourceType ? (
                        <>
                          <span className="font-medium text-ink">{log.resourceType}</span>
                          {log.resourceId ? (
                            <span className="block text-[10px] font-mono opacity-70 truncate max-w-[180px]">
                              {log.resourceId}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] uppercase px-1.5 py-0.5 rounded ${
                          log.outcome === 'failure'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {log.outcome === 'failure' ? (
                          <CircleX className="w-3 h-3" />
                        ) : (
                          <CircleCheck className="w-3 h-3" />
                        )}
                        {log.outcome}
                      </span>
                    </td>
                    {isGlobalAdmin ? (
                      <td className="py-2 px-3 text-[10px] font-mono text-ink-muted">
                        {log.organizationId ?? '—'}
                      </td>
                    ) : null}
                    <td className="py-2 px-3 text-[10px] font-mono text-ink-muted whitespace-nowrap">
                      {log.ip ?? '—'}
                    </td>
                  </tr>,
                ];
                if (isOpen) {
                  out.push(
                    <tr key={`${log.id}-detail`} className="bg-surface-alt/20">
                      <td colSpan={isGlobalAdmin ? 8 : 7} className="py-3 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DetailBlock title="Event">
                            <DetailRow label="Event id" value={log.id} mono />
                            <DetailRow
                              label="Timestamp"
                              value={`${new Date(log.createdAt).toLocaleString()} (${relativeTime(log.createdAt)})`}
                            />
                            <DetailRow label="Action" value={log.action} mono />
                            <DetailRow label="Category" value={cat} />
                            <DetailRow label="Outcome" value={log.outcome} />
                          </DetailBlock>
                          <DetailBlock title="Actor">
                            <DetailRow label="Email" value={log.actorEmail ?? '—'} />
                            <DetailRow label="User id" value={log.actorUserId ?? '—'} mono />
                            <DetailRow label="Role" value={log.actorRole ?? '—'} />
                            <DetailRow label="Tenant id" value={log.organizationId ?? '—'} mono />
                          </DetailBlock>
                          <DetailBlock title="Resource">
                            <DetailRow label="Type" value={log.resourceType ?? '—'} />
                            <DetailRow label="Id" value={log.resourceId ?? '—'} mono />
                          </DetailBlock>
                          <DetailBlock title="Origin">
                            <DetailRow label="IP" value={log.ip ?? '—'} mono />
                            <DetailRow label="User agent" value={log.userAgent ?? '—'} wrap />
                          </DetailBlock>
                          {log.metadata ? (
                            <div className="md:col-span-2">
                              <div className="text-xs uppercase tracking-wide text-ink-muted mb-1">
                                Request details
                              </div>
                              <pre className="text-[11px] whitespace-pre-wrap break-all bg-white border border-border-subtle p-3 rounded font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>,
                  );
                }
                return out;
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <div>
          Page {page + 1} of {totalPages} • {total.toLocaleString()} total events
          {actorFilter ? ` • ${filteredRows.length} match actor filter` : ''}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-border-subtle rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1 border border-border-subtle rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone?: 'ok' | 'warn';
}) {
  const toneClass =
    tone === 'warn' ? 'text-red-600' : tone === 'ok' ? 'text-green-600' : 'text-ink';
  return (
    <div className="bg-white border border-border-subtle rounded-lg p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-muted">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className={`text-2xl font-semibold mt-1 ${toneClass}`}>{value}</div>
      {hint ? <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div> : null}
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-border-subtle rounded p-3">
      <div className="text-xs uppercase tracking-wide text-ink-muted mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 text-xs items-baseline">
      <div className="text-ink-muted">{label}</div>
      <div
        className={`text-ink ${mono ? 'font-mono text-[11px]' : ''} ${
          wrap ? 'break-all' : 'truncate'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
