import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save, Users } from 'lucide-react';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

function formatBytes(n: number): string {
  if (n >= GB) return `${(n / GB).toFixed(2)} GB`;
  if (n >= MB) return `${(n / MB).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function parseQuotaInputGB(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'unlimited') return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return NaN as unknown as number; // sentinel for invalid
  return Math.floor(num * GB);
}

export default function TenantsAdminPage() {
  const qc = useQueryClient();
  const tenantsQuery = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => authApi.listTenants(),
  });

  const setQuotaMutation = useMutation({
    mutationFn: ({ id, quotaBytes }: { id: string; quotaBytes: number | null }) =>
      authApi.setTenantQuota(id, quotaBytes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }),
  });

  const recomputeMutation = useMutation({
    mutationFn: (id: string) => authApi.recomputeTenantUsage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }),
  });

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (tenantsQuery.isLoading) {
    return <div className="p-6 text-[12px] text-ink-muted">Loading tenants…</div>;
  }
  if (tenantsQuery.isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        {tenantsQuery.error instanceof ApiError
          ? tenantsQuery.error.message
          : 'Failed to load tenants.'}
      </div>
    );
  }

  const tenants = tenantsQuery.data ?? [];

  const totalUsed = tenants.reduce((sum, t) => sum + t.usedBytes, 0);
  const totalQuota = tenants.reduce(
    (sum, t) => (t.quotaBytes == null ? sum : sum + t.quotaBytes),
    0,
  );

  const onSave = (id: string) => {
    const raw = drafts[id];
    if (raw === undefined) return;
    const parsed = parseQuotaInputGB(raw);
    if (Number.isNaN(parsed as unknown as number)) {
      setErrors((e) => ({ ...e, [id]: 'Enter a non-negative number of GB, or "unlimited".' }));
      return;
    }
    setErrors((e) => ({ ...e, [id]: '' }));
    setQuotaMutation.mutate(
      { id, quotaBytes: parsed },
      {
        onSuccess: () => {
          setDrafts((d) => {
            const next = { ...d };
            delete next[id];
            return next;
          });
        },
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">Tenants & storage</h1>
        <p className="text-[12px] text-ink-muted">
          Every organization gets its own storage namespace. Set per-tenant quotas to cap usage.
          Leave the field blank or type "unlimited" to remove the cap.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border-subtle rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Tenants</div>
          <div className="text-2xl font-semibold text-ink mt-1">{tenants.length}</div>
        </div>
        <div className="bg-white border border-border-subtle rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Total used</div>
          <div className="text-2xl font-semibold text-ink mt-1">{formatBytes(totalUsed)}</div>
        </div>
        <div className="bg-white border border-border-subtle rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Total quota</div>
          <div className="text-2xl font-semibold text-ink mt-1">
            {totalQuota > 0 ? formatBytes(totalQuota) : '—'}
          </div>
        </div>
      </div>

      {tenants.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-lg p-6 text-[12px] text-ink-muted">
          No tenants yet. Tenants are created when a user signs up and starts a new
          organization. Once they exist, set per-tenant storage quotas here.
        </div>
      ) : null}

      <div className="bg-white border border-border-subtle rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Members</th>
              <th className="py-3 px-4">Used</th>
              <th className="py-3 px-4">Quota</th>
              <th className="py-3 px-4">Usage</th>
              <th className="py-3 px-4 text-right">Set quota (GB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {tenants.map((t) => {
              const draft = drafts[t.organizationId];
              const placeholder =
                t.quotaBytes == null ? 'unlimited' : (t.quotaBytes / GB).toFixed(2);
              return (
                <tr key={t.organizationId}>
                  <td className="py-3 px-4">
                    <div className="font-medium text-ink">{t.name}</div>
                    <div className="text-xs text-ink-muted">{t.slug}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/settings/platform-users?organizationId=${t.organizationId}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {t.memberCount ?? 0}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-ink-muted">
                    <div className="flex items-center gap-2">
                      <span>{formatBytes(t.usedBytes)}</span>
                      <button
                        onClick={() => recomputeMutation.mutate(t.organizationId)}
                        disabled={recomputeMutation.isPending}
                        title="Recompute from storage backend"
                        className="text-ink-muted hover:text-primary disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            recomputeMutation.isPending &&
                            recomputeMutation.variables === t.organizationId
                              ? 'animate-spin'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-ink-muted">
                    {t.quotaBytes == null ? 'Unlimited' : formatBytes(t.quotaBytes)}
                  </td>
                  <td className="py-3 px-4 w-48">
                    {t.quotaBytes == null ? (
                      <span className="text-xs text-ink-muted">—</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="h-2 bg-surface-alt rounded">
                          <div
                            className={`h-2 rounded ${
                              (t.percentUsed ?? 0) > 90
                                ? 'bg-red-500'
                                : (t.percentUsed ?? 0) > 75
                                  ? 'bg-amber-500'
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, t.percentUsed ?? 0)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-ink-muted">
                          {(t.percentUsed ?? 0).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        value={draft ?? ''}
                        placeholder={placeholder}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [t.organizationId]: e.target.value }))
                        }
                        className="w-32 px-2 py-1 text-xs border border-border-subtle rounded text-right"
                      />
                      <button
                        onClick={() => onSave(t.organizationId)}
                        disabled={setQuotaMutation.isPending || draft === undefined}
                        className="px-3 py-1.5 rounded bg-primary text-white text-xs hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                    {errors[t.organizationId] ? (
                      <div className="text-[11px] text-red-600 text-right mt-1">
                        {errors[t.organizationId]}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
