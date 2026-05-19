import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  KeyRound,
  Ban,
  CheckCircle2,
  RotateCcw,
  X,
} from 'lucide-react';

import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import type { UserRole } from '../../lib/auth/types';

interface PlatformUserRow {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  userTier: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  onboardedAt: string | null;
}

const PAGE_SIZES = [25, 50, 100, 200];

/**
 * Cross-org user directory. Reads /admin/users with optional org filter +
 * search. Global-admin only (gated at the route level via the route
 * permission guard). Read-only — to change a user's role click through to
 * /settings/iam where the IAM tools live.
 */
export default function PlatformUsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
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

  const [editing, setEditing] = useState<PlatformUserRow | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'platform-users'] });
    qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      userId,
      patch,
      newRole,
    }: {
      userId: string;
      patch: Parameters<typeof authApi.adminUpdateUser>[1];
      newRole?: UserRole;
    }) => {
      // Role is a separate endpoint because it has its own permission gate
      // (users:assign-role / users:assign-global-admin) and synchronizes the
      // legacy users.role column with role_assignments via the backend.
      const hasOtherFields = Object.keys(patch).length > 0;
      if (hasOtherFields) {
        await authApi.adminUpdateUser(userId, patch);
      }
      if (newRole) {
        await authApi.setUserRole(userId, newRole);
      }
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setFeedback({ kind: 'ok', text: 'User updated.' });
    },
    onError: (err: Error) => setFeedback({ kind: 'err', text: err.message }),
  });

  const activeMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      authApi.adminSetUserActive(userId, isActive),
    onSuccess: (_, vars) => {
      invalidate();
      setFeedback({
        kind: 'ok',
        text: vars.isActive ? 'User reactivated.' : 'User deactivated and signed out.',
      });
    },
    onError: (err: Error) => setFeedback({ kind: 'err', text: err.message }),
  });

  const resetMutation = useMutation({
    mutationFn: (userId: string) => authApi.adminResetUserPassword(userId),
    onSuccess: (data) => {
      setFeedback({
        kind: 'ok',
        text: data.tokenForDev
          ? `Reset link sent to ${data.sentTo} (dev token: ${data.tokenForDev})`
          : `Reset link sent to ${data.sentTo}.`,
      });
    },
    onError: (err: Error) => setFeedback({ kind: 'err', text: err.message }),
  });

  const resetIamMutation = useMutation({
    mutationFn: (userId: string) => authApi.resetUserIam(userId),
    onSuccess: (data) => {
      invalidate();
      setFeedback({
        kind: 'ok',
        text: `IAM reset to ${data.role}. Removed ${data.assignments} role assignment(s) and ${data.overrides} permission override(s).`,
      });
    },
    onError: (err: Error) => setFeedback({ kind: 'err', text: err.message }),
  });

  // Auto-clear non-error feedback after a short delay so it doesn't linger.
  useEffect(() => {
    if (!feedback || feedback.kind !== 'ok') return;
    const t = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(t);
  }, [feedback]);

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
          Every user across every organization. Edit profile fields, send password resets, or
          deactivate accounts here. To change a role or override permissions, open the user in{' '}
          <Link to="/settings/iam" className="text-primary underline">
            IAM
          </Link>
          .
        </p>
      </header>

      {feedback ? (
        <div
          className={`rounded border px-3 py-2 text-[12px] flex items-start justify-between gap-3 ${
            feedback.kind === 'ok'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}

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
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
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
                    <div className="flex flex-col gap-0.5">
                      {u.isActive ? (
                        <span className="text-[11px] text-green-700">active</span>
                      ) : (
                        <span className="text-[11px] text-red-600">inactive</span>
                      )}
                      {u.emailVerified ? (
                        <span className="text-[10px] text-ink-muted">email verified</span>
                      ) : (
                        <span className="text-[10px] text-amber-700">email pending</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(u as PlatformUserRow)}
                        title="Edit profile"
                        className="p-1 text-ink-muted hover:text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Send a password reset link to ${u.email}? Their active sessions will be signed out.`,
                            )
                          ) {
                            resetMutation.mutate(u.id);
                          }
                        }}
                        disabled={resetMutation.isPending}
                        title="Send password reset email"
                        className="p-1 text-ink-muted hover:text-primary disabled:opacity-40"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      {u.isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              u.id === user?.id
                            ) {
                              setFeedback({
                                kind: 'err',
                                text: 'Cannot deactivate yourself.',
                              });
                              return;
                            }
                            if (
                              confirm(
                                `Deactivate ${u.email}? They will be signed out and unable to log in until reactivated.`,
                              )
                            ) {
                              activeMutation.mutate({ userId: u.id, isActive: false });
                            }
                          }}
                          disabled={activeMutation.isPending}
                          title="Deactivate user"
                          className="p-1 text-ink-muted hover:text-red-600 disabled:opacity-40"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => activeMutation.mutate({ userId: u.id, isActive: true })}
                          disabled={activeMutation.isPending}
                          title="Reactivate user"
                          className="p-1 text-ink-muted hover:text-green-700 disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Reset IAM for ${u.email}? This drops every role assignment beyond their primary role and clears all permission overrides.`,
                            )
                          ) {
                            resetIamMutation.mutate(u.id);
                          }
                        }}
                        disabled={resetIamMutation.isPending}
                        title="Reset IAM to primary role default"
                        className="p-1 text-ink-muted hover:text-red-600 disabled:opacity-40"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/settings/iam?user=${u.id}`}
                        className="ml-1 text-[11px] text-primary hover:underline"
                      >
                        IAM
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing ? (
        <EditUserDialog
          user={editing}
          tenants={tenants}
          submitting={updateMutation.isPending}
          error={updateMutation.error ? (updateMutation.error as Error).message : null}
          selfUserId={user?.id ?? null}
          onCancel={() => setEditing(null)}
          onSubmit={(patch, newRole) =>
            updateMutation.mutate({ userId: editing.id, patch, newRole })
          }
        />
      ) : null}

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

const ROLE_OPTIONS: UserRole[] = ['USER', 'ORG_ADMIN', 'GLOBAL_ADMIN'];
const ROLE_LABEL: Record<UserRole, string> = {
  USER: 'Member',
  ORG_ADMIN: 'Org Admin',
  GLOBAL_ADMIN: 'Global Admin',
};

function EditUserDialog({
  user,
  tenants,
  submitting,
  error,
  selfUserId,
  onCancel,
  onSubmit,
}: {
  user: PlatformUserRow;
  tenants: Array<{ organizationId: string; name: string }>;
  submitting: boolean;
  error: string | null;
  selfUserId: string | null;
  onCancel: () => void;
  onSubmit: (
    patch: {
      displayName?: string;
      email?: string;
      jobTitle?: string | null;
      organizationId?: string | null;
      emailVerified?: boolean;
      userTier?: string;
    },
    newRole?: UserRole,
  ) => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [orgId, setOrgId] = useState<string>(user.organizationId ?? '');
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [userTier, setUserTier] = useState<string>(user.userTier);
  const [role, setRole] = useState<UserRole>(user.role);

  const isSelf = selfUserId === user.id;

  // Build the diff so we don't ship unchanged fields.
  const submit = () => {
    const patch: {
      displayName?: string;
      email?: string;
      jobTitle?: string | null;
      organizationId?: string | null;
      emailVerified?: boolean;
      userTier?: string;
    } = {};
    if (displayName.trim() && displayName.trim() !== user.displayName) {
      patch.displayName = displayName.trim();
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail && normalizedEmail !== user.email) patch.email = normalizedEmail;
    const currentOrg = user.organizationId ?? '';
    if (orgId !== currentOrg) patch.organizationId = orgId === '' ? null : orgId;
    if (emailVerified !== user.emailVerified) patch.emailVerified = emailVerified;
    if (userTier !== user.userTier) patch.userTier = userTier;
    const newRole = role !== user.role ? role : undefined;
    if (Object.keys(patch).length === 0 && !newRole) {
      onCancel();
      return;
    }
    onSubmit(patch, newRole);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[460px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Edit user</h3>
          <button onClick={onCancel} className="p-1 text-ink-muted hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-ink-muted">Original: {user.email}</p>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-2 py-1 rounded border border-border-default text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-2 py-1 rounded border border-border-default text-sm"
          />
          <span className="text-[10px] text-ink-faint">
            Changing email resets verification unless you tick the box below.
          </span>
        </label>

        <label className="flex items-center gap-2 text-[12px] text-ink">
          <input
            type="checkbox"
            checked={emailVerified}
            onChange={(e) => setEmailVerified(e.target.checked)}
          />
          Email verified
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Organization</span>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm"
          >
            <option value="">— No organization —</option>
            {tenants.map((t) => (
              <option key={t.organizationId} value={t.organizationId}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Primary role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isSelf}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm disabled:bg-surface-alt disabled:text-ink-muted"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          {isSelf ? (
            <span className="text-[10px] text-ink-faint">You can&apos;t change your own role.</span>
          ) : (
            <span className="text-[10px] text-ink-faint">
              Sets the user&apos;s primary system role and syncs role_assignments.
              Promoting to Global Admin requires the users:assign-global-admin permission.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Tier</span>
          <select
            value={userTier}
            onChange={(e) => setUserTier(e.target.value)}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="max">Max</option>
          </select>
          <span className="text-[10px] text-ink-faint">
            Per-user override. Changing the org tier later will overwrite this for every
            member of that org.
          </span>
        </label>

        {error ? <div className="text-[11px] text-red-600">{error}</div> : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded border border-border-default text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
