import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useCan } from '../../lib/auth/useCan';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';
import type { OrganizationMember, UserRole, UserTier } from '../../lib/auth/types';

const inputCls =
  'w-full px-3 py-2 border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-sm font-medium text-ink mb-1';

const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Member',
  ORG_ADMIN: 'Admin',
  GLOBAL_ADMIN: 'Global admin',
};

const TIERS: Array<{ code: UserTier; label: string; description: string }> = [
  {
    code: 'free',
    label: 'Free',
    description: 'Basic features, branding watermark on PDFs.',
  },
  {
    code: 'pro',
    label: 'Pro',
    description: 'Removes the branding watermark, unlocks Pro templates.',
  },
  {
    code: 'max',
    label: 'Max',
    description: 'Everything in Pro, plus access to Enterprise templates.',
  },
];

export default function OrganizationSettingsPage() {
  const { user, refetchMe } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'GLOBAL_ADMIN';
  const canManageTier = useCan('organization:tier:manage');

  const orgQuery = useQuery({
    queryKey: ['organization'],
    queryFn: () => authApi.getOrganization(),
    enabled: Boolean(user?.organizationId),
  });
  const storageQuery = useQuery({
    queryKey: ['organization', 'storage'],
    queryFn: () => authApi.getOrganizationStorage(),
    enabled: Boolean(user?.organizationId),
    refetchOnWindowFocus: true,
  });
  const membersQuery = useQuery({
    queryKey: ['organization', 'members'],
    queryFn: () => authApi.listMembers(),
    enabled: Boolean(user?.organizationId),
  });
  const invitesQuery = useQuery({
    queryKey: ['organization', 'invites'],
    queryFn: () => authApi.listInviteCodes(),
    enabled: isAdmin,
  });

  const [name, setName] = useState('');
  const [orgMsg, setOrgMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => {
    if (orgQuery.data) setName(orgQuery.data.name);
  }, [orgQuery.data]);

  const onSaveOrg = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setOrgMsg(null);
    setSavingOrg(true);
    try {
      const updated = await authApi.updateOrganization({ name });
      qc.setQueryData(['organization'], updated);
      setOrgMsg({ kind: 'ok', text: 'Organization saved.' });
    } catch (err) {
      setOrgMsg({ kind: 'err', text: err instanceof ApiError ? err.message : 'Save failed' });
    } finally {
      setSavingOrg(false);
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      authApi.updateMemberRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'members'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => authApi.removeMember(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'members'] }),
  });

  const createInviteMutation = useMutation({
    mutationFn: () => authApi.createInviteCode({ expiresInDays: 7 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'invites'] }),
  });

  const setTierMutation = useMutation({
    mutationFn: (tier: UserTier) => authApi.updateOrganizationTier(tier),
    onSuccess: (next) => {
      qc.setQueryData(['organization'], next);
      // Force /auth/me refetch so the user's JWT-mirrored userTier picks up the
      // change for current page session (the new value also lands in their JWT
      // on the next refresh-token roll).
      void refetchMe();
    },
  });
  const deleteInviteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteInviteCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'invites'] }),
  });

  if (!user?.organizationId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-[12px] text-ink-muted">You are not a member of an organization.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">Organization</h1>
        <p className="text-[12px] text-ink-muted">Manage your workspace, members, and invites.</p>
      </header>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-ink tracking-tightish mb-4">Details</h2>
        <form onSubmit={onSaveOrg} className="space-y-4">
          <div>
            <label className={labelCls}>Organization name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              disabled={!isAdmin}
              required
            />
          </div>
          {orgQuery.data ? (
            <div className="text-xs text-ink-muted">Slug: {orgQuery.data.slug}</div>
          ) : null}
          {orgMsg ? (
            <div className={`text-sm ${orgMsg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{orgMsg.text}</div>
          ) : null}
          {isAdmin ? (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingOrg}
                className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
              >
                {savingOrg ? 'Saving…' : 'Save organization'}
              </button>
            </div>
          ) : null}
        </form>
      </section>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-ink tracking-tightish mb-1">Storage</h2>
        <p className="text-sm text-ink-muted mb-4">
          Quota is set by the platform admin. Contact them if you need more space.
        </p>
        {storageQuery.isLoading ? (
          <div className="text-[12px] text-ink-muted">Loading…</div>
        ) : storageQuery.data ? (
          (() => {
            const s = storageQuery.data;
            const fmt = (n: number) => {
              const GB = 1024 ** 3;
              const MB = 1024 ** 2;
              if (n >= GB) return `${(n / GB).toFixed(2)} GB`;
              if (n >= MB) return `${(n / MB).toFixed(1)} MB`;
              if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
              return `${n} B`;
            };
            const pct = s.percentUsed ?? 0;
            return (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm text-ink">
                    <span className="font-medium text-ink">{fmt(s.usedBytes)}</span>{' '}
                    <span className="text-ink-muted">used</span>
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    {s.quotaBytes == null ? 'Unlimited' : `of ${fmt(s.quotaBytes)}`}
                  </div>
                </div>
                {s.quotaBytes == null ? (
                  <div className="text-xs text-ink-muted">
                    No quota configured — usage is unrestricted.
                  </div>
                ) : (
                  <>
                    <div className="h-3 bg-surface-alt rounded">
                      <div
                        className={`h-3 rounded ${
                          pct > 90
                            ? 'bg-red-500'
                            : pct > 75
                              ? 'bg-amber-500'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="text-xs text-ink-muted text-right">
                      {pct.toFixed(1)}% used
                    </div>
                  </>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-sm text-red-600">Failed to load storage info.</div>
        )}
      </section>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[14px] font-semibold text-ink tracking-tightish flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Subscription
          </h2>
          <span className="text-[11px] uppercase tracking-wider text-ink-faint">
            Current: {(orgQuery.data?.tier ?? 'free').toString().toUpperCase()}
          </span>
        </div>
        <p className="text-[12px] text-ink-muted mb-4">
          Tier applies to every member of your organization. Upgrades are immediate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIERS.map((t) => {
            const isCurrent = (orgQuery.data?.tier ?? 'free') === t.code;
            return (
              <div
                key={t.code}
                className={`rounded-md border p-3 flex flex-col gap-2 ${
                  isCurrent ? 'border-primary bg-primary-subtle' : 'border-border-subtle bg-bg-subtle'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-semibold text-ink uppercase tracking-wider">
                    {t.label}
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="text-[12px] text-ink-muted flex-1">{t.description}</p>
                {!isCurrent && canManageTier ? (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Change tier to ${t.label}? All members will gain ${t.label} features immediately.`,
                        )
                      ) {
                        setTierMutation.mutate(t.code);
                      }
                    }}
                    disabled={setTierMutation.isPending}
                    className="px-3 py-1.5 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary-hover disabled:opacity-50"
                  >
                    {setTierMutation.isPending && setTierMutation.variables === t.code
                      ? 'Switching…'
                      : `Switch to ${t.label}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        {!canManageTier ? (
          <p className="text-[11px] text-ink-faint mt-3">
            Only admins with the "Change subscription tier" permission can switch tiers.
          </p>
        ) : null}
        {setTierMutation.error ? (
          <p className="text-[12px] text-red-600 mt-3">
            {setTierMutation.error instanceof ApiError
              ? setTierMutation.error.message
              : 'Tier change failed.'}
          </p>
        ) : null}
      </section>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-ink tracking-tightish mb-4">Members</h2>
        {membersQuery.isLoading ? (
          <div className="text-[12px] text-ink-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-muted uppercase">
                <tr>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Tier</th>
                  {isAdmin ? <th className="py-2 pr-3 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {(membersQuery.data ?? []).map((m: OrganizationMember) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-ink">{m.name}</div>
                      {m.jobTitle ? <div className="text-xs text-ink-muted">{m.jobTitle}</div> : null}
                    </td>
                    <td className="py-2 pr-3 text-ink-muted">{m.email}</td>
                    <td className="py-2 pr-3">
                      {isAdmin && m.id !== user.id && m.role !== 'GLOBAL_ADMIN' ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({ userId: m.id, role: e.target.value as UserRole })
                          }
                          className="px-2 py-1 border border-border-subtle rounded text-xs"
                        >
                          <option value="USER">{ROLE_LABELS.USER}</option>
                          <option value="ORG_ADMIN">{ROLE_LABELS.ORG_ADMIN}</option>
                        </select>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-alt">{ROLE_LABELS[m.role]}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-ink-muted">{m.userTier}</td>
                    {isAdmin ? (
                      <td className="py-2 pr-3 text-right">
                        {m.id !== user.id ? (
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${m.name} from the organization?`)) {
                                removeMutation.mutate(m.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-xs inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isAdmin ? (
        <section className="bg-white border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-ink tracking-tightish">Invite codes</h2>
              <p className="text-[12px] text-ink-muted">Share these codes for new members to join your organization.</p>
            </div>
            <button
              onClick={() => createInviteMutation.mutate()}
              disabled={createInviteMutation.isPending}
              className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {createInviteMutation.isPending ? 'Creating…' : 'New invite code'}
            </button>
          </div>
          {invitesQuery.isLoading ? (
            <div className="text-[12px] text-ink-muted">Loading…</div>
          ) : (invitesQuery.data ?? []).length === 0 ? (
            <div className="text-[12px] text-ink-muted">No invite codes yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-muted uppercase">
                <tr>
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Expires</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {(invitesQuery.data ?? []).map((c) => {
                  const expired = c.expiresAt ? new Date(c.expiresAt).getTime() < Date.now() : false;
                  const status = c.usedAt ? 'Used' : expired ? 'Expired' : 'Active';
                  return (
                    <tr key={c.id}>
                      <td className="py-2 pr-3 font-mono text-ink">{c.code}</td>
                      <td className="py-2 pr-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-surface-alt text-ink-muted'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs text-ink-muted">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {!c.usedAt ? (
                          <button
                            onClick={() => deleteInviteMutation.mutate(c.id)}
                            className="text-red-600 hover:text-red-700 text-xs inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Revoke
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </div>
  );
}
