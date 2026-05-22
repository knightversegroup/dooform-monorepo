import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FieldDefinition } from '../../lib/api/types';
import { DEFAULT_TICK, consumedPlaceholders } from '../../lib/radioGroups';

interface RadioGroupModalProps {
  /** The master field being edited. */
  master: FieldDefinition;
  /** All current field definitions, used to list available placeholders. */
  allFields: FieldDefinition[];
  /** All raw placeholders detected in the DOCX (so we can offer ones not yet in fields). */
  allPlaceholders: string[];
  onClose: () => void;
  /**
   * Persists the radio group: the modal returns the updated master field
   * (with isRadioGroup + radioOptions) plus the set of consumed placeholders
   * that should be removed from the top-level field list.
   */
  onSave: (
    updatedMaster: FieldDefinition,
    consumedTopLevelPlaceholders: string[],
  ) => void;
}

interface OptionDraft {
  placeholder: string;
  label: string;
  value: string;
}

export function RadioGroupModal({
  master,
  allFields,
  allPlaceholders,
  onClose,
  onSave,
}: RadioGroupModalProps) {
  const [groupLabel, setGroupLabel] = useState(master.label ?? master.placeholder);
  const [options, setOptions] = useState<OptionDraft[]>(() => {
    if (master.isRadioGroup && master.radioOptions?.length) {
      return master.radioOptions.map((o) => ({
        placeholder: o.placeholder,
        label: o.label ?? o.placeholder,
        value: o.value ?? DEFAULT_TICK,
      }));
    }
    // Seed with the master placeholder as the first option.
    return [
      {
        placeholder: master.placeholder,
        label: master.label ?? master.placeholder,
        value: DEFAULT_TICK,
      },
    ];
  });

  // Placeholders already used by other radio groups can't be re-used here.
  const usedByOtherGroups = useMemo(() => {
    const all = consumedPlaceholders(
      allFields.filter((f) => f.placeholder !== master.placeholder),
    );
    return all;
  }, [allFields, master.placeholder]);

  // Available pool: every detected placeholder, minus ones already in this group,
  // minus ones consumed by *other* radio groups.
  const pool = useMemo(() => {
    const inGroup = new Set(options.map((o) => o.placeholder));
    return allPlaceholders.filter(
      (p) => !inGroup.has(p) && !usedByOtherGroups.has(p),
    );
  }, [allPlaceholders, options, usedByOtherGroups]);

  const [picking, setPicking] = useState('');

  useEffect(() => {
    if (pool.length > 0 && !picking) setPicking(pool[0]);
  }, [pool, picking]);

  const addOption = () => {
    if (!picking) return;
    setOptions((prev) => [
      ...prev,
      { placeholder: picking, label: picking, value: DEFAULT_TICK },
    ]);
    setPicking('');
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, updates: Partial<OptionDraft>) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...updates } : o)));
  };

  const canSave = options.length >= 2 && options.every((o) => o.placeholder.trim());

  const handleSave = () => {
    // The master placeholder must be one of the options. If the user removed it,
    // promote the first option to master.
    const masterPlaceholder = options.find((o) => o.placeholder === master.placeholder)
      ? master.placeholder
      : options[0].placeholder;

    const updated: FieldDefinition = {
      ...master,
      placeholder: masterPlaceholder,
      label: groupLabel.trim() || masterPlaceholder,
      dataType: 'choice',
      inputType: 'radio',
      isRadioGroup: true,
      radioGroupId:
        master.radioGroupId ?? `rg_${masterPlaceholder}_${Date.now().toString(36)}`,
      radioOptions: options.map((o) => ({
        placeholder: o.placeholder,
        label: o.label.trim() || o.placeholder,
        value: o.value || DEFAULT_TICK,
      })),
    };

    // Consumed = every option's placeholder EXCEPT the master (which keeps its row).
    const consumed = options
      .map((o) => o.placeholder)
      .filter((p) => p !== masterPlaceholder);

    onSave(updated, consumed);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <h2 className="text-lg font-semibold">แก้ไขกลุ่มเรดิโอ</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-ink-muted mb-1">ป้ายชื่อกลุ่ม</label>
            <input
              value={groupLabel}
              onChange={(e) => setGroupLabel(e.target.value)}
              placeholder="เช่น เพศ สถานภาพสมรส"
              className="w-full px-3 py-2 rounded-md border border-border-default text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-[11px] text-ink-muted mt-1">
              เมื่อผู้ใช้เลือกตัวเลือก placeholder ที่เลือกจะถูกเติมด้วยเครื่องหมายติ๊ก
              (ค่าเริ่มต้น <code className="font-mono">{DEFAULT_TICK}</code>) ส่วน placeholder
              ของตัวเลือกอื่นจะถูกเติมด้วยสตริงว่าง วงเล็บเช่น{' '}
              <code className="font-mono">[{'{{S_1_1}}'}]</code> ใน DOCX จะแสดงเป็น{' '}
              <code className="font-mono">[{DEFAULT_TICK}]</code> เมื่อถูกเลือก
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
              ตัวเลือก ({options.length})
            </h3>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div
                  key={opt.placeholder + ':' + idx}
                  className="grid grid-cols-[140px_1fr_70px_36px] gap-2 items-center"
                >
                  <code className="font-mono text-xs text-ink truncate" title={opt.placeholder}>
                    {'{{' + opt.placeholder + '}}'}
                  </code>
                  <input
                    value={opt.label}
                    onChange={(e) => updateOption(idx, { label: e.target.value })}
                    placeholder="ป้ายชื่อ (เช่น ชาย หญิง)"
                    className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={opt.value}
                    onChange={(e) => updateOption(idx, { value: e.target.value })}
                    placeholder="/"
                    title="อักขระติ๊กที่เขียนเมื่อเลือกตัวเลือกนี้"
                    className="px-2 py-1.5 text-sm rounded border border-border-default text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeOption(idx)}
                    disabled={options.length <= 1}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="ลบออกจากกลุ่ม"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {pool.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
                เพิ่ม placeholder อีก
              </h3>
              <div className="flex gap-2">
                <select
                  value={picking}
                  onChange={(e) => setPicking(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm rounded border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {pool.map((p) => (
                    <option key={p} value={p}>
                      {'{{' + p + '}}'}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={addOption} disabled={!picking}>
                  <Plus className="w-4 h-4" /> เพิ่มตัวเลือก
                </Button>
              </div>
              {usedByOtherGroups.size > 0 ? (
                <p className="text-[11px] text-ink-muted mt-2">
                  มี placeholder {usedByOtherGroups.size} ตัวอยู่ในกลุ่มเรดิโออื่นแล้ว
                  จึงไม่แสดงที่นี่
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">
              ไม่มี placeholder ให้เลือกแล้ว หากต้องการย้ายระหว่างกลุ่ม ให้ถอดตัวเลือกจากกลุ่มอื่นก่อน
            </p>
          )}

          {options.length < 2 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              กลุ่มเรดิโอต้องมีอย่างน้อย 2 ตัวเลือก
            </p>
          ) : null}
        </div>

        <div className="border-t border-border-default px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            บันทึกกลุ่ม
          </Button>
        </div>
      </div>
    </div>
  );
}
