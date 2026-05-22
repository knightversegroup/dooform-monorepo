import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
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
}

export default function TiersAdminPage() {
  const qc = useQueryClient();
  const tiersQuery = useQuery({
    queryKey: ['admin', 'tiers'],
    queryFn: () => authApi.listTiers(),
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
            กำหนด feature flag ของแต่ละระดับ การเปลี่ยนแปลงมีผลทันทีกับเอกสารใหม่ —
            เอกสารที่มีอยู่จะไม่ถูกประทับใหม่ย้อนหลัง
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
          <table className="w-full text-[13px]">
            <thead className="bg-bg-subtle text-left text-[10px] uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="py-2 px-3">รหัส</th>
                <th className="py-2 px-3">ป้ายชื่อ</th>
                <th className="py-2 px-3 w-44 text-center">ลายน้ำแบรนด์</th>
                <th className="py-2 px-3 w-24">ลำดับ</th>
                <th className="py-2 px-3 w-20">เปิดใช้งาน</th>
                <th className="py-2 px-3 w-32 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {(tiersQuery.data ?? []).map((row) => (
                <Row
                  key={row.id}
                  row={row as TierRow}
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
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-[12px] text-ink-muted">
                    ยังไม่มีระดับ คลิก "ระดับใหม่" เพื่อเพิ่ม
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-[11px] text-ink-faint">
        สวิตช์ "ลายน้ำแบรนด์" ควบคุมว่าเอกสารที่สร้างโดยผู้ใช้ในระดับนั้นจะมีการประทับ
        ลายน้ำของแพลตฟอร์มลงบน PDF หรือไม่ flag ระดับอื่น ๆ สามารถเพิ่มได้ในภายหลัง
        โดยขยายคอลัมน์ JSON <code>TierConfigModel.features</code>
      </p>
    </div>
  );
}

function Row({
  row,
  onSave,
  onDelete,
}: {
  row: TierRow;
  onSave: (
    input: Partial<{
      label: string;
      description: string;
      applyBrandingWatermark: boolean;
      sortOrder: number;
      enabled: boolean;
    }>,
  ) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(row.label);
  const [description, setDescription] = useState(row.description ?? '');
  const [applyWatermark, setApplyWatermark] = useState(row.applyBrandingWatermark);
  const [sortOrder, setSortOrder] = useState(row.sortOrder);
  const [enabled, setEnabled] = useState(row.enabled);

  const dirty =
    label !== row.label ||
    description !== (row.description ?? '') ||
    applyWatermark !== row.applyBrandingWatermark ||
    sortOrder !== row.sortOrder ||
    enabled !== row.enabled;

  return (
    <tr className="align-top">
      <td className="py-2 px-3 font-mono text-[11px] text-ink-muted">{row.code}</td>
      <td className="py-2 px-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-2 py-1 border border-border-subtle rounded text-[13px]"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="คำอธิบาย"
          className="w-full mt-1 px-2 py-1 border border-border-subtle rounded text-[12px] text-ink-muted"
        />
      </td>
      <td className="py-2 px-3 text-center">
        <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
          <input
            type="checkbox"
            checked={applyWatermark}
            onChange={(e) => setApplyWatermark(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary"
          />
          {applyWatermark ? (
            <span className="text-ink">ประทับ</span>
          ) : (
            <span className="text-ink-faint">ปิด</span>
          )}
        </label>
      </td>
      <td className="py-2 px-3">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-16 px-2 py-1 border border-border-subtle rounded text-[12px] text-right"
        />
      </td>
      <td className="py-2 px-3">
        <label className="inline-flex items-center gap-1 text-[11px]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary"
          />
          {enabled ? 'เปิด' : 'ปิด'}
        </label>
      </td>
      <td className="py-2 px-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() =>
              onSave({
                label,
                description,
                applyBrandingWatermark: applyWatermark,
                sortOrder,
                enabled,
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
      </td>
    </tr>
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
      {error ? (
        <div className="md:col-span-5 text-[12px] text-red-600">{error}</div>
      ) : null}
    </form>
  );
}
