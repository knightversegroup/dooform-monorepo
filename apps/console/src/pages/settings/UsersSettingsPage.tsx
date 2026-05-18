import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import { useCan } from '../../lib/auth/useCan';
import type { OrganizationMember, PermissionDefinition, UserRole } from '../../lib/auth/types';

const ROLES: UserRole[] = ['USER', 'ORG_ADMIN', 'GLOBAL_ADMIN'];
const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Member',
  ORG_ADMIN: 'Org Admin',
  GLOBAL_ADMIN: 'Global Admin',
};

type OverrideEffect = 'ALLOW' | 'DENY' | null;

interface DraftOverrides {
  [key: string]: OverrideEffect;
}

/**
 * Azure-AD-style per-user permission assignment. Lists users in the caller's
 * organization (Global Admin can see anyone via the cross-org endpoint, but
 * for now we surface the org member list — extend listMembers if cross-org
 * search is needed). The detail panel shows tri-state permission rows:
 * "inherit" (defer to role), "ALLOW" (extra grant), "DENY" (revoke).
 *
 * Permission overrides survive role changes and are recorded in audit_logs
 * via the backend.
 */
export default function UsersSettingsPage() {
  const { user, refetchMe } = useAuth();
  const canOverride = useCan('users:override-permissions');
  const canAssignRole = useCan('users:assign-role');
  const qc = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ['admin', 'users', 'list'],
    queryFn: () => authApi.listMembers(),
    enabled: !!user && (canOverride || canAssignRole),
  });

  const catalogQuery = useQuery({
    queryKey: ['admin', 'permissions', 'catalog'],
    queryFn: () => authApi.permissionsCatalog(),
    enabled: !!user && canOverride,
  });

  const grantsQuery = useQuery({
    queryKey: ['admin', 'permissions', 'grants'],
    queryFn: () => authApi.permissionsGrants(),
    enabled: !!user && canOverride,
  });

  const userPermissionsQuery = useQuery({
    queryKey: ['admin', 'users', selectedUserId, 'permissions'],
    queryFn: () => authApi.getUserPermissions(selectedUserId as string),
    enabled: !!selectedUserId && canOverride,
  });

  const [draftRole, setDraftRole] = useState<UserRole | null>(null);
  const [draftOverrides, setDraftOverrides] = useState<DraftOverrides>({});

  // Hydrate draft state from the loaded user permissions.
  useEffect(() => {
    if (!userPermissionsQuery.data) return;
    setDraftRole(userPermissionsQuery.data.role);
    const next: DraftOverrides = {};
    for (const o of userPermissionsQuery.data.overrides) {
      next[o.permissionKey] = o.effect;
    }
    setDraftOverrides(next);
  }, [userPermissionsQuery.data]);

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      authApi.setUserRole(userId, role),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', vars.userId, 'permissions'] });
      if (vars.userId === user?.id) void refetchMe();
    },
  });

  const overridesMutation = useMutation({
    mutationFn: ({
      userId,
      overrides,
    }: {
      userId: string;
      overrides: Array<{ key: string; effect: 'ALLOW' | 'DENY' }>;
    }) => authApi.replaceUserOverrides(userId, overrides),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', vars.userId, 'permissions'] });
      if (vars.userId === user?.id) void refetchMe();
    },
  });

  const groups = useMemo(() => {
    const cat = catalogQuery.data ?? [];
    const map = new Map<string, PermissionDefinition[]>();
    for (const p of cat) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalogQuery.data]);

  if (user && !canOverride && !canAssignRole) {
    return <Navigate to="/settings/profile" replace />;
  }

  const members: OrganizationMember[] = membersQuery.data ?? [];
  const selectedDetail = userPermissionsQuery.data;
  const roleGrants = grantsQuery.data;

  const cycleEffect = (key: string) => {
    setDraftOverrides((d) => {
      const next = { ...d };
      const cur = next[key] ?? null;
      // inherit -> ALLOW -> DENY -> inherit
      if (cur === null) next[key] = 'ALLOW';
      else if (cur === 'ALLOW') next[key] = 'DENY';
      else delete next[key];
      return next;
    });
  };

  const saveOverrides = () => {
    if (!selectedUserId) return;
    const overrides = Object.entries(draftOverrides)
      .filter(([, effect]) => effect !== null)
      .map(([key, effect]) => ({ key, effect: effect as 'ALLOW' | 'DENY' }));
    overridesMutation.mutate({ userId: selectedUserId, overrides });
  };

  const overridesDirty = useMemo(() => {
    if (!selectedDetail) return false;
    const original = new Map(selectedDetail.overrides.map((o) => [o.permissionKey, o.effect]));
    const keys = new Set<string>([
      ...Object.keys(draftOverrides).filter((k) => draftOverrides[k]),
      ...original.keys(),
    ]);
    for (const k of keys) {
      if ((draftOverrides[k] ?? null) !== (original.get(k) ?? null)) return true;
    }
    return false;
  }, [selectedDetail, draftOverrides]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">User permissions</h1>
        <p className="text-[12px] text-ink-muted">
          Grant or revoke individual permissions per user on top of their role. Deny rules
          override the role even for Global Admins, so use with care. Every change is
          audit-logged.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* User list */}
        <aside className="bg-white border border-border-subtle rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle text-[11px] uppercase tracking-wide text-ink-muted">
            Users
          </div>
          <ul className="divide-y divide-border-subtle max-h-[70vh] overflow-y-auto">
            {membersQuery.isLoading ? (
              <li className="px-3 py-3 text-[12px] text-ink-muted">Loading…</li>
            ) : null}
            {members.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(m.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-alt ${
                    selectedUserId === m.id ? 'bg-surface-alt' : ''
                  }`}
                >
                  <div className="font-medium text-ink truncate">{m.name || m.email}</div>
                  <div className="text-[11px] text-ink-muted truncate">{m.email}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
                    {ROLE_LABELS[m.role]}
                  </div>
                </button>
              </li>
            ))}
            {!membersQuery.isLoading && members.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-ink-muted">No users to manage.</li>
            ) : null}
          </ul>
        </aside>

        {/* Detail panel */}
        <section className="bg-white border border-border-subtle rounded-lg p-4 min-h-[60vh]">
          {!selectedUserId ? (
            <div className="text-[12px] text-ink-muted">
              Select a user on the left to view and edit their permissions.
            </div>
          ) : userPermissionsQuery.isLoading ? (
            <div className="text-[12px] text-ink-muted">Loading user…</div>
          ) : userPermissionsQuery.isError || !selectedDetail ? (
            <div className="text-sm text-red-600">Failed to load user.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {selectedDetail.displayName || selectedDetail.email}
                </h2>
                <p className="text-[12px] text-ink-muted">{selectedDetail.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[12px] text-ink-muted">Role</label>
                <select
                  value={draftRole ?? selectedDetail.role}
                  onChange={(e) => setDraftRole(e.target.value as UserRole)}
                  disabled={!canAssignRole || selectedUserId === user?.id}
                  className="px-2 py-1 rounded border border-border-default bg-white text-sm disabled:opacity-50"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={
                    !canAssignRole ||
                    !draftRole ||
                    draftRole === selectedDetail.role ||
                    roleMutation.isPending ||
                    selectedUserId === user?.id
                  }
                  onClick={() =>
                    selectedUserId &&
                    draftRole &&
                    roleMutation.mutate({ userId: selectedUserId, role: draftRole })
                  }
                  className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
                >
                  {roleMutation.isPending ? 'Saving…' : 'Change role'}
                </button>
                {selectedUserId === user?.id ? (
                  <span className="text-[11px] text-ink-muted">(can&apos;t change your own role)</span>
                ) : null}
                {roleMutation.error ? (
                  <span className="text-[11px] text-red-600">
                    {(roleMutation.error as Error).message}
                  </span>
                ) : null}
              </div>

              {canOverride ? (
                <div className="border-t border-border-subtle pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-ink">Permission overrides</h3>
                      <p className="text-[11px] text-ink-muted">
                        Click a row to cycle inherit → allow → deny.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {overridesMutation.error ? (
                        <span className="text-[11px] text-red-600">
                          {(overridesMutation.error as Error).message}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={saveOverrides}
                        disabled={!overridesDirty || overridesMutation.isPending}
                        className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
                      >
                        {overridesMutation.isPending ? 'Saving…' : 'Save overrides'}
                      </button>
                    </div>
                  </div>

                  {groups.length === 0 || !roleGrants ? (
                    <div className="text-[12px] text-ink-muted">Loading catalog…</div>
                  ) : (
                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                      {groups.map(([groupName, perms]) => (
                        <div key={groupName}>
                          <div className="text-[11px] uppercase tracking-wide text-ink-faint mb-1">
                            {groupName}
                          </div>
                          <ul className="divide-y divide-border-subtle border border-border-subtle rounded">
                            {perms.map((p) => {
                              const fromRole = (roleGrants[selectedDetail.role] ?? []).includes(
                                p.key,
                              );
                              const override = draftOverrides[p.key] ?? null;
                              const effective =
                                override === 'DENY'
                                  ? 'denied'
                                  : override === 'ALLOW'
                                    ? 'allowed'
                                    : fromRole
                                      ? 'inherited-grant'
                                      : 'inherited-none';
                              return (
                                <li key={p.key}>
                                  <button
                                    type="button"
                                    onClick={() => cycleEffect(p.key)}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-alt"
                                  >
                                    <div className="min-w-0">
                                      <div className="text-sm text-ink">{p.label}</div>
                                      <div className="text-[11px] text-ink-muted truncate">
                                        {p.description}
                                      </div>
                                      <div className="text-[10px] text-ink-faint">{p.key}</div>
                                    </div>
                                    <EffectBadge effective={effective} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EffectBadge({
  effective,
}: {
  effective: 'denied' | 'allowed' | 'inherited-grant' | 'inherited-none';
}) {
  const map = {
    denied: { label: 'DENY', cls: 'bg-red-100 text-red-700 border border-red-200' },
    allowed: { label: 'ALLOW', cls: 'bg-green-100 text-green-700 border border-green-200' },
    'inherited-grant': {
      label: 'from role',
      cls: 'bg-blue-50 text-blue-700 border border-blue-100',
    },
    'inherited-none': {
      label: 'no access',
      cls: 'bg-surface-alt text-ink-muted border border-border-subtle',
    },
  } as const;
  const m = map[effective];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}
