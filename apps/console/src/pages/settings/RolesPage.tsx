import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X } from 'lucide-react';

import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import { useCan } from '../../lib/auth/useCan';
import type { PermissionDefinition } from '../../lib/auth/types';

/**
 * IAM Roles management page. Lists all roles (system + custom), and lets
 * holders of roles:create / roles:update / roles:delete manage custom roles.
 * System roles allow permission edits via the existing /settings/permissions
 * page; here system roles are read-only displayed for context.
 */
export default function RolesPage() {
  const { user } = useAuth();
  const canRead = useCan('roles:read');
  const canCreate = useCan('roles:create');
  const canUpdate = useCan('roles:update');
  const canDelete = useCan('roles:delete');
  const qc = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => authApi.listRoles(),
    enabled: !!user && canRead,
  });

  const catalogQuery = useQuery({
    queryKey: ['admin', 'permissions', 'catalog'],
    queryFn: () => authApi.permissionsCatalog(),
    enabled: !!user && canRead,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const selectedRole = (rolesQuery.data ?? []).find((r) => r.id === selectedRoleId) ?? null;

  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftPermissions, setDraftPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedRole) {
      setDraftName('');
      setDraftDescription('');
      setDraftPermissions(new Set());
      return;
    }
    setDraftName(selectedRole.name);
    setDraftDescription(selectedRole.description ?? '');
    setDraftPermissions(new Set(selectedRole.permissions));
  }, [selectedRole]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedRole) throw new Error('No role selected');
      return authApi.updateRole(selectedRole.id, {
        name: selectedRole.isSystem ? undefined : draftName,
        description: draftDescription || null,
        permissions: Array.from(draftPermissions),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: { code: string; name: string; description?: string; permissions: string[] }) =>
      authApi.createRole(input),
    onSuccess: (role) => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setShowCreateDialog(false);
      setSelectedRoleId(role.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setSelectedRoleId(null);
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

  if (user && !canRead) {
    return <Navigate to="/settings/profile" replace />;
  }

  const togglePermission = (key: string) => {
    setDraftPermissions((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isDirty = useMemo(() => {
    if (!selectedRole) return false;
    if (!selectedRole.isSystem && draftName !== selectedRole.name) return true;
    if ((draftDescription || null) !== (selectedRole.description ?? null)) return true;
    const original = new Set(selectedRole.permissions);
    if (original.size !== draftPermissions.size) return true;
    for (const k of draftPermissions) if (!original.has(k)) return true;
    return false;
  }, [selectedRole, draftName, draftDescription, draftPermissions]);

  const roles = rolesQuery.data ?? [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-ink tracking-tightish">บทบาท</h1>
          <p className="text-[12px] text-ink-muted">
            บทบาทระบบถูกสร้างไว้ตั้งแต่ต้น สามารถปรับสิทธิ์ได้แต่เปลี่ยนชื่อไม่ได้
            บทบาทแบบกำหนดเองคือชุดสิทธิ์ที่ผู้ดูแลกำหนดและสามารถมอบให้ผ่านหน้า IAM
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-primary text-white"
          >
            <Plus className="w-3 h-3" /> บทบาทใหม่
          </button>
        ) : null}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <aside className="bg-white border border-border-subtle rounded-lg overflow-hidden">
          <ul className="divide-y divide-border-subtle max-h-[70vh] overflow-y-auto">
            {rolesQuery.isLoading ? (
              <li className="px-3 py-3 text-[12px] text-ink-muted">กำลังโหลด…</li>
            ) : null}
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-alt ${
                    selectedRoleId === r.id ? 'bg-surface-alt' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink truncate">{r.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-ink-faint">
                      {r.isSystem ? 'ระบบ' : 'กำหนดเอง'}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {r.code} · {r.permissions.length} สิทธิ์ · {r.assigneeCount} ผู้ใช้
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="bg-white border border-border-subtle rounded-lg p-4 min-h-[60vh]">
          {!selectedRole ? (
            <div className="text-[12px] text-ink-muted">เลือกบทบาททางซ้ายเพื่อแก้ไข</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    disabled={selectedRole.isSystem || !canUpdate}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full text-base font-semibold text-ink bg-transparent border-b border-transparent focus:border-border-default focus:outline-none disabled:text-ink-muted"
                  />
                  <p className="text-[11px] text-ink-faint">
                    {selectedRole.code} · ผู้ได้รับ {selectedRole.assigneeCount} คน
                  </p>
                </div>
                {canDelete && !selectedRole.isSystem ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`ลบบทบาท "${selectedRole.name}" หรือไม่?`)) deleteMutation.mutate(selectedRole.id);
                    }}
                    disabled={deleteMutation.isPending || selectedRole.assigneeCount > 0}
                    title={
                      selectedRole.assigneeCount > 0
                        ? 'เพิกถอนจากผู้ได้รับทั้งหมดก่อน'
                        : 'ลบบทบาท'
                    }
                    className="p-1 text-ink-muted hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              <textarea
                rows={2}
                disabled={!canUpdate}
                placeholder="คำอธิบาย"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full px-2 py-1 text-sm rounded border border-border-default disabled:bg-surface-alt"
              />

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-ink">
                  สิทธิ์{' '}
                  <span className="text-[11px] text-ink-muted font-normal">
                    ({draftPermissions.size})
                  </span>
                </h3>
                {canUpdate ? (
                  <button
                    type="button"
                    disabled={!isDirty || updateMutation.isPending}
                    onClick={() => updateMutation.mutate()}
                    className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
                  </button>
                ) : null}
              </div>
              {updateMutation.error ? (
                <div className="text-[11px] text-red-600">
                  {(updateMutation.error as Error).message}
                </div>
              ) : null}

              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {groups.map(([groupName, perms]) => (
                  <div key={groupName}>
                    <div className="text-[11px] uppercase tracking-wide text-ink-faint mb-1">
                      {groupName}
                    </div>
                    <ul className="divide-y divide-border-subtle border border-border-subtle rounded">
                      {perms.map((p) => {
                        const checked = draftPermissions.has(p.key);
                        return (
                          <li key={p.key}>
                            <label className="flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-surface-alt">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!canUpdate}
                                onChange={() => togglePermission(p.key)}
                                className="mt-1"
                              />
                              <div className="min-w-0">
                                <div className="text-sm text-ink">{p.label}</div>
                                <div className="text-[11px] text-ink-muted truncate">
                                  {p.description}
                                </div>
                                <div className="text-[10px] text-ink-faint">{p.key}</div>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {showCreateDialog ? (
        <CreateRoleDialog
          catalog={catalogQuery.data ?? []}
          onCancel={() => setShowCreateDialog(false)}
          onSubmit={(input) => createMutation.mutate(input)}
          submitting={createMutation.isPending}
          error={createMutation.error ? (createMutation.error as Error).message : null}
        />
      ) : null}
    </div>
  );
}

function CreateRoleDialog({
  catalog,
  onCancel,
  onSubmit,
  submitting,
  error,
}: {
  catalog: PermissionDefinition[];
  onCancel: () => void;
  onSubmit: (input: { code: string; name: string; description?: string; permissions: string[] }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [perms, setPerms] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const map = new Map<string, PermissionDefinition[]>();
    for (const p of catalog) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[640px] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-ink">บทบาทแบบกำหนดเองใหม่</h3>
          <button onClick={onCancel} className="p-1 text-ink-muted hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-muted">รหัส (ตัวพิมพ์เล็ก คั่นด้วยขีดกลาง)</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              placeholder="templates-admin"
              className="px-2 py-1 rounded border border-border-default text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-muted">ชื่อที่แสดง</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ผู้ดูแลเทมเพลต"
              className="px-2 py-1 rounded border border-border-default text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-muted">คำอธิบาย</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-2 py-1 rounded border border-border-default text-sm"
            />
          </label>

          <div>
            <div className="text-[11px] text-ink-muted mb-1">สิทธิ์ ({perms.size})</div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {groups.map(([groupName, ps]) => (
                <div key={groupName}>
                  <div className="text-[11px] uppercase tracking-wide text-ink-faint mb-1">
                    {groupName}
                  </div>
                  <ul className="divide-y divide-border-subtle border border-border-subtle rounded">
                    {ps.map((p) => {
                      const checked = perms.has(p.key);
                      return (
                        <li key={p.key}>
                          <label className="flex items-start gap-2 px-3 py-1.5 cursor-pointer hover:bg-surface-alt">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setPerms((s) => {
                                  const next = new Set(s);
                                  if (next.has(p.key)) next.delete(p.key);
                                  else next.add(p.key);
                                  return next;
                                })
                              }
                              className="mt-1"
                            />
                            <div className="min-w-0">
                              <div className="text-sm text-ink">{p.label}</div>
                              <div className="text-[10px] text-ink-faint">{p.key}</div>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error ? <div className="px-4 pb-2 text-[11px] text-red-600">{error}</div> : null}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded border border-border-default text-ink-muted"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={!code || !name || submitting}
            onClick={() =>
              onSubmit({
                code,
                name,
                description: description || undefined,
                permissions: Array.from(perms),
              })
            }
            className="px-3 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
          >
            {submitting ? 'กำลังสร้าง…' : 'สร้าง'}
          </button>
        </div>
      </div>
    </div>
  );
}
