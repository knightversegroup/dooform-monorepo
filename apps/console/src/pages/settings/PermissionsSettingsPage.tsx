import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import type { PermissionDefinition, RoleGrants, UserRole } from '../../lib/auth/types';

const ROLES: UserRole[] = ['USER', 'ORG_ADMIN', 'GLOBAL_ADMIN'];
const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'สมาชิก',
  ORG_ADMIN: 'ผู้ดูแลองค์กร',
  GLOBAL_ADMIN: 'ผู้ดูแลทั้งระบบ',
};

export default function PermissionsSettingsPage() {
  const { user, refetchMe } = useAuth();
  const qc = useQueryClient();

  const catalogQuery = useQuery({
    queryKey: ['admin', 'permissions', 'catalog'],
    queryFn: () => authApi.permissionsCatalog(),
    enabled: user?.role === 'GLOBAL_ADMIN',
  });
  const grantsQuery = useQuery({
    queryKey: ['admin', 'permissions', 'grants'],
    queryFn: () => authApi.permissionsGrants(),
    enabled: user?.role === 'GLOBAL_ADMIN',
  });

  // Local edit state — { role: Set<key> } so toggles feel snappy and we save per-role.
  const [draft, setDraft] = useState<Record<UserRole, Set<string>> | null>(null);
  const [savedFor, setSavedFor] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!grantsQuery.data) return;
    setDraft({
      USER: new Set(grantsQuery.data.USER),
      ORG_ADMIN: new Set(grantsQuery.data.ORG_ADMIN),
      GLOBAL_ADMIN: new Set(grantsQuery.data.GLOBAL_ADMIN),
    });
  }, [grantsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: ({ role, keys }: { role: UserRole; keys: string[] }) =>
      authApi.setRoleGrants(role, keys),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'permissions', 'grants'] });
      setSavedFor(vars.role);
      setTimeout(() => setSavedFor(null), 2000);
      // If the admin edited their own role's permissions, refresh their session so the
      // sidebar / buttons reflect the change immediately.
      if (user && user.role === vars.role) {
        void refetchMe();
      }
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

  if (user && user.role !== 'GLOBAL_ADMIN') {
    return <Navigate to="/settings/profile" replace />;
  }

  if (catalogQuery.isLoading || grantsQuery.isLoading || !draft) {
    return <div className="p-6 text-[12px] text-ink-muted">กำลังโหลด…</div>;
  }
  if (catalogQuery.isError || grantsQuery.isError) {
    return <div className="p-6 text-sm text-red-600">โหลดสิทธิ์ไม่สำเร็จ</div>;
  }

  const toggle = (role: UserRole, key: string) => {
    if (role === 'GLOBAL_ADMIN') return; // bypass — always all
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, [role]: new Set(d[role]) };
      if (next[role].has(key)) next[role].delete(key);
      else next[role].add(key);
      return next;
    });
  };

  const isDirty = (role: UserRole): boolean => {
    if (!grantsQuery.data || !draft) return false;
    const original = new Set(grantsQuery.data[role]);
    const current = draft[role];
    if (original.size !== current.size) return true;
    for (const k of current) if (!original.has(k)) return true;
    return false;
  };

  const saveRole = (role: UserRole) => {
    if (!draft) return;
    saveMutation.mutate({ role, keys: Array.from(draft[role]) });
  };

  const resetRole = (role: UserRole) => {
    if (!grantsQuery.data) return;
    setDraft((d) => (d ? { ...d, [role]: new Set(grantsQuery.data![role]) } : d));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">สิทธิ์ของบทบาท</h1>
        <p className="text-[12px] text-ink-muted">
          กำหนดสิ่งที่แต่ละบทบาททำได้ การเปลี่ยนแปลงจะมีผลทันทีกับทุกเซสชันของบทบาทนั้น
          ผู้ดูแลทั้งระบบมีสิทธิ์ครบทุกอย่างเสมอและแสดงไว้เพื่ออ้างอิงเท่านั้น
        </p>
      </header>

      <div className="bg-white border border-border-subtle rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="py-3 px-4 sticky left-0 bg-surface-alt">สิทธิ์</th>
              {ROLES.map((r) => (
                <th key={r} className="py-3 px-4 text-center">
                  {ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {groups.map(([groupName, perms]) => (
              <>
                <tr key={`group-${groupName}`} className="bg-surface-alt/40">
                  <td colSpan={ROLES.length + 1} className="py-2 px-4 text-xs uppercase font-semibold text-ink-muted">
                    {groupName}
                  </td>
                </tr>
                {perms.map((p) => (
                  <tr key={p.key}>
                    <td className="py-3 px-4 sticky left-0 bg-white">
                      <div className="font-medium text-ink">{p.label}</div>
                      <div className="text-xs text-ink-muted">{p.description}</div>
                      <div className="text-[10px] font-mono text-ink-muted mt-0.5">{p.key}</div>
                    </td>
                    {ROLES.map((r) => {
                      const checked = r === 'GLOBAL_ADMIN' ? true : draft[r].has(p.key);
                      const disabled = r === 'GLOBAL_ADMIN';
                      return (
                        <td key={r} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(r, p.key)}
                            className="w-4 h-4 accent-primary cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROLES.map((r) => {
          const dirty = r !== 'GLOBAL_ADMIN' && isDirty(r);
          return (
            <div
              key={r}
              className="bg-white border border-border-subtle rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-ink">{ROLE_LABELS[r]}</div>
                {r === 'GLOBAL_ADMIN' ? (
                  <div className="text-xs text-ink-muted">สิทธิ์ครบทุกอย่าง (แก้ไขไม่ได้)</div>
                ) : savedFor === r ? (
                  <div className="text-xs text-green-600">บันทึกแล้ว</div>
                ) : dirty ? (
                  <div className="text-xs text-amber-600">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</div>
                ) : (
                  <div className="text-xs text-ink-muted">เป็นปัจจุบัน</div>
                )}
              </div>
              {r !== 'GLOBAL_ADMIN' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => resetRole(r)}
                    disabled={!dirty}
                    className="px-3 py-1.5 rounded text-xs border border-border-subtle hover:border-primary disabled:opacity-50"
                  >
                    รีเซ็ต
                  </button>
                  <button
                    onClick={() => saveRole(r)}
                    disabled={!dirty || saveMutation.isPending}
                    className="px-3 py-1.5 rounded text-xs bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {saveMutation.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
