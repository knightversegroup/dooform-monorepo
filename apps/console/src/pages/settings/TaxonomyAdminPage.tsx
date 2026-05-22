import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { taxonomyApi, type TaxonomyEntry, type TaxonomyKind } from '../../lib/api/templateTaxonomy';
import { ApiError } from '../../lib/api/client';

const KIND_TITLES: Record<TaxonomyKind, string> = {
  TYPE: 'ประเภทเทมเพลต',
  TIER: 'ระดับเทมเพลต',
  CATEGORY: 'หมวดหมู่เทมเพลต',
};

const KIND_HINTS: Record<TaxonomyKind, string> = {
  TYPE: 'Form, Survey, Quiz ฯลฯ — ใช้จัดประเภทเทมเพลตตามวัตถุประสงค์',
  TIER:
    'ระดับ Free / Pro / Enterprise ที่จำกัดการใช้เทมเพลต ผู้ใช้ระดับต่ำกว่าจะไม่เห็น',
  CATEGORY: 'หมวดหมู่โดเมนสำหรับการเรียกดูและค้นหา',
};

export default function TaxonomyAdminPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">หมวดหมู่เทมเพลต</h1>
        <p className="text-[12px] text-ink-muted">
          กำหนดรายการตัวเลือกที่แสดงในฟอร์มอัปโหลด + แก้ไขเทมเพลต รหัสที่มากับระบบ
          (ค่าที่มาพร้อมแพลตฟอร์ม) ลบไม่ได้ แต่สามารถเปลี่ยนป้ายชื่อ จัดเรียงใหม่ หรือซ่อนได้
          รหัสใหม่ที่คุณเพิ่มที่นี่จะใช้งานในฟอร์มอัปโหลดได้ทันที
        </p>
      </header>

      {/*
        TIER intentionally omitted — unified with the platform's Subscription tiers
        and managed at /settings/tiers (single source of truth for both subscription
        gating and template access).
      */}
      <p className="text-[11px] text-ink-faint -mt-2">
        มองหาการตั้งค่าระดับ? ตอนนี้อยู่ที่{' '}
        <a href="/settings/tiers" className="text-primary hover:underline">
          ระดับการสมัครสมาชิก
        </a>{' '}
        — รายการเดียวควบคุมทั้งการจำกัดการสมัครและการเข้าถึงเทมเพลต
      </p>

      {(['TYPE', 'CATEGORY'] as TaxonomyKind[]).map((kind) => (
        <KindSection key={kind} kind={kind} />
      ))}
    </div>
  );
}

function KindSection({ kind }: { kind: TaxonomyKind }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['template-taxonomy', kind, 'admin'],
    queryFn: () => taxonomyApi.listByKind(kind, true),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof taxonomyApi.update>[1] }) =>
      taxonomyApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['template-taxonomy', kind] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxonomyApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['template-taxonomy', kind] }),
    onError: (err) => alert(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ'),
  });

  const [showNew, setShowNew] = useState(false);

  return (
    <section className="bg-white border border-border-subtle rounded-lg">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-ink tracking-tightish">{KIND_TITLES[kind]}</h2>
          <p className="text-xs text-ink-muted">{KIND_HINTS[kind]}</p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover"
        >
          <Plus className="w-4 h-4" /> {showNew ? 'ปิด' : 'เพิ่มค่า'}
        </button>
      </div>

      {showNew ? <NewEntryForm kind={kind} onCreated={() => setShowNew(false)} /> : null}

      {query.isLoading ? (
        <div className="px-5 py-4 text-[12px] text-ink-muted">กำลังโหลด…</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="py-2 px-4">รหัส</th>
              <th className="py-2 px-4">ป้ายชื่อ</th>
              <th className="py-2 px-4 w-20">ลำดับ</th>
              <th className="py-2 px-4 w-24">เปิดใช้งาน</th>
              <th className="py-2 px-4 w-32 text-right">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {(query.data ?? []).map((row) => (
              <Row
                key={row.id}
                row={row}
                onSave={(input) =>
                  updateMutation.mutate({ id: row.id, input })
                }
                onDelete={() => {
                  if (
                    confirm(
                      `ลบ ${kind} "${row.code}" หรือไม่? รหัสที่มากับระบบลบไม่ได้ ให้ปิดใช้งานแทน`,
                    )
                  ) {
                    deleteMutation.mutate(row.id);
                  }
                }}
              />
            ))}
            {(query.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-ink-muted text-sm">
                  ยังไม่มีรายการ
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Row({
  row,
  onSave,
  onDelete,
}: {
  row: TaxonomyEntry;
  onSave: (input: { label?: string; sortOrder?: number; enabled?: boolean }) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(row.label);
  const [sortOrder, setSortOrder] = useState(row.sortOrder);
  const [enabled, setEnabled] = useState(row.enabled);
  const dirty =
    label !== row.label || sortOrder !== row.sortOrder || enabled !== row.enabled;

  return (
    <tr>
      <td className="py-2 px-4 font-mono text-xs text-ink-muted">{row.code}</td>
      <td className="py-2 px-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-2 py-1 border border-border-subtle rounded text-sm"
        />
      </td>
      <td className="py-2 px-4">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-16 px-2 py-1 border border-border-subtle rounded text-sm text-right"
        />
      </td>
      <td className="py-2 px-4">
        <label className="inline-flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {enabled ? 'เปิด' : 'ปิด'}
        </label>
      </td>
      <td className="py-2 px-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onSave({ label, sortOrder, enabled })}
            disabled={!dirty}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-white text-xs hover:bg-primary-hover disabled:opacity-50"
          >
            <Save className="w-3 h-3" /> บันทึก
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-500"
            title="ลบ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function NewEntryForm({ kind, onCreated }: { kind: TaxonomyKind; onCreated: () => void }) {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [sortOrder, setSortOrder] = useState(100);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      taxonomyApi.create({ kind, code: code.trim(), label: label.trim(), sortOrder }),
    onSuccess: () => {
      setCode('');
      setLabel('');
      setSortOrder(100);
      setError(null);
      qc.invalidateQueries({ queryKey: ['template-taxonomy', kind] });
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
    <form onSubmit={onSubmit} className="px-5 py-4 border-b border-border-subtle bg-surface-alt/40">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_120px_auto] gap-3 items-end">
        <div>
          <label className="block text-xs text-ink-muted mb-1">รหัส</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="MARKETING"
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-muted mb-1">ป้ายชื่อ</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="การตลาด"
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-muted mb-1">ลำดับ</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm text-right"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-3 py-1.5 rounded bg-primary text-white text-sm hover:bg-primary-hover disabled:opacity-50"
        >
          เพิ่ม
        </button>
      </div>
      {error ? <div className="text-xs text-red-600 mt-2">{error}</div> : null}
      <p className="text-[11px] text-ink-muted mt-2">
        รหัสคือ identifier ถาวรที่บันทึกในเทมเพลตทุกตัว — เลือกค่าที่ไม่คิดจะเปลี่ยนชื่อ
        ใช้ตัวอักษรพิมพ์ใหญ่ ตัวเลข และขีดล่าง
      </p>
    </form>
  );
}
