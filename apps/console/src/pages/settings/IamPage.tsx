import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, X, RotateCcw } from 'lucide-react';

import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import { useCan } from '../../lib/auth/useCan';
import type {
  AssignmentCondition,
  OrganizationMember,
  PermissionDefinition,
} from '../../lib/auth/types';

type OverrideEffect = 'ALLOW' | 'DENY' | null;

/**
 * GCP-IAM-style permission management. Lists principals on the left, opens a
 * detail panel on click that shows assigned roles + per-user overrides +
 * effective permissions.
 *
 * Grant access by clicking "Grant role" on a selected principal — the dialog
 * picks a role from the list of defined roles (system + custom) and lets the
 * admin add an optional expiry / condition.
 */
export default function IamPage() {
  const { user } = useAuth();
  const canAssignRole = useCan('users:assign-role');
  const canOverride = useCan('users:override-permissions');
  const qc = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showGrantDialog, setShowGrantDialog] = useState(false);

  const membersQuery = useQuery({
    queryKey: ['admin', 'users', 'list'],
    queryFn: () => authApi.listMembers(),
    enabled: !!user && (canAssignRole || canOverride),
  });

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => authApi.listRoles(),
    enabled: !!user && (canAssignRole || canOverride),
  });

  const catalogQuery = useQuery({
    queryKey: ['admin', 'permissions', 'catalog'],
    queryFn: () => authApi.permissionsCatalog(),
    enabled: !!user && canOverride,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['admin', 'users', selectedUserId, 'assignments'],
    queryFn: () => authApi.listUserAssignments(selectedUserId as string),
    enabled: !!selectedUserId && canAssignRole,
  });

  const userPermissionsQuery = useQuery({
    queryKey: ['admin', 'users', selectedUserId, 'permissions'],
    queryFn: () => authApi.getUserPermissions(selectedUserId as string),
    enabled: !!selectedUserId && canOverride,
  });

  const grantMutation = useMutation({
    mutationFn: (input: { roleId: string; expiresAt?: string; condition?: AssignmentCondition }) =>
      authApi.grantUserRole(selectedUserId as string, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'assignments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'permissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setShowGrantDialog(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      authApi.revokeUserAssignment(selectedUserId as string, assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'assignments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'permissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => authApi.resetUserIam(selectedUserId as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'assignments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'permissions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  const [draftOverrides, setDraftOverrides] = useState<Record<string, OverrideEffect>>({});
  useEffect(() => {
    if (!userPermissionsQuery.data) return;
    const next: Record<string, OverrideEffect> = {};
    for (const o of userPermissionsQuery.data.overrides) next[o.permissionKey] = o.effect;
    setDraftOverrides(next);
  }, [userPermissionsQuery.data]);

  const overridesMutation = useMutation({
    mutationFn: (overrides: Array<{ key: string; effect: 'ALLOW' | 'DENY' }>) =>
      authApi.replaceUserOverrides(selectedUserId as string, overrides),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId, 'permissions'] });
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

  if (user && !canAssignRole && !canOverride) {
    return <Navigate to="/settings/profile" replace />;
  }

  const members: OrganizationMember[] = membersQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const selectedMember = members.find((m) => m.id === selectedUserId) ?? null;
  const assignments = assignmentsQuery.data ?? [];

  const saveOverrides = () => {
    const overrides = Object.entries(draftOverrides)
      .filter(([, effect]) => effect !== null)
      .map(([key, effect]) => ({ key, effect: effect as 'ALLOW' | 'DENY' }));
    overridesMutation.mutate(overrides);
  };

  const overridesDirty = useMemo(() => {
    if (!userPermissionsQuery.data) return false;
    const original = new Map(userPermissionsQuery.data.overrides.map((o) => [o.permissionKey, o.effect]));
    const keys = new Set([
      ...Object.keys(draftOverrides).filter((k) => draftOverrides[k]),
      ...original.keys(),
    ]);
    for (const k of keys) {
      if ((draftOverrides[k] ?? null) !== (original.get(k) ?? null)) return true;
    }
    return false;
  }, [userPermissionsQuery.data, draftOverrides]);

  const cycleEffect = (key: string) => {
    setDraftOverrides((d) => {
      const next = { ...d };
      const cur = next[key] ?? null;
      if (cur === null) next[key] = 'ALLOW';
      else if (cur === 'ALLOW') next[key] = 'DENY';
      else delete next[key];
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">IAM</h1>
        <p className="text-[12px] text-ink-muted">
          Grant roles to principals. A user can hold multiple roles; their effective permissions
          are the union of all assigned role grants minus any DENY overrides.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <aside className="bg-white border border-border-subtle rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle text-[11px] uppercase tracking-wide text-ink-muted">
            Principals
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
                </button>
              </li>
            ))}
            {!membersQuery.isLoading && members.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-ink-muted">No principals.</li>
            ) : null}
          </ul>
        </aside>

        <section className="bg-white border border-border-subtle rounded-lg p-4 min-h-[60vh]">
          {!selectedMember ? (
            <div className="text-[12px] text-ink-muted">
              Select a principal on the left to view their assigned roles, overrides, and effective
              permissions.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">{selectedMember.name || selectedMember.email}</h2>
                  <p className="text-[12px] text-ink-muted">{selectedMember.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canOverride ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Reset IAM for ${selectedMember.email}? This drops every role assignment beyond their primary role and clears all permission overrides.`,
                          )
                        ) {
                          resetMutation.mutate();
                        }
                      }}
                      disabled={resetMutation.isPending}
                      title="Reset to default for primary role"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded border border-border-default text-ink-muted hover:text-red-600 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {resetMutation.isPending ? 'Resetting…' : 'Reset IAM'}
                    </button>
                  ) : null}
                  {canAssignRole ? (
                    <button
                      type="button"
                      onClick={() => setShowGrantDialog(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-primary text-white"
                    >
                      <Plus className="w-3 h-3" /> Grant role
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Assigned roles */}
              <div>
                <h3 className="text-sm font-medium text-ink mb-2">Assigned roles</h3>
                {assignmentsQuery.isLoading ? (
                  <div className="text-[12px] text-ink-muted">Loading…</div>
                ) : assignments.length === 0 ? (
                  <div className="text-[12px] text-ink-muted">No roles assigned.</div>
                ) : (
                  <ul className="divide-y divide-border-subtle border border-border-subtle rounded">
                    {assignments.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div>
                          <div className="text-sm text-ink">
                            <span className="font-medium">{a.roleName}</span>
                            <span className="text-ink-faint"> ({a.roleCode})</span>
                          </div>
                          <div className="text-[11px] text-ink-muted">
                            Granted {new Date(a.grantedAt).toLocaleDateString()}
                            {a.expiresAt
                              ? ` · expires ${new Date(a.expiresAt).toLocaleDateString()}`
                              : ''}
                            {a.condition ? ` · conditional` : ''}
                          </div>
                        </div>
                        {canAssignRole ? (
                          <button
                            type="button"
                            onClick={() => revokeMutation.mutate(a.id)}
                            disabled={revokeMutation.isPending}
                            className="p-1 text-ink-muted hover:text-red-600 disabled:opacity-50"
                            title="Revoke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {grantMutation.error ? (
                  <div className="mt-2 text-[11px] text-red-600">
                    {(grantMutation.error as Error).message}
                  </div>
                ) : null}
              </div>

              {/* Effective permissions */}
              {userPermissionsQuery.data ? (
                <div>
                  <h3 className="text-sm font-medium text-ink mb-2">
                    Effective permissions{' '}
                    <span className="text-[11px] text-ink-muted font-normal">
                      ({userPermissionsQuery.data.effectivePermissions.length})
                    </span>
                  </h3>
                  <div className="text-[11px] text-ink-muted flex flex-wrap gap-1">
                    {userPermissionsQuery.data.effectivePermissions.map((k) => (
                      <span key={k} className="px-1.5 py-0.5 bg-surface-alt rounded">
                        {k}
                      </span>
                    ))}
                    {userPermissionsQuery.data.effectivePermissions.length === 0 ? (
                      <span>No effective permissions.</span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Per-user overrides */}
              {canOverride ? (
                <div className="border-t border-border-subtle pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-ink">Permission overrides</h3>
                      <p className="text-[11px] text-ink-muted">
                        Click a row to cycle inherit → allow → deny. DENY wins over role grants.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={saveOverrides}
                      disabled={!overridesDirty || overridesMutation.isPending}
                      className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
                    >
                      {overridesMutation.isPending ? 'Saving…' : 'Save overrides'}
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                    {groups.map(([groupName, perms]) => (
                      <div key={groupName}>
                        <div className="text-[11px] uppercase tracking-wide text-ink-faint mb-1">
                          {groupName}
                        </div>
                        <ul className="divide-y divide-border-subtle border border-border-subtle rounded">
                          {perms.map((p) => {
                            const override = draftOverrides[p.key] ?? null;
                            const inEffective =
                              userPermissionsQuery.data?.effectivePermissions.includes(p.key) ?? false;
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
                                  <OverrideBadge override={override} inEffective={inEffective} />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {/* Grant role dialog */}
      {showGrantDialog && selectedMember ? (
        <GrantRoleDialog
          principalLabel={selectedMember.email}
          roles={roles}
          onCancel={() => setShowGrantDialog(false)}
          onSubmit={(input) => grantMutation.mutate(input)}
          submitting={grantMutation.isPending}
        />
      ) : null}
    </div>
  );
}

function OverrideBadge({
  override,
  inEffective,
}: {
  override: OverrideEffect;
  inEffective: boolean;
}) {
  if (override === 'DENY') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
        deny
      </span>
    );
  }
  if (override === 'ALLOW') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-green-100 text-green-700 border border-green-200">
        allow
      </span>
    );
  }
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
        inEffective
          ? 'bg-blue-50 text-blue-700 border border-blue-100'
          : 'bg-surface-alt text-ink-muted border border-border-subtle'
      }`}
    >
      {inEffective ? 'from role' : 'no access'}
    </span>
  );
}

function GrantRoleDialog({
  principalLabel,
  roles,
  onCancel,
  onSubmit,
  submitting,
}: {
  principalLabel: string;
  roles: Array<{ id: string; code: string; name: string; isSystem: boolean }>;
  onCancel: () => void;
  onSubmit: (input: { roleId: string; expiresAt?: string; condition?: AssignmentCondition }) => void;
  submitting: boolean;
}) {
  const [roleId, setRoleId] = useState<string>(roles[0]?.id ?? '');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [actionGlob, setActionGlob] = useState<string>('');

  const submit = () => {
    if (!roleId) return;
    const condition: AssignmentCondition | undefined = actionGlob
      ? { actionMatches: actionGlob.split(',').map((s) => s.trim()).filter(Boolean) }
      : undefined;
    onSubmit({
      roleId,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      condition,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[420px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Grant role</h3>
          <button onClick={onCancel} className="p-1 text-ink-muted hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[12px] text-ink-muted">Granting to {principalLabel}</p>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Role</span>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code}){r.isSystem ? ' · system' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">Expires at (optional)</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-muted">
            Action glob (optional, comma-separated)
          </span>
          <input
            type="text"
            placeholder="templates:*, documents:read"
            value={actionGlob}
            onChange={(e) => setActionGlob(e.target.value)}
            className="px-2 py-1 rounded border border-border-default bg-white text-sm"
          />
          <span className="text-[10px] text-ink-faint">
            Role only applies when the requested action matches one of these patterns.
          </span>
        </label>

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
            disabled={!roleId || submitting}
            className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
          >
            {submitting ? 'Granting…' : 'Grant'}
          </button>
        </div>
      </div>
    </div>
  );
}
