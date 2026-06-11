import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import {
  getFieldDefinitions,
  getTemplate,
  generateLivePdfPreview,
} from '../lib/api/templates';
import { processTemplate } from '../lib/api/documents';
import { expandAllRadioGroups } from '../lib/radioGroups';
import { listDataTypes, type DataTypeDto } from '../lib/api/dataTypes';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { FieldDefinition } from '../lib/api/types';

export default function FormFillPage() {
  const { templateId = '' } = useParams();
  const navigate = useNavigate();

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

  const fields = useMemo<FieldDefinition[]>(
    () => fieldsQuery.data?.fieldDefinitions ?? [],
    [fieldsQuery.data]
  );

  const dataTypesQuery = useQuery({
    queryKey: queryKeys.dataTypes.list(),
    queryFn: () => listDataTypes(),
  });
  const dataTypeByCode = useMemo(
    () =>
      new Map((dataTypesQuery.data?.data ?? []).map((d) => [d.code, d])),
    [dataTypesQuery.data],
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [filename, setFilename] = useState<string>('');
  const [filenameTouched, setFilenameTouched] = useState(false);

  useEffect(() => {
    if (!fields.length) return;
    setValues((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const f of fields) {
        if (next[f.placeholder] === undefined) {
          // Pre-fill order: field-level defaultValue → data type defaultValue → empty.
          const fromDataType =
            dataTypeByCode.get(f.dataType ?? '')?.defaultValue ?? '';
          next[f.placeholder] = f.defaultValue ?? fromDataType ?? '';
        }
      }
      return next;
    });
  }, [fields, dataTypeByCode]);

  // Default the filename to the template's display name once it loads. Stop
  // auto-syncing the moment the user types their own.
  useEffect(() => {
    if (filenameTouched) return;
    const tplName = templateQuery.data?.displayName ?? templateQuery.data?.name;
    if (tplName) setFilename(tplName);
  }, [templateQuery.data, filenameTouched]);

  const submitMutation = useMutation({
    mutationFn: () =>
      processTemplate(templateId, expandAllRadioGroups(values, fields), {
        filename: filename.trim() || undefined,
      }),
    onSuccess: (doc) => {
      navigate(`/documents/${doc.id}`);
    },
  });

  const tpl = templateQuery.data;
  const isLoading = templateQuery.isLoading || fieldsQuery.isLoading;

  // Live PDF preview state
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const pdfDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // For the live preview we feed the EXPANDED values (radio-group masters get
  // turned into per-placeholder ticks) so brackets render `[/]` vs `[ ]` in real
  // time as the user picks an option.
  const previewValues = useMemo(
    () => expandAllRadioGroups(values, fields),
    [values, fields],
  );

  // Generate live PDF when values change
  useEffect(() => {
    if (!tpl?.id) return;

    if (pdfDebounceRef.current) clearTimeout(pdfDebounceRef.current);

    pdfDebounceRef.current = setTimeout(async () => {
      setPdfLoading(true);
      setPdfError(null);
      try {
        const blob = await generateLivePdfPreview(tpl.id, previewValues);
        // Convert PDF blob to page images using pdf.js
        const arrayBuffer = await blob.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        // Set worker from CDN
        // Use local worker file (copied to public/ folder) - no external CDN dependency
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          pages.push(canvas.toDataURL('image/png'));
        }
        setPdfPages(pages);
        setCurrentPage(0);
      } catch (err) {
        setPdfError(err instanceof Error ? err.message : 'สร้าง PDF ไม่สำเร็จ');
      } finally {
        setPdfLoading(false);
      }
    }, 600);

    return () => {
      if (pdfDebounceRef.current) clearTimeout(pdfDebounceRef.current);
    };
  }, [tpl?.id, previewValues]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden"> 
      <PageHeader
        title={`กรอก: ${tpl?.displayName ?? tpl?.name ?? 'เทมเพลต'}`}
        description="กรอกฟิลด์ด้านล่างและสร้างเอกสาร"
        breadcrumbs={
          <Link
            to={`/templates/${templateId}`}
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> กลับไปยังเทมเพลต
          </Link>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-0 flex-1 min-h-0 overflow-hidden">
        <div className="px-6 py-6 border-r border-border-default overflow-y-auto">
          {isLoading ? <PageLoader /> : null}
          {fieldsQuery.error ? (
            <ErrorMessage error={fieldsQuery.error} className="mb-4" />
          ) : null}

          {!isLoading && fields.length === 0 ? (
            <p className="text-sm text-ink-muted">
              เทมเพลตนี้ไม่พบฟิลด์
            </p>
          ) : null}

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
          >
            <div className="flex flex-col gap-1 pb-3 border-b border-border-default">
              <label htmlFor="document-filename" className="text-sm font-medium text-ink-subtle">
                ชื่อเอกสาร
              </label>
              <input
                id="document-filename"
                type="text"
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value);
                  setFilenameTouched(true);
                }}
                placeholder="เช่น แบบประเมิน - สมชาย ใจดี"
                className="w-full px-3 py-2 rounded-md border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <span className="text-xs text-ink-muted">
                บันทึกเป็น <code className="font-mono">{(filename.trim() || 'document').replace(/\.docx$/i, '')}.docx</code>
              </span>
            </div>

            {fields.map((field) => (
              <div key={field.placeholder}>
                <FieldRow
                  field={field}
                  dataType={dataTypeByCode.get(field.dataType ?? '')}
                  value={values[field.placeholder] ?? ''}
                  onChange={(v) =>
                    setValues((prev) => ({ ...prev, [field.placeholder]: v }))
                  }
                />
              </div>
            ))}

            {submitMutation.error ? (
              <ErrorMessage error={submitMutation.error} />
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default -mx-6 px-6 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/templates/${templateId}`)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitMutation.isPending || !fields.length}>
                {submitMutation.isPending ? (
                  <>
                    <Spinner className="text-white" />
                    กำลังสร้าง…
                  </>
                ) : (
                  'สร้างเอกสาร'
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col bg-surface-alt flex-1 min-h-0">
          <div className="flex items-center gap-1 border-b border-border-default bg-white px-3 py-2">
            <span className="text-xs font-medium text-ink-default">PDF Live</span>
            <span className="text-[11px] text-ink-muted ml-2">
              {pdfLoading ? 'กำลังสร้าง PDF...' : 'อัปเดตหลังหยุดพิมพ์'}
            </span>
          </div>
          {tpl ? (
              <div className="flex flex-col flex-1 min-h-0 bg-gray-100">
                {pdfError ? (
                  <div className="p-4">
                    <ErrorMessage error={pdfError} />
                  </div>
                ) : pdfLoading && pdfPages.length === 0 ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-sm text-ink-muted">กำลังสร้าง PDF...</div>
                  </div>
                ) : pdfPages.length > 0 ? (
                  <>
                    <div
                      className={`flex-1 min-h-0 p-4 ${zoom > 1 ? 'overflow-auto' : 'flex items-center justify-center'}`}
                      onWheel={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          e.preventDefault();
                          setZoom((z) => Math.max(1, z - e.deltaY * 0.01));
                        }
                      }}
                    >
                      <img
                        src={pdfPages[currentPage]}
                        alt={`Page ${currentPage + 1}`}
                        className="shadow-lg bg-white"
                        style={zoom === 1 ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } : { transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4 py-2 bg-white border-t border-border-default">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                          disabled={zoom <= 1}
                          className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                          title="ซูมออก"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-ink-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button
                          type="button"
                          onClick={() => setZoom((z) => z + 0.25)}
                          disabled={false}
                          className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                          title="ซูมเข้า"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                      {pdfPages.length > 1 && (
                        <div className="flex items-center gap-1 border-l border-border-default pl-4">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-sm text-ink-muted">
                            {currentPage + 1} / {pdfPages.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(pdfPages.length - 1, p + 1))}
                            disabled={currentPage === pdfPages.length - 1}
                            className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-sm text-ink-muted">กำลังโหลด...</div>
                  </div>
                )}
              </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


function FieldRow({
  field,
  dataType,
  value,
  onChange,
}: {
  field: FieldDefinition;
  dataType: DataTypeDto | undefined;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = field.label || field.placeholder;
  const required = field.required ?? false;
  const id = `f-${field.placeholder}`;

  // Resolution order:
  //   1. Radio groups always render multi-placeholder radios (template-level).
  //   2. Otherwise, use the data type's defaultInputType for the control.
  //   3. Choices come from the data type's `options` (settings/field-types).
  //   4. Field-level options (legacy) fall back if the data type has none.
  const resolvedInput =
    field.isRadioGroup
      ? 'radio-group'
      : (dataType?.defaultInputType ?? field.inputType ?? 'text');
  const choices =
    (dataType?.options && dataType.options.length > 0
      ? dataType.options
      : field.options ?? []) || [];
  const suggestions = dataType?.suggestedValues ?? [];

  const baseInput =
    'w-full px-3 py-2 rounded-md border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  const renderControl = () => {
    if (resolvedInput === 'radio-group' && field.radioOptions?.length) {
      // Radio group across multiple DOCX placeholders. Master key = selected placeholder.
      return (
        <div className="flex flex-col gap-2">
          {field.radioOptions.map((opt) => (
            <label
              key={opt.placeholder}
              className="inline-flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name={field.placeholder}
                value={opt.placeholder}
                checked={value === opt.placeholder}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>{opt.label || opt.placeholder}</span>
              <code className="text-[10px] text-ink-muted font-mono">
                {'{{' + opt.placeholder + '}}'}
              </code>
            </label>
          ))}
        </div>
      );
    }

    if (resolvedInput === 'textarea') {
      return (
        <textarea
          id={id}
          name={field.placeholder}
          required={required}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={baseInput}
        />
      );
    }

    if (resolvedInput === 'select') {
      return (
        <select
          id={id}
          name={field.placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        >
          <option value="">— เลือก —</option>
          {choices.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (resolvedInput === 'radio') {
      return (
        <div className="flex flex-wrap gap-3">
          {choices.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name={field.placeholder}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }

    if (resolvedInput === 'checkbox') {
      // Treat as a single Yes/No checkbox writing the data type's first option value
      // (or "yes"/"no") into the placeholder.
      const onValue = choices[0]?.value ?? 'yes';
      const offValue = choices[1]?.value ?? '';
      const checked = value === onValue;
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={field.placeholder}
            checked={checked}
            onChange={(e) => onChange(e.target.checked ? onValue : offValue)}
          />
          <span>{choices[0]?.label ?? 'ใช่'}</span>
        </label>
      );
    }

    // Plain input: map the data type's input control to a real HTML input type.
    const htmlType =
      resolvedInput === 'number' ||
      resolvedInput === 'date' ||
      resolvedInput === 'time' ||
      resolvedInput === 'email' ||
      resolvedInput === 'tel' ||
      resolvedInput === 'url' ||
      resolvedInput === 'datetime-local'
        ? resolvedInput
        : 'text';
    return (
      <input
        id={id}
        type={htmlType}
        name={field.placeholder}
        required={required}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput}
        list={
          suggestions.length > 0 ? `${id}-suggest` : undefined
        }
      />
    );
  };

  // Suggested values render two ways:
  //   - As <datalist> hints inside text-like inputs (browser autocomplete).
  //   - As clickable chips below any plain input control for one-tap selection.
  const showChips =
    suggestions.length > 0 &&
    !['select', 'radio', 'radio-group', 'checkbox'].includes(resolvedInput);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink-subtle">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      {renderControl()}
      {showChips ? (
        <>
          <datalist id={`${id}-suggest`}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-1 mt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                  value === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-alt text-ink-subtle border-border-default hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {field.description || dataType?.description ? (
        <span className="text-xs text-ink-muted">
          {field.description || dataType?.description}
        </span>
      ) : null}
    </div>
  );
}
