import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ChevronLeft, FileEdit, Globe, Pencil, Save, Settings, Upload } from 'lucide-react';
import {
  archiveTemplate,
  getFieldDefinitions,
  getPreviewHtmlUrl,
  getPreviewPdfUrl,
  getTemplate,
  getThumbnailUrl,
  publishTemplate,
  replaceTemplateHtml,
  unpublishTemplate,
  updateTemplate,
} from '../lib/api/templates';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoader } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useCan } from '../lib/auth/useCan';
import { useTemplateOwnership } from '../lib/auth/useTemplateOwnership';
import { useAuth } from '../lib/auth/AuthContext';
import { ApiError } from '../lib/api/client';
import { taxonomyApi } from '../lib/api/templateTaxonomy';
import { authApi } from '../lib/auth/api';

export default function FormDetailPage() {
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';
  const hasUpdatePermission = useCan('templates:update');
  const canFill = useCan('documents:create');
  const { templateId = '' } = useParams();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const templateQuery = useQuery({
    queryKey: queryKeys.templates.detail(templateId),
    queryFn: () => getTemplate(templateId),
    enabled: !!templateId,
  });

  // Ownership gate (mirrors backend `assertCanEditTemplate`): only the original
  // uploader or a GLOBAL_ADMIN may modify a template. Hide all mutation buttons
  // for everyone else even if they hold `templates:update` for some other reason.
  const { canEdit } = useTemplateOwnership();
  const canConfigure = hasUpdatePermission && canEdit(templateQuery.data ?? null);

  const fieldsQuery = useQuery({
    queryKey: queryKeys.templates.fieldDefinitions(templateId),
    queryFn: () => getFieldDefinitions(templateId),
    enabled: !!templateId,
  });

  const tpl = templateQuery.data;
  const [previewMode, setPreviewMode] = useState<'image' | 'pdf' | 'html'>('image');
  const [htmlBust, setHtmlBust] = useState(0);
  const htmlInputRef = useRef<HTMLInputElement>(null);

  const replaceHtmlMutation = useMutation({
    mutationFn: (file: File) => replaceTemplateHtml(templateId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      setHtmlBust((n) => n + 1);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });
  const archiveMutation = useMutation({
    mutationFn: () => archiveTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });
  const unpublishMutation = useMutation({
    mutationFn: () => unpublishTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={tpl?.displayName ?? tpl?.name ?? 'เทมเพลต'}
        description={tpl?.description ?? undefined}
        breadcrumbs={
          <Link
            to="/templates"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปยังเทมเพลต
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            {canConfigure ? (
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-white px-4 py-2 text-sm font-medium hover:bg-surface-alt"
              >
                <Pencil className="w-4 h-4" />{' '}
                {showSettings ? 'ปิดการตั้งค่า' : 'แก้ไขการตั้งค่า'}
              </button>
            ) : null}
            {canConfigure ? (
              <Link
                to={`/templates/${templateId}/fields`}
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-white px-4 py-2 text-sm font-medium hover:bg-surface-alt"
              >
                <Settings className="w-4 h-4" /> ตั้งค่าฟิลด์
              </Link>
            ) : null}
            {canConfigure && tpl?.status === 'DRAFT' ? (
              <button
                onClick={() => {
                  if (confirm('เผยแพร่เทมเพลตนี้หรือไม่? จะพร้อมให้ผู้กรอกใช้งาน')) {
                    publishMutation.mutate();
                  }
                }}
                disabled={publishMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                {publishMutation.isPending ? 'กำลังเผยแพร่…' : 'เผยแพร่'}
              </button>
            ) : null}
            {canConfigure && tpl?.status === 'PUBLISHED' ? (
              <button
                onClick={() => {
                  if (
                    confirm(
                      'ยกเลิกการเผยแพร่เทมเพลตนี้หรือไม่? จะกลับไปเป็นฉบับร่างและถูกซ่อนจากผู้กรอก',
                    )
                  ) {
                    unpublishMutation.mutate();
                  }
                }}
                disabled={unpublishMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-white text-ink-subtle px-4 py-2 text-sm font-medium hover:bg-bg-subtle disabled:opacity-50"
              >
                <FileEdit className="w-4 h-4" />
                {unpublishMutation.isPending ? 'กำลังยกเลิกการเผยแพร่…' : 'ยกเลิกการเผยแพร่'}
              </button>
            ) : null}
            {canConfigure && tpl?.status === 'PUBLISHED' ? (
              <button
                onClick={() => {
                  if (
                    confirm(
                      'เก็บเทมเพลตนี้เข้าคลังหรือไม่? จะถูกซ่อนจากรายการ คุณสามารถนำกลับมาได้ภายหลัง',
                    )
                  ) {
                    archiveMutation.mutate();
                  }
                }}
                disabled={archiveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-white text-ink-subtle px-4 py-2 text-sm font-medium hover:bg-bg-subtle disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                {archiveMutation.isPending ? 'กำลังเก็บเข้าคลัง…' : 'เก็บเข้าคลัง'}
              </button>
            ) : null}
            {/* Archived templates can be brought back via the same publish endpoint —
                publish() unconditionally sets status=PUBLISHED regardless of prior state. */}
            {canConfigure && tpl?.status === 'ARCHIVED' ? (
              <button
                onClick={() => {
                  if (
                    confirm(
                      'กู้คืนเทมเพลตนี้หรือไม่? จะถูกเผยแพร่ใหม่และผู้กรอกจะมองเห็นอีกครั้ง',
                    )
                  ) {
                    publishMutation.mutate();
                  }
                }}
                disabled={publishMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                {publishMutation.isPending ? 'กำลังกู้คืน…' : 'กู้คืน'}
              </button>
            ) : null}
            {canFill ? (
              <Link
                to={`/templates/${templateId}/fill`}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover"
              >
                <Pencil className="w-4 h-4" /> กรอกฟอร์ม
              </Link>
            ) : null}
          </div>
        }
      />

      {templateQuery.isLoading ? <PageLoader /> : null}
      {templateQuery.error ? (
        <div className="px-6 py-4">
          <ErrorMessage error={templateQuery.error} />
        </div>
      ) : null}

      {showSettings && tpl ? (
        <TemplateSettingsPanel
          template={tpl}
          isGlobalAdmin={isGlobalAdmin}
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
          }}
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 flex-1 min-h-0">
        <div className="flex flex-col border-r border-border-subtle bg-surface-alt min-h-[60vh]">
          <div className="flex items-center gap-1 border-b border-border-subtle bg-white px-3 py-2">
            <button
              onClick={() => setPreviewMode('image')}
              className={`px-3 py-1 text-xs rounded ${
                previewMode === 'image'
                  ? 'bg-primary text-white'
                  : 'text-ink-muted hover:bg-surface-alt'
              }`}
            >
              ภาพ
            </button>
            <button
              onClick={() => setPreviewMode('pdf')}
              className={`px-3 py-1 text-xs rounded ${
                previewMode === 'pdf'
                  ? 'bg-primary text-white'
                  : 'text-ink-muted hover:bg-surface-alt'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setPreviewMode('html')}
              className={`px-3 py-1 text-xs rounded ${
                previewMode === 'html'
                  ? 'bg-primary text-white'
                  : 'text-ink-muted hover:bg-surface-alt'
              }`}
            >
              HTML
            </button>
            {previewMode === 'html' && canConfigure ? (
              <div className="ml-auto flex items-center gap-2">
                <input
                  ref={htmlInputRef}
                  type="file"
                  accept=".html,.htm,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) replaceHtmlMutation.mutate(f);
                    if (htmlInputRef.current) htmlInputRef.current.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => htmlInputRef.current?.click()}
                  disabled={replaceHtmlMutation.isPending}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border-default text-ink-muted hover:text-primary hover:border-primary disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  {replaceHtmlMutation.isPending ? 'กำลังอัปโหลด…' : 'แทนที่ HTML'}
                </button>
              </div>
            ) : null}
          </div>
          {replaceHtmlMutation.error ? (
            <div className="px-3 py-2 bg-white border-b border-border-subtle">
              <ErrorMessage error={replaceHtmlMutation.error} />
            </div>
          ) : null}
          {tpl ? (
            previewMode === 'image' ? (
              <div className="flex-1 min-h-[60vh] overflow-auto p-6 flex items-start justify-center bg-surface-alt">
                <img
                  src={getThumbnailUrl(tpl.id)}
                  alt={tpl.displayName ?? tpl.name}
                  className="max-w-full h-auto bg-white shadow-md rounded-sm"
                />
              </div>
            ) : (
              <iframe
                src={
                  previewMode === 'pdf'
                    ? getPreviewPdfUrl(tpl.id)
                    : `${getPreviewHtmlUrl(tpl.id)}${htmlBust ? `?v=${htmlBust}` : ''}`
                }
                title="ตัวอย่างเทมเพลต"
                className="w-full flex-1 min-h-[60vh] bg-white"
              />
            )
          ) : null}
        </div>
        <aside className="p-6 space-y-5">
          <div>
            <h3 className="text-[10px] font-medium text-ink-faint uppercase tracking-wider mb-2">
              การจัดประเภท
            </h3>
            <dl className="text-[12px] space-y-1.5">
              <Row label="ประเภท" value={tpl?.type} />
              <Row label="ระดับ" value={tpl?.tier} />
              <Row label="หมวดหมู่" value={tpl?.category?.replace(/_/g, ' ')} />
              <Row label="สถานะ" value={tpl?.status} />
              <Row label="การมองเห็น" value={tpl?.visibility} />
              <Row label="แนวกระดาษ" value={tpl?.pageOrientation} />
            </dl>
          </div>

          <div>
            <h3 className="text-[10px] font-medium text-ink-faint uppercase tracking-wider mb-2">
              ที่มา
            </h3>
            <dl className="text-[12px] space-y-1.5">
              <Row label="อัปโหลดโดย" value={tpl?.owner?.name ?? tpl?.author ?? undefined} />
              {tpl?.owner?.email ? (
                <Row label="อีเมล" value={tpl.owner.email} mono />
              ) : null}
              {tpl?.organizationId ? (
                <Row
                  label="ผู้เช่า"
                  value={tpl.organizationId.slice(0, 8) + '…'}
                  mono
                />
              ) : null}
              <Row
                label="สร้างเมื่อ"
                value={tpl?.createdAt ? formatDateTime(tpl.createdAt) : undefined}
              />
              <Row
                label="อัปเดต"
                value={tpl?.updatedAt ? formatDateTime(tpl.updatedAt) : undefined}
              />
            </dl>
          </div>

          {tpl?.originalFilename || tpl?.fileSize || tpl?.mimeType ? (
            <div>
              <h3 className="text-[10px] font-medium text-ink-faint uppercase tracking-wider mb-2">
                ไฟล์
              </h3>
              <dl className="text-[12px] space-y-1.5">
                <Row
                  label="ชื่อไฟล์"
                  value={tpl?.originalFilename ?? undefined}
                  mono
                />
                <Row
                  label="ขนาด"
                  value={tpl?.fileSize ? formatBytes(tpl.fileSize) : undefined}
                />
                <Row label="Mime" value={tpl?.mimeType ?? undefined} mono />
              </dl>
            </div>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
              ฟิลด์ ({fieldsQuery.data?.fieldDefinitions?.length ?? 0})
            </h3>
            {fieldsQuery.isLoading ? (
              <div className="text-xs text-ink-muted">กำลังโหลดฟิลด์…</div>
            ) : null}
            {fieldsQuery.data?.fieldDefinitions?.length ? (
              <ul className="space-y-1 text-sm">
                {fieldsQuery.data.fieldDefinitions.map((f) => (
                  <li
                    key={f.placeholder}
                    className="flex items-baseline justify-between gap-2 border-b border-border-subtle py-1.5"
                  >
                    <span className="font-medium text-ink truncate">
                      {f.label || f.placeholder}
                    </span>
                    <span className="text-xs text-ink-muted">{f.inputType ?? 'text'}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={`text-ink text-right truncate ${mono ? 'font-mono text-[11px]' : 'font-medium'}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatBytes(n: number): string {
  const GB = 1024 ** 3;
  const MB = 1024 ** 2;
  if (n >= GB) return `${(n / GB).toFixed(2)} GB`;
  if (n >= MB) return `${(n / MB).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function TemplateSettingsPanel({
  template,
  isGlobalAdmin,
  onClose,
  onSaved,
}: {
  template: import('../lib/api/types').Template;
  isGlobalAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(template.displayName ?? '');
  const [description, setDescription] = useState(template.description ?? '');
  const [author, setAuthor] = useState(template.author ?? '');
  const [type, setType] = useState<string>(template.type ?? 'FORM');
  const [tier, setTier] = useState<string>(template.tier ?? 'FREE');
  const [visibility, setVisibility] = useState<'ORGANIZATION' | 'GLOBAL'>(
    template.visibility ?? 'ORGANIZATION',
  );
  const [category, setCategory] = useState<string>(template.category ?? 'OTHER');
  const [pageOrientation, setPageOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    template.pageOrientation ?? 'PORTRAIT',
  );
  const [remarks, setRemarks] = useState(template.remarks ?? '');
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Configurable lists. Fetched on every panel open so admins editing the taxonomy
  // see their changes reflect here without a hard reload.
  const typesQuery = useQuery({
    queryKey: ['template-taxonomy', 'TYPE'],
    queryFn: () => taxonomyApi.listByKind('TYPE'),
  });
  // Tier list comes from the unified subscription tier table (same as the
  // /settings/tiers admin and the org Subscription card).
  const tiersQuery = useQuery({
    queryKey: ['tiers', 'public'],
    queryFn: () => authApi.listEnabledTiers(),
    enabled: isGlobalAdmin,
  });
  const categoriesQuery = useQuery({
    queryKey: ['template-taxonomy', 'CATEGORY'],
    queryFn: () => taxonomyApi.listByKind('CATEGORY'),
  });
  const types = typesQuery.data ?? [];
  const tiers = tiersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  // If the template prop changes (e.g. after refetch) keep the form in sync.
  useEffect(() => {
    setDisplayName(template.displayName ?? '');
    setDescription(template.description ?? '');
    setAuthor(template.author ?? '');
    setType(template.type ?? 'FORM');
    setTier(template.tier ?? 'FREE');
    setVisibility(template.visibility ?? 'ORGANIZATION');
    setCategory(template.category ?? 'OTHER');
    setPageOrientation(template.pageOrientation ?? 'PORTRAIT');
    setRemarks(template.remarks ?? '');
  }, [template]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateTemplate(template.id, {
        displayName: displayName || undefined,
        description,
        author,
        type,
        category,
        pageOrientation,
        remarks,
        // Tier + visibility are silently ignored server-side for non-admins, but only
        // include them when the editor is allowed to edit them — keeps payloads small.
        tier: isGlobalAdmin ? tier : undefined,
        visibility: isGlobalAdmin ? visibility : undefined,
      }),
    onSuccess: () => {
      setSavedAt(Date.now());
      setError(null);
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.detail(template.id),
      });
      onSaved();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const accessHint =
    template.visibility === 'GLOBAL'
      ? 'มองเห็นได้ทุกผู้เช่าในแพลตฟอร์ม'
      : template.organizationId
        ? `มองเห็นได้เฉพาะสมาชิกขององค์กร ${template.organizationId.slice(0, 8)}…`
        : 'ไม่ทราบขอบเขตการมองเห็น';

  return (
    <section className="px-6 py-5 bg-white border-b border-border-subtle">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">การตั้งค่าเทมเพลต</h2>
          <p className="text-xs text-ink-muted">
            {accessHint}
            {!isGlobalAdmin
              ? ' ระดับและการมองเห็นเป็นระดับแพลตฟอร์ม — เฉพาะผู้ดูแลทั้งระบบเท่านั้นที่เปลี่ยนได้'
              : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-ink-muted hover:text-ink"
        >
          ปิด
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field label="ชื่อที่แสดง">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
          />
        </Field>
        <Field label="ผู้เขียน">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
          />
        </Field>
        <Field label="คำอธิบาย" className="md:col-span-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
          />
        </Field>
        <Field label="ประเภท">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
          >
            {types.map((t) => (
              <option key={t.id} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="หมวดหมู่">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="แนวกระดาษ">
          <select
            value={pageOrientation}
            onChange={(e) =>
              setPageOrientation(e.target.value as 'PORTRAIT' | 'LANDSCAPE')
            }
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
          >
            <option value="PORTRAIT">แนวตั้ง</option>
            <option value="LANDSCAPE">แนวนอน</option>
          </select>
        </Field>
        {isGlobalAdmin ? (
          <Field label="ระดับ" hint="ระดับผู้ใช้ที่ต้องการเพื่อใช้เทมเพลตนี้">
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
            >
              {tiers.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        {isGlobalAdmin ? (
          <Field
            label="การเข้าถึง / การมองเห็น"
            hint="ORGANIZATION = เฉพาะผู้เช่านี้เท่านั้น  GLOBAL = ทุกผู้เช่าในแพลตฟอร์ม"
            className="md:col-span-2"
          >
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as 'ORGANIZATION' | 'GLOBAL')
              }
              className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
            >
              <option value="ORGANIZATION">เฉพาะองค์กรเท่านั้น</option>
              <option value="GLOBAL">ทั้งระบบ — ทุกผู้เช่า</option>
            </select>
          </Field>
        ) : null}
        <Field label="หมายเหตุ" className="md:col-span-2">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
          />
        </Field>

        {error ? (
          <div className="md:col-span-2 text-sm text-red-600">{error}</div>
        ) : null}
        <div className="md:col-span-2 flex items-center justify-between">
          <span className="text-xs text-ink-muted">
            {savedAt
              ? `บันทึกเมื่อ ${new Date(savedAt).toLocaleTimeString('th-TH')}`
              : 'การเปลี่ยนแปลงจะถูกบันทึกเมื่อคุณคลิกบันทึก'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-border-subtle text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-primary text-white text-sm hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-ink-subtle">{label}</span>
      {children}
      {hint ? <span className="text-[10px] text-ink-muted">{hint}</span> : null}
    </label>
  );
}
