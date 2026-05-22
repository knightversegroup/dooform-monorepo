import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';

interface TierRow {
  id: string;
  code: string;
  label: string;
  description: string | null;
  applyBrandingWatermark: boolean;
  sortOrder: number;
  enabled: boolean;
  features: { capabilities?: string[]; limits?: Record<string, number | null> } | null;
}

type FeaturesPatch = { capabilities?: string[]; limits?: Record<string, number | null> };

export default function TiersAdminPage() {
  const qc = useQueryClient();
  const tiersQuery = useQuery({
    queryKey: ['admin', 'tiers'],
    queryFn: () => authApi.listTiers(),
  });
  const catalogQuery = useQuery({
    queryKey: ['admin', 'tiers', 'catalog'],
    queryFn: () => authApi.getTierCatalog(),
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof authApi.updateTier>[1] }) =>
      authApi.updateTier(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tiers'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteTier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tiers'] }),
    onError: (err) => alert(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ'),
  });

  const [showNew, setShowNew] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold text-ink tracking-tightish">
            ระดับการสมัครสมาชิก
          </h1>
          <p className="text-[12px] text-ink-muted">
            กำหนด capability และโควต้าของแต่ละระดับ การเปลี่ยนแปลงมีผลทันที — server
            ตรวจสิทธิ์ทุก request โดยไม่ trust ค่าจาก JWT cache
          </p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] rounded-md bg-primary text-white hover:bg-primary-hover"
        >
          <Plus className="w-3.5 h-3.5" /> {showNew ? 'ปิด' : 'ระดับใหม่'}
        </button>
      </header>

      {showNew ? (
        <NewTierForm
          onCreated={() => {
            setShowNew(false);
            qc.invalidateQueries({ queryKey: ['admin', 'tiers'] });
          }}
        />
      ) : null}

      <section className="bg-white border border-border-subtle rounded-lg overflow-hidden">
        {tiersQuery.isLoading ? (
          <div className="p-4 text-[12px] text-ink-muted">กำลังโหลด…</div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {(tiersQuery.data ?? []).map((row) => (
              <Row
                key={row.id}
                row={row as TierRow}
                catalog={catalogQuery.data}
                onSave={(input) => updateMutation.mutate({ id: row.id, input })}
                onDelete={() => {
                  if (
                    confirm(
                      `ลบระดับ "${row.code}" หรือไม่? ระดับที่มากับระบบลบไม่ได้ ให้ปิดใช้งานแทน`,
                    )
                  ) {
                    deleteMutation.mutate(row.id);
                  }
                }}
              />
            ))}
            {(tiersQuery.data ?? []).length === 0 ? (
              <li className="py-6 px-4 text-center text-[12px] text-ink-muted">
                ยังไม่มีระดับ คลิก "ระดับใหม่" เพื่อเพิ่ม
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-ink-faint">
        คลิกที่ลูกศรของแถวเพื่อแก้ไข capability และ limit ของระดับนั้น ค่าที่ไม่ได้ตั้ง
        override จะใช้ค่า default จาก catalog (กำหนดในโค้ดที่ <code>capabilities.catalog.ts</code>)
      </p>
    </div>
  );
}

function Row({
  row,
  catalog,
  onSave,
  onDelete,
}: {
  row: TierRow;
  catalog: ReturnType<typeof useQuery>['data'] | Awaited<ReturnType<typeof authApi.getTierCatalog>>;
  onSave: (
    input: {
      label?: string;
      description?: string;
      applyBrandingWatermark?: boolean;
      sortOrder?: number;
      enabled?: boolean;
      features?: FeaturesPatch | null;
    },
  ) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(row.label);
  const [description, setDescription] = useState(row.description ?? '');
  const [applyWatermark, setApplyWatermark] = useState(row.applyBrandingWatermark);
  const [sortOrder, setSortOrder] = useState(row.sortOrder);
  const [enabled, setEnabled] = useState(row.enabled);
  const [features, setFeatures] = useState<FeaturesPatch | null>(row.features);

  const dirty =
    label !== row.label ||
    description !== (row.description ?? '') ||
    applyWatermark !== row.applyBrandingWatermark ||
    sortOrder !== row.sortOrder ||
    enabled !== row.enabled ||
    JSON.stringify(features ?? null) !== JSON.stringify(row.features ?? null);

  return (
    <li className="">
      <div className="grid grid-cols-[28px_140px_minmax(160px,1fr)_140px_80px_80px_160px] gap-3 px-3 py-2.5 items-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-ink-muted hover:text-ink"
          title={open ? 'ย่อ' : 'ขยายเพื่อแก้ capability'}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <code className="font-mono text-[11px] text-ink truncate" title={row.code}>
          {row.code}
        </code>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="px-2 py-1 border border-border-subtle rounded text-[13px]"
        />
        <label
          className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer"
          title="ลายน้ำแบรนด์ — ใช้ flag นี้ก็ได้ หรือใช้ capability `feature:remove_watermark` (เทียบเท่ากัน)"
        >
          <input
            type="checkbox"
            checked={applyWatermark}
            onChange={(e) => setApplyWatermark(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary"
          />
          {applyWatermark ? 'ประทับ' : 'ปิด'}
        </label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-16 px-2 py-1 border border-border-subtle rounded text-[12px] text-right"
        />
        <label className="inline-flex items-center gap-1 text-[11px]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary"
          />
          {enabled ? 'เปิด' : 'ปิด'}
        </label>
        <div className="text-right">
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() =>
                onSave({
                  label,
                  description,
                  applyBrandingWatermark: applyWatermark,
                  sortOrder,
                  enabled,
                  features,
                })
              }
              disabled={!dirty}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-white text-[11px] hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="w-3 h-3" /> บันทึก
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-50 text-red-500"
              title="ลบ (ระดับที่มากับระบบลบไม่ได้)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-12 pb-3">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="คำอธิบาย"
          className="w-full px-2 py-1 border border-border-subtle rounded text-[12px] text-ink-muted"
        />
      </div>

      {open && catalog ? (
        <div className="bg-bg-subtle/40 border-t border-border-subtle px-12 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapabilitiesEditor
            tierCode={row.code}
            catalog={(catalog as Awaited<ReturnType<typeof authApi.getTierCatalog>>).capabilities}
            features={features ?? {}}
            onChange={setFeatures}
          />
          <LimitsEditor
            tierCode={row.code}
            catalog={(catalog as Awaited<ReturnType<typeof authApi.getTierCatalog>>).limits}
            features={features ?? {}}
            onChange={setFeatures}
          />
        </div>
      ) : null}
    </li>
  );
}

function CapabilitiesEditor({
  tierCode,
  catalog,
  features,
  onChange,
}: {
  tierCode: string;
  catalog: Awaited<ReturnType<typeof authApi.getTierCatalog>>['capabilities'];
  features: FeaturesPatch;
  onChange: (next: FeaturesPatch) => void;
}) {
  // Resolve current state of each capability for THIS tier:
  //   - explicitly granted (override key)
  //   - explicitly revoked ("-key" override)
  //   - inherited via catalog default (no override)
  const overrides = features.capabilities ?? [];
  const grantedSet = new Set(overrides.filter((c) => !c.startsWith('-')));
  const revokedSet = new Set(overrides.filter((c) => c.startsWith('-')).map((c) => c.slice(1)));

  const writeCap = (key: string, mode: 'grant' | 'revoke' | 'default') => {
    const rest = overrides.filter((c) => c !== key && c !== `-${key}`);
    let next: string[];
    if (mode === 'grant') next = [...rest, key];
    else if (mode === 'revoke') next = [...rest, `-${key}`];
    else next = rest;
    onChange({ ...features, capabilities: next });
  };

  return (
    <div>
      <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-2">
        Capability overrides
      </h4>
      <ul className="space-y-1.5">
        {catalog.map((def) => {
          const inheritedDefault = def.defaultMinTier; // catalog says "this is the floor tier"
          const isGranted = grantedSet.has(def.key);
          const isRevoked = revokedSet.has(def.key);
          const state: 'grant' | 'revoke' | 'default' = isGranted
            ? 'grant'
            : isRevoked
              ? 'revoke'
              : 'default';
          return (
            <li
              key={def.key}
              className="flex items-start justify-between gap-3 px-2 py-1.5 rounded border border-border-subtle bg-white"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-ink">{def.label}</div>
                <div className="text-[10px] text-ink-faint">
                  default: ใช้ได้ตั้งแต่{' '}
                  <code className="font-mono">{inheritedDefault}</code> ขึ้นไป
                </div>
              </div>
              <select
                value={state}
                onChange={(e) => writeCap(def.key, e.target.value as 'grant' | 'revoke' | 'default')}
                className="px-1.5 py-1 border border-border-subtle rounded text-[11px] bg-white"
              >
                <option value="default">↪ default ({tierCode})</option>
                <option value="grant">✓ มอบให้</option>
                <option value="revoke">✕ ปิดสำหรับระดับนี้</option>
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LimitsEditor({
  tierCode,
  catalog,
  features,
  onChange,
}: {
  tierCode: string;
  catalog: Awaited<ReturnType<typeof authApi.getTierCatalog>>['limits'];
  features: FeaturesPatch;
  onChange: (next: FeaturesPatch) => void;
}) {
  const overrides = features.limits ?? {};

  const writeLimit = (key: string, value: number | null | undefined) => {
    const next = { ...overrides };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange({ ...features, limits: Object.keys(next).length > 0 ? next : undefined });
  };

  return (
    <div>
      <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-2">
        Numeric limit overrides
      </h4>
      <ul className="space-y-1.5">
        {catalog.map((def) => {
          const inherited = def.defaults[tierCode] ?? null;
          const overridden = def.key in overrides;
          const value = overridden ? overrides[def.key] : inherited;
          const isUnlimited = value === null;
          return (
            <li
              key={def.key}
              className="flex items-start justify-between gap-3 px-2 py-1.5 rounded border border-border-subtle bg-white"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-ink">{def.label}</div>
                <div className="text-[10px] text-ink-faint">
                  default ของ {tierCode}: {inherited === null ? 'ไม่จำกัด' : inherited}{' '}
                  ({def.unit})
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={isUnlimited ? '' : (value ?? '')}
                  disabled={isUnlimited}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      writeLimit(def.key, undefined); // back to default
                    } else {
                      writeLimit(def.key, Number(raw));
                    }
                  }}
                  className="w-20 px-1.5 py-0.5 border border-border-subtle rounded text-[11px] text-right"
                />
                <label className="inline-flex items-center gap-1 text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnlimited}
                    onChange={(e) => writeLimit(def.key, e.target.checked ? null : 0)}
                    className="w-3 h-3 accent-primary"
                  />
                  ไม่จำกัด
                </label>
                {overridden ? (
                  <button
                    onClick={() => writeLimit(def.key, undefined)}
                    className="text-[10px] text-ink-faint hover:text-ink underline"
                    title="คืนค่าเริ่มต้น"
                  >
                    คืนค่า
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NewTierForm({ onCreated }: { onCreated: () => void }) {
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [applyWatermark, setApplyWatermark] = useState(false);
  const [sortOrder, setSortOrder] = useState(100);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      authApi.createTier({
        code: code.trim(),
        label: label.trim(),
        description: description.trim() || undefined,
        applyBrandingWatermark: applyWatermark,
        sortOrder,
      }),
    onSuccess: () => {
      onCreated();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'สร้างไม่สำเร็จ'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !label.trim()) {
      setError('ต้องระบุรหัสและป้ายชื่อ');
      return;
    }
    createMutation.mutate();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border-subtle rounded-lg p-4 grid grid-cols-1 md:grid-cols-[160px_1fr_180px_120px_auto] gap-3 items-end"
    >
      <div>
        <label className="block text-[11px] text-ink-muted mb-1">รหัส</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="enterprise"
          className="w-full px-2 py-1.5 border border-border-subtle rounded text-[13px] font-mono"
        />
      </div>
      <div>
        <label className="block text-[11px] text-ink-muted mb-1">ป้ายชื่อ</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enterprise"
          className="w-full px-2 py-1.5 border border-border-subtle rounded text-[13px]"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="คำอธิบาย (ไม่บังคับ)"
          className="w-full mt-1 px-2 py-1.5 border border-border-subtle rounded text-[12px] text-ink-muted"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-[12px] mt-5">
        <input
          type="checkbox"
          checked={applyWatermark}
          onChange={(e) => setApplyWatermark(e.target.checked)}
          className="w-3.5 h-3.5 accent-primary"
        />
        ประทับลายน้ำแบรนด์
      </label>
      <div>
        <label className="block text-[11px] text-ink-muted mb-1">ลำดับ</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-full px-2 py-1.5 border border-border-subtle rounded text-[13px] text-right"
        />
      </div>
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="px-3 py-1.5 rounded bg-primary text-white text-[12px] hover:bg-primary-hover disabled:opacity-50"
      >
        {createMutation.isPending ? 'กำลังเพิ่ม…' : 'เพิ่มระดับ'}
      </button>
      {error ? <div className="md:col-span-5 text-[12px] text-red-600">{error}</div> : null}
    </form>
  );
}
