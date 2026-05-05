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
        title="Field types"
        description="Define the data types available to template placeholders, their default input control, and (for select/radio) the choices they offer."
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">
                {dirtyRows.length > 0
                  ? `${dirtyRows.length} unsaved change${dirtyRows.length === 1 ? '' : 's'}`
                  : 'All saved'}
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
                <RotateCcw className="w-4 h-4" /> Reset all
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
                Save all changes
              </Button>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">Read-only — manage permission required to edit.</span>
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
                        title={isOpen ? 'Collapse' : 'Expand details'}
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
                            built-in
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
                        placeholder="(optional)"
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
                            title="Reset row"
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
                          Save
                        </Button>
                        {!d.isBuiltIn ? (
                          <button
                            onClick={() => {
                              if (confirm(`Delete data type "${d.code}"?`)) {
                                deleteMutation.mutate(d.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 flex-shrink-0"
                            title="Delete"
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
                            Choices {showOptions ? '' : '(only used by Dropdown / Radio group inputs)'}
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
                              <strong>Written value</strong> = what gets injected into the
                              DOCX placeholder when the user selects this choice.
                              <strong> Display label</strong> = what the user sees in the form.
                            </p>
                            <p>
                              Examples:
                              <br />
                              • Sex going into <code>{'{{sex}}'}</code> as plain text
                              → <code>{'{value:"M",label:"Male"}'}</code>,{' '}
                              <code>{'{value:"F",label:"Female"}'}</code> — picking
                              Male writes <code>M</code>.
                              <br />
                              • Sex going into <code>{'[{{sex}}]'}</code> as a tick
                              → <code>{'{value:"/",label:"Male"}'}</code>,{' '}
                              <code>{'{value:"",label:"Female"}'}</code> — picking
                              Male writes <code>/</code> (so the bracket renders{' '}
                              <code>[/]</code>), Female leaves the bracket empty.
                            </p>
                            <p>
                              Use the <strong>Set tick</strong> shortcut on a row to
                              fill the value with <code>/</code> in one click.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                              Default value
                            </h4>
                            <input
                              type="text"
                              value={d.defaultValue ?? ''}
                              onChange={(e) =>
                                updateRow(d.id, {
                                  defaultValue: e.target.value || null,
                                })
                              }
                              placeholder="(none)"
                              className="w-full px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-[11px] text-ink-muted mt-1">
                              Pre-fills any new form input that uses this data type.
                            </p>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                              Suggested values
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
                              Shown as quick-pick chips next to the input on the form.
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
            Add a custom data type
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCode.trim() && newLabel.trim()) createMutation.mutate();
            }}
            className="grid grid-cols-1 md:grid-cols-[140px_1fr_200px_auto] gap-3 items-start"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">Code</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. invoice_no"
                className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">Label</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Invoice number"
                className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">Default input</label>
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
                Create
              </Button>
            </div>
          </form>
          {createMutation.error ? (
            <ErrorMessage error={createMutation.error} className="mt-2" />
          ) : null}
          <p className="text-[11px] text-ink-muted mt-3">
            Codes must be lowercase letters, digits, underscore or dash. Built-in
            types can be re-labelled, re-mapped, and have options/defaults edited
            (but they can't be deleted). Click the chevron on any row to expand
            options, default value, and suggested values.
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
          <div title="Injected into the DOCX placeholder when this choice is selected">
            Written value
          </div>
          <div title="Shown to the user in the form">Display label</div>
          <div className="text-center">Tick</div>
          <div />
        </div>
      ) : null}
      {options.length === 0 ? (
        <p className="text-xs text-ink-muted italic">No choices yet.</p>
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
              placeholder='e.g. M  or  /'
              title="What gets written into the DOCX placeholder when the user picks this choice"
              className="px-2 py-1.5 text-sm rounded border border-border-default font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={opt.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              placeholder="e.g. Male"
              title="What the user sees on the form"
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
              title='Quick-set the written value to "/" so brackets like [{{sex}}] render as [/]'
            >
              Set /
            </button>
            <button
              onClick={() => remove(idx)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              title="Remove choice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="w-3.5 h-3.5" /> Add choice
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
                title="Remove"
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
          placeholder="Type a suggestion and press Enter"
          className="flex-1 px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}
