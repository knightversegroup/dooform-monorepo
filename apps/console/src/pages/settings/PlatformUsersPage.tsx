import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';

const PAGE_SIZES = [25, 50, 100, 200];

/**
 * Cross-org user directory. Reads /admin/users with optional org filter +
 * search. Global-admin only (gated at the route level via the route
 * permission guard). Read-only — to change a user's role click through to
 * /settings/iam where the IAM tools live.
 */
export default function PlatformUsersPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(50);

  // Debounce the search input to avoid hammering the API as the admin types.
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 200);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // Reset to the first page when search or org filter changes so the user
  // never lands on an empty page after narrowing the dataset.
  const orgFilter = searchParams.get('organizationId') ?? '';
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, orgFilter]);

  const tenantsQuery = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => authApi.listTenants(),
    enabled: !!user,
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'platform-users', orgFilter, debouncedSearch, page, pageSize],
    queryFn: () =>
      authApi.listPlatformUsers({
        organizationId: orgFilter ? (orgFilter as string | 'none') : undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize,
      }),
    enabled: !!user,
  });

  const tenants = tenantsQuery.data ?? [];
  const result = usersQuery.data;
  const orgName = useMemo(() => {
    if (!orgFilter) return null;
    if (orgFilter === 'none') return 'No organization';
    return tenants.find((t) => t.organizationId === orgFilter)?.name ?? null;
  }, [orgFilter, tenants]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  const updateOrgFilter = (next: string) => {
    const sp = new URLSearchParams(searchParams);
    if (!next) sp.delete('organizationId');
    else sp.set('organizationId', next);
    setSearchParams(sp);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">Platform users</h1>
        <p className="text-[12px] text-ink-muted">
          Every user across every organization. Read-only — to change a role or override
          permissions, open the user in{' '}
          <Link to="/settings/iam" className="text-primary underline">
            IAM
          </Link>
          .
        </p>
      </header>

      {/* Filters */}
      <div className="bg-white border border-border-subtle rounded-lg p-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[11px] text-ink-muted">Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Email, name, or org…"
              className="w-full pl-7 pr-2 py-1 text-sm rounded border border-border-default"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-[11px] text-ink-muted">Organization</label>
          <select
            value={orgFilter}
            onChange={(e) => updateOrgFilter(e.target.value)}
            className="px-2 py-1 text-sm rounded border border-border-default bg-white"
          >
            <option value="">All organizations</option>
            <option value="none">— No organization —</option>
            {tenants.map((t) => (
              <option key={t.organizationId} value={t.organizationId}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[11px] text-ink-muted">Page size</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 text-sm rounded border border-border-default bg-white"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-[12px] text-ink-muted">
          {result ? (
            <>
              {result.total.toLocaleString()} user{result.total === 1 ? '' : 's'}
              {orgName ? ` in ${orgName}` : ''}
            </>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border-subtle rounded-lg overflow-hidden">
        {usersQuery.isLoading ? (
          <div className="p-4 text-[12px] text-ink-muted">Loading…</div>
        ) : usersQuery.isError ? (
          <div className="p-4 text-sm text-red-600">
            {(usersQuery.error as Error)?.message ?? 'Failed to load users.'}
          </div>
        ) : !result || result.data.length === 0 ? (
          <div className="p-4 text-[12px] text-ink-muted">No users match.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Organization</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {result.data.map((u) => (
                <tr key={u.id} className="hover:bg-surface-alt">
                  <td className="px-3 py-2">
                    <div className="font-medium text-ink">{u.displayName || u.email}</div>
                    <div className="text-[11px] text-ink-muted">{u.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    {u.organizationName ? (
                      <button
                        type="button"
                        onClick={() => updateOrgFilter(u.organizationId as string)}
                        className="text-primary hover:underline"
                      >
                        {u.organizationName}
                      </button>
                    ) : (
                      <span className="text-ink-faint italic">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px] uppercase tracking-wide text-ink-muted">
                    {u.role}
                  </td>
                  <td className="px-3 py-2 text-[11px] uppercase tracking-wide text-ink-muted">
                    {u.userTier}
                  </td>
                  <td className="px-3 py-2">
                    {u.emailVerified ? (
                      <span className="text-[11px] text-green-700">verified</span>
                    ) : (
                      <span className="text-[11px] text-amber-700">pending</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`/settings/iam?user=${u.id}`}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Open in IAM
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {result && result.total > result.pageSize ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border-default disabled:opacity-30"
          >
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>
          <span className="text-[11px] text-ink-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border-default disabled:opacity-30"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
