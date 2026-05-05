import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ChevronLeft,
  Download,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  deleteDocument,
  downloadDocument,
  getDocument,
  getDocumentPreviewPdfUrl,
  regenerateDocument,
  renameDocument,
} from '../lib/api/documents';
import { stripDocxExtension } from '../lib/filename';
import {
  collapseRadioGroups,
  expandAllRadioGroups,
} from '../lib/radioGroups';
import { getFieldDefinitions } from '../lib/api/templates';
import { listShares } from '../lib/api/shares';
import { transitionLifecycle, type LifecycleStatus } from '../lib/api/lifecycle';
import { listWatermarkPresets } from '../lib/api/watermarks';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LifecycleBar } from '../components/workflow/LifecycleBar';
import { ShareModal } from '../components/workflow/ShareModal';
import { CommentsThread } from '../components/workflow/CommentsThread';
import { ActivityTimeline } from '../components/workflow/ActivityTimeline';
import { SignaturePad } from '../components/workflow/SignaturePad';
import { LiveTemplatePreview } from '../components/workflow/LiveTemplatePreview';
import { resolvePermissions } from '../lib/permissions';
import { getActiveUserId } from '../lib/api/client';
import type { DocumentFormat } from '../lib/api/types';

type Tab = 'preview' | 'data' | 'comments' | 'activity' | 'signatures';

