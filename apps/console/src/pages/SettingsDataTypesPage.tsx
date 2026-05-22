import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import {
  createDataType,
  deleteDataType,
  INPUT_TYPE_OPTIONS,
  listDataTypes,
  updateDataType,
  type DataTypeDto,
  type DataTypeOption,
  type InputType,
} from '../lib/api/dataTypes';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useCan } from '../lib/auth/useCan';

const SHOW_OPTIONS_FOR = new Set<InputType>(['select', 'radio']);

function dtSnapshot(d: DataTypeDto): string {
  return JSON.stringify({
    label: d.label,
    defaultInputType: d.defaultInputType,
    description: d.description ?? null,
    options: d.options ?? null,
    defaultValue: d.defaultValue ?? null,
    suggestedValues: d.suggestedValues ?? null,
    sortOrder: d.sortOrder,
  });
}

export default function SettingsDataTypesPage() {
  const canManage = useCan('settings:field-types:manage');
  const queryClient = useQueryClient();
  const dataTypesQuery = useQuery({
    queryKey: queryKeys.dataTypes.list(),
    queryFn: () => listDataTypes(),
  });

  const [edited, setEdited] = useState<DataTypeDto[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (dataTypesQuery.data?.data) {
      setEdited(dataTypesQuery.data.data.map((d) => ({ ...d })));
    }
  }, [dataTypesQuery.data]);

  const dirtyById = useMemo(() => {
    const map = new Map<string, boolean>();
    const original = new Map(
      (dataTypesQuery.data?.data ?? []).map((d) => [d.id, d]),
    );
    for (const d of edited) {
      const o = original.get(d.id);
      const isDirty = !o || dtSnapshot(o) !== dtSnapshot(d);
      map.set(d.id, !!isDirty);
    }
    return map;
  }, [edited, dataTypesQuery.data]);

  const updateRow = (id: string, updates: Partial<DataTypeDto>) => {
    setEdited((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const persistRow = (row: DataTypeDto) =>
    updateDataType(row.id, {
      label: row.label,
      defaultInputType: row.defaultInputType,
      description: row.description ?? null,
      options: row.options ?? null,
      defaultValue: row.defaultValue ?? null,
      suggestedValues: row.suggestedValues ?? null,
      sortOrder: row.sortOrder,
    });

  const saveMutation = useMutation({
    mutationFn: persistRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataTypes.all });
    },
  });

  const dirtyRows = useMemo(
    () => edited.filter((d) => dirtyById.get(d.id)),
    [edited, dirtyById],
  );

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      for (const row of dirtyRows) await persistRow(row);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataTypes.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDataType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataTypes.all });
    },
  });

  // New-row form
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newInput, setNewInput] = useState<InputType>('text');
  const createMutation = useMutation({
    mutationFn: () =>
      createDataType({
        code: newCode,
        label: newLabel,
        defaultInputType: newInput,
      }),
    onSuccess: () => {
      setNewCode('');
      setNewLabel('');
      setNewInput('text');
      queryClient.invalidateQueries({ queryKey: queryKeys.dataTypes.all });
    },
  });

  return (
    <div>
      <PageHeader
        title="ประเภทฟิลด์"
        description="กำหนดประเภทข้อมูลที่ใช้ได้กับ placeholder ของเทมเพลต ตัวควบคุมการกรอกค่าเริ่มต้น และตัวเลือก (สำหรับ select/radio)"
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">
                {dirtyRows.length > 0
                  ? `มี ${dirtyRows.length} รายการที่ยังไม่ได้บันทึก`
                  : 'บันทึกครบทั้งหมดแล้ว'}
              </span>
              <Button
                variant="outline"
                disabled={dirtyRows.length === 0 || saveAllMutation.isPending}
                onClick={() => {
                  if (dataTypesQuery.data?.data) {
                    setEdited(dataTypesQuery.data.data.map((d) => ({ ...d })));
                  }
                }}
              >
                <RotateCcw className="w-4 h-4" /> รีเซ็ตทั้งหมด
              </Button>
              <Button
                disabled={dirtyRows.length === 0 || saveAllMutation.isPending}
                onClick={() => saveAllMutation.mutate()}
              >
                {saveAllMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                บันทึกการเปลี่ยนแปลงทั้งหมด
              </Button>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">อ่านอย่างเดียว — ต้องมีสิทธิ์จัดการเพื่อแก้ไข</span>
          )
        }
      />

      <section className="px-6 py-6 space-y-6">
        {dataTypesQuery.isLoading ? <PageLoader /> : null}
        {dataTypesQuery.error ? <ErrorMessage error={dataTypesQuery.error} /> : null}
        {saveMutation.error ? <ErrorMessage error={saveMutation.error} /> : null}
        {saveAllMutation.error ? <ErrorMessage error={saveAllMutation.error} /> : null}
        {deleteMutation.error ? <ErrorMessage error={deleteMutation.error} /> : null}

        {edited.length > 0 ? (
          <div className="rounded-md border border-border-default bg-white overflow-hidden">
            <ul className="divide-y divide-border-default">
              {edited.map((d) => {
                const isDirty = dirtyById.get(d.id) ?? false;
                const isOpen = !!expanded[d.id];
                const showOptions = SHOW_OPTIONS_FOR.has(d.defaultInputType);
                return (
                  <li key={d.id} className="">
                    {/* Top summary row */}
                    <div className="grid grid-cols-[28px_140px_minmax(160px,1fr)_minmax(160px,200px)_minmax(180px,1fr)_80px_180px] gap-3 px-4 py-3 items-center">
                      <button
                        onClick={() => toggleExpanded(d.id)}
                        className="text-ink-muted hover:text-ink"
                        title={isOpen ? 'ย่อ' : 'ขยายรายละเอียด'}
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <code className="font-mono text-xs text-ink truncate" title={d.code}>
                        {d.code}
                        {d.isBuiltIn ? (
                          <span className="ml-1 text-[10px] uppercase tracking-wide text-primary">
                            ติดมากับระบบ
                          </span>
                        ) : null}
                      </code>
                      <input
                        type="text"
                        value={d.label}
                        onChange={(e) => updateRow(d.id, { label: e.target.value })}
                        className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        value={d.defaultInputType}
                        onChange={(e) =>
                          updateRow(d.id, {
                            defaultInputType: e.target.value as InputType,
                          })
                        }
                        className="px-2 py-1.5 text-sm rounded border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {INPUT_TYPE_OPTIONS.map((i) => (
                          <option key={i.code} value={i.code}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={d.description ?? ''}
                        onChange={(e) =>
                          updateRow(d.id, { description: e.target.value })
                        }
                        placeholder="(ไม่บังคับ)"
                        className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        value={d.sortOrder}
                        onChange={(e) =>
                          updateRow(d.id, { sortOrder: Number(e.target.value) })
                        }
                        className="px-2 py-1.5 text-sm rounded border border-border-default text-center focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex items-center justify-end gap-1 min-w-0">
                        {isDirty ? (
                          <button
                            onClick={() => {
                              const orig = (dataTypesQuery.data?.data ?? []).find(
                                (o) => o.id === d.id,
                              );
                              if (orig) updateRow(d.id, { ...orig });
                            }}
                            className="p-1.5 rounded hover:bg-surface-alt text-ink-muted flex-shrink-0"
                            title="รีเซ็ตแถวนี้"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : null}
                        <Button
                          size="sm"
                          disabled={!isDirty || saveMutation.isPending}
                          onClick={() => saveMutation.mutate(d)}
                          className="flex-shrink-0"
                        >
                          {saveMutation.isPending ? (
                            <Spinner className="text-white" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          บันทึก
                        </Button>
                        {!d.isBuiltIn ? (
                          <button
                            onClick={() => {
                              if (confirm(`ลบประเภทข้อมูล "${d.code}" หรือไม่?`)) {
                                deleteMutation.mutate(d.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 flex-shrink-0"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Expandable detail panel: options + default value + suggested values */}
                    {isOpen ? (
                      <div className="bg-surface-alt/40 border-t border-border-default px-12 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Options editor — shown for select/radio data types. */}
                        <div>
                          <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                            ตัวเลือก {showOptions ? '' : '(ใช้เฉพาะกับอินพุตแบบ Dropdown / Radio group)'}
                          </h4>
                          <OptionsEditor
                            options={d.options ?? []}
                            onChange={(next) =>
                              updateRow(d.id, {
                                options: next.length > 0 ? next : null,
                              })
                            }
                          />
                          <div className="text-[11px] text-ink-muted mt-2 space-y-1">
                            <p>
                              <strong>ค่าที่ถูกเขียน</strong> = ค่าที่จะถูกใส่ใน placeholder ของ
                              DOCX เมื่อผู้ใช้เลือกตัวเลือกนี้
                              <strong> ป้ายชื่อที่แสดง</strong> = สิ่งที่ผู้ใช้เห็นในฟอร์ม
                            </p>
                            <p>
                              ตัวอย่าง:
                              <br />
                              • เพศใส่ใน <code>{'{{sex}}'}</code> เป็นข้อความ
                              → <code>{'{value:"M",label:"ชาย"}'}</code>,{' '}
                              <code>{'{value:"F",label:"หญิง"}'}</code> — เมื่อเลือก
                              ชาย จะเขียน <code>M</code>
                              <br />
                              • เพศใส่ใน <code>{'[{{sex}}]'}</code> เป็นเครื่องหมายติ๊ก
                              → <code>{'{value:"/",label:"ชาย"}'}</code>,{' '}
                              <code>{'{value:"",label:"หญิง"}'}</code> — เมื่อเลือก
                              ชาย จะเขียน <code>/</code> (วงเล็บแสดงเป็น{' '}
                              <code>[/]</code>) ส่วนหญิงทำให้วงเล็บว่าง
                            </p>
                            <p>
                              ใช้ปุ่ม <strong>ตั้งเครื่องหมาย /</strong> เพื่อเติมค่าด้วย <code>/</code> ในคลิกเดียว
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                              ค่าเริ่มต้น
                            </h4>
                            <input
                              type="text"
                              value={d.defaultValue ?? ''}
                              onChange={(e) =>
                                updateRow(d.id, {
                                  defaultValue: e.target.value || null,
                                })
                              }
                              placeholder="(ไม่มี)"
                              className="w-full px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-[11px] text-ink-muted mt-1">
                              เติมค่าล่วงหน้าให้กับอินพุตใหม่ที่ใช้ประเภทข้อมูลนี้
                            </p>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                              ค่าที่แนะนำ
                            </h4>
                            <SuggestionsEditor
                              values={d.suggestedValues ?? []}
                              onChange={(next) =>
                                updateRow(d.id, {
                                  suggestedValues: next.length > 0 ? next : null,
                                })
                              }
                            />
                            <p className="text-[11px] text-ink-muted mt-1">
                              แสดงเป็นชิปตัวเลือกด่วนข้างอินพุตในฟอร์ม
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {canManage ? (
        <div className="rounded-md border border-border-default bg-white p-4">
          <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            เพิ่มประเภทข้อมูลแบบกำหนดเอง
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCode.trim() && newLabel.trim()) createMutation.mutate();
            }}
            className="grid grid-cols-1 md:grid-cols-[140px_1fr_200px_auto] gap-3 items-start"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">รหัส</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="เช่น invoice_no"
                className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">ป้ายชื่อ</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="เลขที่ใบแจ้งหนี้"
                className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">อินพุตเริ่มต้น</label>
              <select
                value={newInput}
                onChange={(e) => setNewInput(e.target.value as InputType)}
                className="px-2 py-1.5 text-sm rounded border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {INPUT_TYPE_OPTIONS.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={
                  !newCode.trim() ||
                  !newLabel.trim() ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                สร้าง
              </Button>
            </div>
          </form>
          {createMutation.error ? (
            <ErrorMessage error={createMutation.error} className="mt-2" />
          ) : null}
          <p className="text-[11px] text-ink-muted mt-3">
            รหัสต้องเป็นตัวอักษรพิมพ์เล็ก ตัวเลข ขีดล่าง หรือยัติภังค์เท่านั้น
            ประเภทที่ติดมากับระบบสามารถเปลี่ยนชื่อ เปลี่ยนแปลงตัวเลือก/ค่าเริ่มต้นได้
            (แต่ลบไม่ได้) คลิกที่ลูกศรของแถวเพื่อขยายดูตัวเลือก ค่าเริ่มต้น และค่าที่แนะนำ
          </p>
        </div>
        ) : null}
      </section>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: DataTypeOption[];
  onChange: (next: DataTypeOption[]) => void;
}) {
  const update = (idx: number, updates: Partial<DataTypeOption>) =>
    onChange(options.map((o, i) => (i === idx ? { ...o, ...updates } : o)));
  const remove = (idx: number) => onChange(options.filter((_, i) => i !== idx));
  const add = () => onChange([...options, { value: '', label: '' }]);

  return (
    <div className="space-y-2">
      {options.length > 0 ? (
        <div className="grid grid-cols-[120px_1fr_60px_36px] gap-2 text-[10px] uppercase tracking-wide text-ink-muted font-medium">
          <div title="ค่าที่ใส่ใน placeholder ของ DOCX เมื่อเลือกตัวเลือกนี้">
            ค่าที่ถูกเขียน
          </div>
          <div title="สิ่งที่ผู้ใช้เห็นในฟอร์ม">ป้ายชื่อที่แสดง</div>
          <div className="text-center">ติ๊ก</div>
          <div />
        </div>
      ) : null}
      {options.length === 0 ? (
        <p className="text-xs text-ink-muted italic">ยังไม่มีตัวเลือก</p>
      ) : (
        options.map((opt, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[120px_1fr_60px_36px] gap-2 items-center"
          >
            <input
              type="text"
              value={opt.value}
              onChange={(e) => update(idx, { value: e.target.value })}
              placeholder='เช่น M หรือ /'
              title="สิ่งที่จะถูกเขียนใน placeholder ของ DOCX เมื่อผู้ใช้เลือกตัวเลือกนี้"
              className="px-2 py-1.5 text-sm rounded border border-border-default font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={opt.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              placeholder="เช่น ชาย"
              title="สิ่งที่ผู้ใช้เห็นในฟอร์ม"
              className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => update(idx, { value: '/' })}
              className={`px-2 py-1 text-xs rounded border ${
                opt.value === '/'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border-default hover:bg-surface-alt'
              }`}
              title='ตั้งค่าที่ถูกเขียนเป็น "/" อย่างรวดเร็ว เพื่อให้วงเล็บ [{{sex}}] แสดงเป็น [/]'
            >
              ตั้ง /
            </button>
            <button
              onClick={() => remove(idx)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              title="ลบตัวเลือก"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="w-3.5 h-3.5" /> เพิ่มตัวเลือก
      </Button>
    </div>
  );
}

function SuggestionsEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {v}
              <button
                onClick={() => remove(v)}
                className="text-primary/70 hover:text-primary"
                title="ลบ"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="พิมพ์คำแนะนำแล้วกด Enter"
          className="flex-1 px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
          <Plus className="w-3.5 h-3.5" /> เพิ่ม
        </Button>
      </div>
    </div>
  );
}
