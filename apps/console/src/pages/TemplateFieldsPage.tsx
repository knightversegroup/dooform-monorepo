import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Layers,
  Link as LinkIcon,
  RotateCcw,
  Save,
  Sparkles,
  Unlink,
} from 'lucide-react';
import {
  getFieldDefinitions,
  getPlaceholders,
  getTemplate,
  regenerateFieldDefinitions,
  updateFieldDefinitions,
} from '../lib/api/templates';
import {
  INPUT_TYPE_OPTIONS,
  listDataTypes,
} from '../lib/api/dataTypes';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { RadioGroupModal } from '../components/template/RadioGroupModal';
import { consumedPlaceholders, DEFAULT_TICK } from '../lib/radioGroups';
import type { FieldDefinition } from '../lib/api/types';

export default function TemplateFieldsPage() {
  const { templateId = '' } = useParams();
  const queryClient = useQueryClient();

  const templateQuery = useQuery({
    queryKey: queryKeys.templates.detail(templateId),
    queryFn: () => getTemplate(templateId),
    enabled: !!templateId,
  });
  const fieldsQuery = useQuery({
    queryKey: queryKeys.templates.fieldDefinitions(templateId),
    queryFn: () => getFieldDefinitions(templateId),
    enabled: !!templateId,
  });
  const placeholdersQuery = useQuery({
    queryKey: queryKeys.templates.placeholders(templateId),
    queryFn: () => getPlaceholders(templateId),
    enabled: !!templateId,
  });
  const dataTypesQuery = useQuery({
    queryKey: queryKeys.dataTypes.list(),
    queryFn: () => listDataTypes(),
  });

  const dataTypes = dataTypesQuery.data?.data ?? [];
  const dataTypeByCode = useMemo(
    () => new Map(dataTypes.map((d) => [d.code, d])),
    [dataTypes],
  );

  const allPlaceholders = placeholdersQuery.data?.placeholders ?? [];

  const [edited, setEdited] = useState<FieldDefinition[]>([]);
  const [groupModalIdx, setGroupModalIdx] = useState<number | null>(null);

  useEffect(() => {
    if (fieldsQuery.data?.fieldDefinitions) {
      setEdited(fieldsQuery.data.fieldDefinitions.map((f) => ({ ...f })));
    }
  }, [fieldsQuery.data]);

  const isDirty = useMemo(() => {
    const original = fieldsQuery.data?.fieldDefinitions ?? [];
    return JSON.stringify(original) !== JSON.stringify(edited);
  }, [edited, fieldsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => updateFieldDefinitions(templateId, edited),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.fieldDefinitions(templateId),
      });
    },
  });

  const regenMutation = useMutation({
    mutationFn: () => regenerateFieldDefinitions(templateId),
    onSuccess: (res) => {
      queryClient.setQueryData(
        queryKeys.templates.fieldDefinitions(templateId),
        res,
      );
    },
  });

  const updateField = (idx: number, updates: Partial<FieldDefinition>) => {
    setEdited((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)),
    );
  };

  // When the data-type catalog loads (or gets edited globally), align every field's
  // inputType to its data type's current defaultInputType. This keeps the table in
  // sync with /settings/field-types without the user having to re-pick rows.
  useEffect(() => {
    if (dataTypes.length === 0) return;
    setEdited((prev) =>
      prev.map((f) => {
        if (f.isRadioGroup) return f;
        const dt = dataTypeByCode.get(f.dataType ?? '');
        if (!dt) return f;
        if (f.inputType === dt.defaultInputType) return f;
        return { ...f, inputType: dt.defaultInputType };
      }),
    );
  }, [dataTypeByCode, dataTypes.length]);

  const handleRadioSave = (
    masterIdx: number,
    updatedMaster: FieldDefinition,
    consumed: string[],
  ) => {
    setEdited((prev) => {
      const next = prev.map((f, i) => (i === masterIdx ? updatedMaster : f));
      // Remove rows whose placeholder was consumed by this group.
      const consumedSet = new Set(consumed);
      return next.filter(
        (f, i) => i === masterIdx || !consumedSet.has(f.placeholder),
      );
    });
    setGroupModalIdx(null);
  };

  const handleUngroup = (idx: number) => {
    setEdited((prev) => {
      const f = prev[idx];
      if (!f?.isRadioGroup || !f.radioOptions?.length) return prev;
      // Re-add each non-master option as its own plain text field.
      const restored: FieldDefinition[] = f.radioOptions
        .filter((o) => o.placeholder !== f.placeholder)
        .map((o) => ({
          placeholder: o.placeholder,
          label: o.label ?? o.placeholder,
          dataType: 'text',
          inputType: 'text',
        }));
      const masterCleaned: FieldDefinition = {
        ...f,
        isRadioGroup: false,
        radioGroupId: undefined,
        radioOptions: undefined,
        dataType: 'text',
        inputType: 'text',
      };
      return [
        ...prev.slice(0, idx),
        masterCleaned,
        ...restored,
        ...prev.slice(idx + 1),
      ];
    });
  };

  const tpl = templateQuery.data;
  const groupConsumed = useMemo(() => consumedPlaceholders(edited), [edited]);

  return (
    <div>
      <PageHeader
        title="ตั้งค่าฟิลด์"
        description={
          tpl
            ? `กำหนดประเภทข้อมูลและตัวควบคุมการกรอกของแต่ละ placeholder ใน “${tpl.displayName ?? tpl.name}”`
            : 'กำหนดประเภทข้อมูลและตัวควบคุมการกรอกของแต่ละ placeholder'
        }
        breadcrumbs={
          <Link
            to={`/templates/${templateId}`}
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> กลับไปยังเทมเพลต
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => regenMutation.mutate()}
              disabled={regenMutation.isPending}
              title="ตรวจหา placeholder จาก DOCX ใหม่ การกระทำนี้จะเขียนทับการแก้ไขด้วยมือ"
            >
              {regenMutation.isPending ? <Spinner /> : <Sparkles className="w-4 h-4" />}
              ตรวจหาจาก DOCX อัตโนมัติ
            </Button>
            <Button
              variant="outline"
              disabled={!isDirty || saveMutation.isPending}
              onClick={() =>
                setEdited(
                  (fieldsQuery.data?.fieldDefinitions ?? []).map((f) => ({ ...f })),
                )
              }
            >
              <RotateCcw className="w-4 h-4" /> รีเซ็ต
            </Button>
            <Button
              disabled={!isDirty || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <Spinner className="text-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              บันทึกฟิลด์
            </Button>
          </div>
        }
      />

      <section className="px-6 py-6">
        {fieldsQuery.isLoading ? <PageLoader /> : null}
        {fieldsQuery.error ? <ErrorMessage error={fieldsQuery.error} /> : null}
        {regenMutation.error ? (
          <ErrorMessage error={regenMutation.error} className="mb-4" />
        ) : null}
        {saveMutation.error ? (
          <ErrorMessage error={saveMutation.error} className="mb-4" />
        ) : null}

        {edited.length === 0 && !fieldsQuery.isLoading ? (
          <div className="rounded-md border border-border-default p-6 text-sm text-ink-muted bg-white">
            ไม่พบ placeholder ในเทมเพลตนี้ หาก DOCX มีรูปแบบ{' '}
            <code className="font-mono">{'{{name}}'}</code> ให้คลิก
            "ตรวจหาจาก DOCX อัตโนมัติ" ด้านบน
          </div>
        ) : null}

        {edited.length > 0 ? (
          <div className="rounded-md border border-border-default bg-white overflow-hidden">
            <div className="grid grid-cols-[minmax(140px,1fr)_minmax(160px,1fr)_minmax(160px,180px)_minmax(140px,160px)_70px_140px] gap-3 px-4 py-2 bg-surface-alt text-xs font-medium uppercase tracking-wide text-ink-muted">
              <div>Placeholder</div>
              <div>ป้ายชื่อ</div>
              <div>ประเภทข้อมูล</div>
              <div>ตัวควบคุมการกรอก</div>
              <div className="text-center">บังคับ</div>
              <div className="text-right">กลุ่ม</div>
            </div>
            <ul className="divide-y divide-border-default">
              {edited.map((field, idx) => {
                const isGroup = !!field.isRadioGroup;
                return (
                  <li
                    key={field.placeholder + ':' + idx}
                    className={`grid grid-cols-[minmax(140px,1fr)_minmax(160px,1fr)_minmax(160px,180px)_minmax(140px,160px)_70px_140px] gap-3 px-4 py-3 items-center ${
                      isGroup ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <code
                        className="font-mono text-xs text-ink truncate block"
                        title={field.placeholder}
                      >
                        {'{{' + field.placeholder + '}}'}
                      </code>
                      {isGroup && field.radioOptions?.length ? (
                        <div className="text-[10px] text-primary mt-0.5">
                          + ตัวเลือกอีก {field.radioOptions.length - 1} รายการ
                        </div>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      value={field.label ?? ''}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      placeholder={field.placeholder}
                      className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={field.dataType ?? 'text'}
                      onChange={(e) => {
                        const code = e.target.value;
                        const target = dataTypeByCode.get(code);
                        // The input control is ALWAYS the data type's defaultInputType.
                        // To change the control, edit the data type in /settings/field-types.
                        updateField(idx, {
                          dataType: code,
                          inputType: target?.defaultInputType ?? 'text',
                        });
                      }}
                      disabled={isGroup}
                      className="px-2 py-1.5 text-sm rounded border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-alt disabled:text-ink-muted"
                    >
                      {dataTypes.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      // Display-only: the input control is derived from the data type.
                      const resolvedDataType = dataTypeByCode.get(field.dataType ?? 'text');
                      const resolvedInput =
                        resolvedDataType?.defaultInputType ?? field.inputType ?? 'text';
                      const inputLabel =
                        INPUT_TYPE_OPTIONS.find((i) => i.code === resolvedInput)
                          ?.label ?? resolvedInput;
                      return (
                        <span
                          className="px-2 py-1.5 text-xs rounded border border-border-default bg-surface-alt text-ink-muted truncate"
                          title={`สืบทอดจากประเภทข้อมูล "${
                            resolvedDataType?.label ?? field.dataType
                          }" — เปลี่ยนได้ที่ /settings/field-types`}
                        >
                          {inputLabel}
                        </span>
                      );
                    })()}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={!!field.required}
                        onChange={(e) =>
                          updateField(idx, { required: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      {isGroup ? (
                        <>
                          <button
                            onClick={() => setGroupModalIdx(idx)}
                            className="px-2 py-1 text-xs rounded border border-border-default hover:bg-surface-alt"
                            title="แก้ไขตัวเลือกกลุ่ม"
                          >
                            <LinkIcon className="w-3 h-3 inline" /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleUngroup(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="ยกเลิกกลุ่มนี้"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setGroupModalIdx(idx)}
                          className="px-2 py-1 text-xs rounded border border-border-default hover:bg-surface-alt"
                          title="จัดกลุ่ม placeholder นี้กับ placeholder อื่นเป็นตัวควบคุมแบบเรดิโอ"
                        >
                          <Layers className="w-3 h-3 inline" /> จัดกลุ่ม
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {edited.length > 0 ? (
          <div className="text-xs text-ink-muted mt-3 space-y-1">
            <p>
              การบันทึกจะอัปเดต metadata ของฟิลด์ในเทมเพลต ฟอร์มกรอกและมุมมองแก้ไขเอกสารจะใช้
              ประเภทใหม่เมื่อโหลดครั้งถัดไป
            </p>
            <p>
              คอลัมน์ "ตัวควบคุมการกรอก" เป็นแบบอ่านอย่างเดียว — จะเป็นไปตามค่าเริ่มต้นของประเภทข้อมูลที่เลือก
              หากต้องการเปลี่ยนตัวควบคุมแบบทั่วทั้งระบบ (เช่น ให้ "เบอร์โทรศัพท์" ใช้ textarea แทน tel)
              ให้แก้ไขประเภทข้อมูลใน{' '}
              <Link to="/settings/field-types" className="text-primary hover:underline">
                /settings/field-types
              </Link>
            </p>
            <p>
              กลุ่มเรดิโอ: placeholder ของตัวเลือกที่ถูกเลือกจะถูกเติมด้วย{' '}
              <code className="font-mono">{DEFAULT_TICK}</code>  ส่วนตัวอื่นจะเป็นสตริงว่าง
              วงเล็บเช่น{' '}
              <code className="font-mono">[{'{{S_1_1}}'}]</code> ใน DOCX จะแสดงเป็นช่องติ๊กหรือช่องว่าง
            </p>
            {groupConsumed.size > 0 ? (
              <p>
                มี placeholder {groupConsumed.size} รายการถูกใช้งานโดยกลุ่มเรดิโอ
                (ถูกซ่อนจากรายการระดับบน)
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {groupModalIdx !== null && edited[groupModalIdx] ? (
        <RadioGroupModal
          master={edited[groupModalIdx]}
          allFields={edited}
          allPlaceholders={allPlaceholders}
          onClose={() => setGroupModalIdx(null)}
          onSave={(updated, consumed) =>
            handleRadioSave(groupModalIdx, updated, consumed)
          }
        />
      ) : null}
    </div>
  );
}