export default function DocumentDetailPage() {
  const { documentId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = getActiveUserId();

  const [tab, setTab] = useState<Tab>('preview');
  const [shareOpen, setShareOpen] = useState(false);
  const [format, setFormat] = useState<DocumentFormat>('pdf');
  const [presetId, setPresetId] = useState<string>('');
  const [downloadError, setDownloadError] = useState<unknown>(null);

  const docQuery = useQuery({
    queryKey: queryKeys.documents.detail(documentId),
    queryFn: () => getDocument(documentId),
    enabled: !!documentId,
  });
  const docTemplateId = docQuery.data?.templateId ?? '';
  const fieldsQuery = useQuery({
    queryKey: queryKeys.templates.fieldDefinitions(docTemplateId),
    queryFn: () => getFieldDefinitions(docTemplateId),
    enabled: !!docTemplateId,
  });
  const fieldDefs = fieldsQuery.data?.fieldDefinitions ?? [];
  const sharesQuery = useQuery({
    queryKey: queryKeys.shares.forDocument(documentId),
    queryFn: () => listShares(documentId),
    enabled: !!documentId,
  });
  const presetsQuery = useQuery({
    queryKey: queryKeys.watermarks.list(),
    queryFn: () => listWatermarkPresets(),
  });

  const doc = docQuery.data;
  const myShare = (sharesQuery.data?.data ?? []).find(
    (s) => s.userId === currentUserId
  );
  const lifecycle = (doc?.lifecycleStatus ?? 'DRAFT') as LifecycleStatus;
  const ownerUserId = doc?.ownerUserId ?? '';
  const perms = resolvePermissions({
    ownerUserId,
    currentUserId,
    role: ownerUserId === currentUserId ? 'OWNER' : myShare?.role ?? null,
    lifecycleStatus: lifecycle,
  });

  const transitionMutation = useMutation({
    mutationFn: (to: LifecycleStatus) => transitionLifecycle(documentId, to),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.detail(documentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.forDocument(documentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.detail(documentId),
      });
    },
  });

  // Editable form data — saving spawns a NEW document.
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [editHoverField, setEditHoverField] = useState<string | null>(null);

  // Editable name — saving renames in place (no new document).
  const [editedName, setEditedName] = useState<string>('');

  useEffect(() => {
    if (!doc) return;
    // Collapse expanded radio-group keys back into a single master key per group
    // so the form can render one radio control instead of N tick inputs.
    const stored = (doc.data ?? {}) as Record<string, string>;
    setEditedData(collapseRadioGroups(stored, fieldDefs));
    setEditedName(stripDocxExtension(doc.filename ?? ''));
  }, [doc?.id, doc?.data, doc?.filename, fieldDefs]);

  const dataIsDirty = useMemo(() => {
    const original = collapseRadioGroups(
      (doc?.data ?? {}) as Record<string, string>,
      fieldDefs,
    );
    const a = Object.entries(original);
    const b = Object.entries(editedData);
    if (a.length !== b.length) return true;
    for (const [k, v] of b) {
      if ((original[k] ?? '') !== (v ?? '')) return true;
    }
    return false;
  }, [doc?.data, editedData, fieldDefs]);

  const nameIsDirty = useMemo(() => {
    const current = stripDocxExtension(doc?.filename ?? '');
    return editedName.trim() !== current;
  }, [doc?.filename, editedName]);

  // Save edited form data → spawn a new document. Filename is unchanged for the new doc.
  // Re-expand radio-group master keys back into per-placeholder ticks before sending.
  const saveEditMutation = useMutation({
    mutationFn: () =>
      regenerateDocument(documentId, {
        data: expandAllRadioGroups(editedData, fieldDefs),
      }),
    onSuccess: (next) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      navigate(`/documents/${next.id}`);
    },
  });

  // Rename in place. Updates the same document.
  const renameMutation = useMutation({
    mutationFn: () => renameDocument(documentId, editedName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      navigate('/documents');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      setDownloadError(null);
      const blob = await downloadDocument(documentId, {
        format,
        watermarkPresetId: presetId || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = doc?.filename ?? doc?.templateId ?? 'document';
      a.download = `${filename.replace(/\.(pdf|docx)$/i, '')}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    onError: (err) => setDownloadError(err),
  });

  // Build the rows the form renders: one per top-level field (radio groups become a
  // single row), plus any leftover keys that aren't in the field definitions yet.
  const dataRows = useMemo(() => {
    type Row =
      | { kind: 'field'; key: string; field: import('../lib/api/types').FieldDefinition }
      | { kind: 'plain'; key: string };
    const rows: Row[] = [];
    const covered = new Set<string>();
    for (const f of fieldDefs) {
      rows.push({ kind: 'field', key: f.placeholder, field: f });
      covered.add(f.placeholder);
      if (f.isRadioGroup && f.radioOptions) {
        for (const opt of f.radioOptions) covered.add(opt.placeholder);
      }
    }
    for (const k of Object.keys(editedData)) {
      if (!covered.has(k)) rows.push({ kind: 'plain', key: k });
    }
    return rows;
  }, [fieldDefs, editedData]);

  const primaryAction = pickPrimaryTransition(lifecycle, perms);

  return (
    <div>
      <PageHeader
        title={stripDocxExtension(doc?.filename ?? '') || doc?.templateId || 'Document'}
        breadcrumbs={
          <Link
            to="/documents"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Documents
          </Link>
        }
        actions={
          doc ? (
            <div className="flex items-center gap-2 flex-wrap">
              {perms.canShare ? (
                <Button variant="outline" onClick={() => setShareOpen(true)}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              ) : null}
              {primaryAction && perms.canTransition ? (
                <Button
                  onClick={() => transitionMutation.mutate(primaryAction.to)}
                  disabled={transitionMutation.isPending}
                >
                  {transitionMutation.isPending ? (
                    <Spinner className="text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {primaryAction.label}
                </Button>
              ) : null}
              {perms.canEdit ? (
                <Link
                  to={`/documents/${documentId}/edit`}
                  className="inline-flex items-center gap-2 rounded-md border border-border-default bg-white px-4 py-2 text-sm font-medium hover:bg-surface-alt"
                >
                  <Pencil className="w-4 h-4" /> PDF Editor
                </Link>
              ) : null}
              {perms.canEdit ? (
                <Button
                  variant="outline"
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? <Spinner /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate
                </Button>
              ) : null}
              {perms.canArchive ? (
                <Button
                  variant="outline"
                  onClick={() => transitionMutation.mutate('ARCHIVED')}
                  disabled={transitionMutation.isPending}
                >
                  <Archive className="w-4 h-4" /> Archive
                </Button>
              ) : null}
              {perms.isOwner ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm('Delete this document? This cannot be undone.')) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              ) : null}
            </div>
          ) : null
        }
      />

      {docQuery.isLoading ? <PageLoader /> : null}
      {docQuery.error ? (
        <div className="px-6 py-4">
          <ErrorMessage error={docQuery.error} />
        </div>
      ) : null}

      {doc ? (
        <>
          <div className="px-6 pt-4">
            <LifecycleBar current={lifecycle} />
            {transitionMutation.error ? (
              <ErrorMessage error={transitionMutation.error} className="mt-2" />
            ) : null}
          </div>

          <div className="px-6 py-4 border-b border-border-default">
            <Tabs current={tab} onChange={setTab} />
          </div>

          <div className="px-6 py-4">
            {tab === 'preview' ? (
              <section className="space-y-4">
                {/* Inline PDF — streams the cached file from /preview.pdf, browser
                    caches via ETag, no regeneration on each visit. The preview is
                    keyed by updatedAt so a regenerate or edit busts the cache. */}
                <div className="rounded-md border border-border-default bg-white overflow-hidden">
                  <iframe
                    key={doc.updatedAt ?? doc.id}
                    src={`${getDocumentPreviewPdfUrl(documentId)}#view=FitH&toolbar=1`}
                    title={doc.filename ?? 'Document preview'}
                    className="w-full h-[78vh] block"
                  />
                </div>
                <div className="rounded-md border border-border-default p-4 bg-white">
                  <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
                    Download
                  </h3>
                  <div className="flex flex-col gap-3 max-w-2xl">
                    <div className="flex flex-col md:flex-row gap-3">
                      <label className="flex-1">
                        <span className="text-xs text-ink-muted">Format</span>
                        <select
                          value={format}
                          onChange={(e) => setFormat(e.target.value as DocumentFormat)}
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border-default bg-white text-sm"
                        >
                          <option value="pdf">PDF</option>
                          <option value="docx">DOCX</option>
                        </select>
                      </label>
                      <label className="flex-1">
                        <span className="text-xs text-ink-muted">Watermark preset</span>
                        <select
                          value={presetId}
                          onChange={(e) => setPresetId(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border-default bg-white text-sm"
                        >
                          <option value="">No watermark</option>
                          {presetsQuery.data?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <Button
                      onClick={() => downloadMutation.mutate()}
                      disabled={downloadMutation.isPending}
                      className="self-start"
                    >
                      {downloadMutation.isPending ? (
                        <Spinner className="text-white" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download {format.toUpperCase()}
                    </Button>
                    {downloadError ? <ErrorMessage error={downloadError} /> : null}
                  </div>
                </div>
              </section>
            ) : tab === 'data' ? (
              <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-4">
                <div className="flex flex-col gap-4">
                  {/* In-place rename — does not create a new document. */}
                  <div className="rounded-md border border-border-default p-4 bg-white">
                    <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
                      Document name
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          perms.canEdit &&
                          nameIsDirty &&
                          editedName.trim()
                        ) {
                          renameMutation.mutate();
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        disabled={!perms.canEdit}
                        placeholder="Document name"
                        className="flex-1 px-3 py-2 rounded-md border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-alt disabled:text-ink-muted"
                      />
                      {perms.canEdit ? (
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            !nameIsDirty ||
                            !editedName.trim() ||
                            renameMutation.isPending
                          }
                        >
                          {renameMutation.isPending ? (
                            <Spinner className="text-white" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Rename
                        </Button>
                      ) : null}
                    </form>
                    {renameMutation.error ? (
                      <ErrorMessage error={renameMutation.error} className="mt-2" />
                    ) : null}
                  </div>

                  {/* Form data — saving spawns a NEW document, leaves this one alone. */}
                  <div className="rounded-md border border-border-default p-4 bg-white">
                    <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
                      Submitted data
                    </h3>
                    {perms.canEdit ? (
                      <p className="text-[11px] text-ink-muted mb-3">
                        Editing values creates a new document; this one stays unchanged.
                      </p>
                    ) : null}

                    {dataRows.length === 0 ? (
                      <p className="text-sm text-ink-muted">No data captured.</p>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (perms.canEdit && dataIsDirty) saveEditMutation.mutate();
                        }}
                        className="flex flex-col gap-3"
                      >
                        <dl className="text-sm grid grid-cols-1 gap-2">
                          {dataRows.map((row) => {
                            const k = row.key;
                            const isRadio =
                              row.kind === 'field' &&
                              row.field.isRadioGroup &&
                              row.field.radioOptions?.length;
                            const labelText =
                              row.kind === 'field'
                                ? row.field.label || row.field.placeholder
                                : k;
                            return (
                              <div
                                key={k}
                                className="grid grid-cols-[minmax(120px,35%)_1fr] items-start gap-3 border-b border-border-default py-1.5"
                                onMouseEnter={() => setEditHoverField(k)}
                                onMouseLeave={() => setEditHoverField(null)}
                              >
                                <dt className="text-ink-muted truncate pt-1.5" title={k}>
                                  {labelText}
                                </dt>
                                <dd>
                                  {isRadio && row.kind === 'field' ? (
                                    <div className="flex flex-col gap-1">
                                      {row.field.radioOptions!.map((opt) => (
                                        <label
                                          key={opt.placeholder}
                                          className="inline-flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={k}
                                            value={opt.placeholder}
                                            checked={
                                              (editedData[k] ?? '') === opt.placeholder
                                            }
                                            onChange={(e) =>
                                              setEditedData((prev) => ({
                                                ...prev,
                                                [k]: e.target.value,
                                              }))
                                            }
                                            onFocus={() => setEditHoverField(k)}
                                            onBlur={() => setEditHoverField(null)}
                                            disabled={!perms.canEdit}
                                          />
                                          <span>{opt.label || opt.placeholder}</span>
                                          <code className="text-[10px] text-ink-muted font-mono">
                                            {'{{' + opt.placeholder + '}}'}
                                          </code>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={editedData[k] ?? ''}
                                      onChange={(e) =>
                                        setEditedData((prev) => ({
                                          ...prev,
                                          [k]: e.target.value,
                                        }))
                                      }
                                      onFocus={() => setEditHoverField(k)}
                                      onBlur={() => setEditHoverField(null)}
                                      disabled={!perms.canEdit}
                                      className="w-full px-3 py-1.5 rounded-md border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-alt disabled:text-ink-muted"
                                    />
                                  )}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>

                        {saveEditMutation.error ? (
                          <ErrorMessage error={saveEditMutation.error} />
                        ) : null}

                        {perms.canEdit ? (
                          <div className="flex items-center justify-end gap-2 pt-2 sticky bottom-0 bg-white">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={!dataIsDirty || saveEditMutation.isPending}
                              onClick={() =>
                                setEditedData(
                                  collapseRadioGroups(
                                    (doc?.data ?? {}) as Record<string, string>,
                                    fieldDefs,
                                  ),
                                )
                              }
                            >
                              <RotateCcw className="w-4 h-4" /> Reset
                            </Button>
                            <Button
                              type="submit"
                              disabled={!dataIsDirty || saveEditMutation.isPending}
                            >
                              {saveEditMutation.isPending ? (
                                <Spinner className="text-white" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save as new document
                            </Button>
                          </div>
                        ) : null}
                      </form>
                    )}
                  </div>
                </div>

                {doc?.templateId ? (
                  <LiveTemplatePreview
                    templateId={doc.templateId}
                    values={expandAllRadioGroups(editedData, fieldDefs)}
                    hoverField={editHoverField}
                    className="rounded-md border border-border-default overflow-hidden"
                  />
                ) : null}
              </section>
            ) : tab === 'comments' ? (
              <section className="max-w-3xl">
                <CommentsThread
                  documentId={documentId}
                  canComment={perms.canComment}
                  currentUserId={currentUserId}
                />
              </section>
            ) : tab === 'activity' ? (
              <section className="max-w-3xl">
                <ActivityTimeline documentId={documentId} />
              </section>
            ) : tab === 'signatures' ? (
              <section className="max-w-3xl">
                <SignaturePad
                  documentId={documentId}
                  canSign={perms.canSign}
                  currentUserId={currentUserId}
                />
              </section>
            ) : null}
          </div>
        </>
      ) : null}

      {shareOpen ? (
        <ShareModal
          documentId={documentId}
          ownerUserId={ownerUserId}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Tabs({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { value: Tab; label: string }[] = [
    { value: 'preview', label: 'Download' },
    { value: 'data', label: 'Form data' },
    { value: 'comments', label: 'Comments' },
    { value: 'activity', label: 'Activity' },
    { value: 'signatures', label: 'Signatures' },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
            current === t.value
              ? 'bg-primary text-white'
              : 'text-ink-subtle hover:bg-surface-alt'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function pickPrimaryTransition(
  current: LifecycleStatus,
  perms: { canTransition: boolean; isOwner: boolean }
): { label: string; to: LifecycleStatus } | null {
  if (!perms.canTransition) return null;
  switch (current) {
    case 'DRAFT':
      return { label: 'Send for review', to: 'IN_REVIEW' };
    case 'IN_REVIEW':
      return { label: 'Mark approved', to: 'APPROVED' };
    case 'APPROVED':
      // Signing happens via the Signatures tab; offer no primary transition here.
      return null;
    default:
      return null;
  }
}
