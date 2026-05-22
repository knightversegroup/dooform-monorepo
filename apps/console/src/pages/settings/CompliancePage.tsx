import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, BellRing, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { authApi } from '../../lib/auth/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { useCan } from '../../lib/auth/useCan';
import { ApiError } from '../../lib/api/client';

type Severity = 'INFO' | 'WARN' | 'CRITICAL';

interface RuleDraft {
  id?: string;
  name: string;
  description: string;
  actionPattern: string;
  metadataKeywords: string;
  actorRoles: string;
  outcome: 'any' | 'success' | 'failure';
  resourceType: string;
  severity: Severity;
  enabled: boolean;
  notifyEmails: string;
  scope: 'tenant' | 'global';
}

const EMPTY_DRAFT: RuleDraft = {
  name: '',
  description: '',
  actionPattern: 'documents.*',
  metadataKeywords: '',
  actorRoles: '',
  outcome: 'any',
  resourceType: '',
  severity: 'WARN',
  enabled: true,
  notifyEmails: '',
  scope: 'tenant',
};

const PRESETS: Array<{ label: string; draft: Partial<RuleDraft> }> = [
  {
    label: 'การแชร์เอกสารทุกครั้ง',
    draft: {
      name: 'แชร์เอกสาร',
      description: 'ทำงานทุกครั้งที่มีการแชร์เอกสารให้ผู้ใช้คนอื่น',
      actionPattern: 'documents.shares.*',
      severity: 'WARN',
    },
  },
  {
    label: 'เนื้อหาเอกสารที่อ่อนไหว (สแกนคำสำคัญ)',
    draft: {
      name: 'คำสำคัญที่อ่อนไหวในเอกสาร',
      description:
        'สแกนการสร้าง/แก้ไขเอกสาร/เทมเพลตทุกครั้งเพื่อตรวจหาคำสำคัญที่อ่อนไหว ปรับรายการคำได้ตามขอบเขตการกำกับดูแลของคุณ',
      actionPattern: 'documents.*',
      metadataKeywords:
        'ssn,passport,credit card,social security,national id,medical record',
      severity: 'CRITICAL',
    },
  },
  {
    label: 'การลบเอกสารจำนวนมาก',
    draft: {
      name: 'การลบเอกสาร',
      actionPattern: 'documents.delete',
      severity: 'WARN',
    },
  },
  {
    label: 'การพยายามเข้าสู่ระบบไม่สำเร็จ',
    draft: {
      name: 'การล็อกอินล้มเหลว',
      actionPattern: 'auth.login',
      outcome: 'failure',
      severity: 'WARN',
    },
  },
  {
    label: 'การเปลี่ยนแปลงสิทธิ์',
    draft: {
      name: 'การเปลี่ยนบทบาท / สิทธิ์',
      actionPattern: 'admin.permissions.*',
      severity: 'INFO',
    },
  },
  {
    label: 'เพิ่มหรือลบสมาชิก',
    draft: {
      name: 'การเปลี่ยนแปลงสมาชิก',
      actionPattern: 'organization.member*.*',
      severity: 'INFO',
    },
  },
  {
    label: 'รวมทุกอย่าง: ความล้มเหลวทุกแบบ',
    draft: {
      name: 'ความล้มเหลวทั้งหมด',
      actionPattern: '*',
      outcome: 'failure',
      severity: 'WARN',
    },
  },
];

function severityClass(s: Severity): string {
  if (s === 'CRITICAL') return 'bg-red-100 text-red-700';
  if (s === 'WARN') return 'bg-amber-100 text-amber-700';
  return 'bg-sky-100 text-sky-700';
}

export default function CompliancePage() {
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';
  const canManage = useCan('organization:audit:manage');
  const qc = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['compliance', 'rules'],
    queryFn: () => authApi.listComplianceRules(),
  });
  const alertsQuery = useQuery({
    queryKey: ['compliance', 'alerts'],
    queryFn: () => authApi.listComplianceAlerts({ pageSize: 50 }),
    refetchInterval: 30_000,
  });

  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (d: RuleDraft) => {
      const conditions = {
        actionPattern: d.actionPattern,
        metadataKeywords: d.metadataKeywords
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        actorRoles: d.actorRoles
          ? d.actorRoles
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        outcome: d.outcome,
        resourceType: d.resourceType || undefined,
      };
      if (d.id) {
        return authApi.updateComplianceRule(d.id, {
          name: d.name,
          description: d.description,
          conditions,
          severity: d.severity,
          enabled: d.enabled,
          notifyEmails: d.notifyEmails,
        });
      }
      return authApi.createComplianceRule({
        name: d.name,
        description: d.description,
        conditions,
        severity: d.severity,
        enabled: d.enabled,
        notifyEmails: d.notifyEmails,
        scope: isGlobalAdmin ? d.scope : 'tenant',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compliance', 'rules'] });
      setDraft(null);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      authApi.updateComplianceRule(id, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compliance', 'rules'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteComplianceRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compliance', 'rules'] }),
  });

  const ackMutation = useMutation({
    mutationFn: (id: string) => authApi.acknowledgeComplianceAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compliance', 'alerts'] }),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || !draft.actionPattern.trim()) {
      setError('ต้องระบุชื่อและรูปแบบของแอ็กชัน');
      return;
    }
    saveMutation.mutate(draft);
  };

  const startNew = () => {
    setError(null);
    setDraft({ ...EMPTY_DRAFT });
  };

  const editRule = (rule: NonNullable<typeof rulesQuery.data>[number]) => {
    setError(null);
    setDraft({
      id: rule.id,
      name: rule.name,
      description: rule.description ?? '',
      actionPattern: rule.conditions.actionPattern,
      metadataKeywords: (rule.conditions.metadataKeywords ?? []).join(', '),
      actorRoles: (rule.conditions.actorRoles ?? []).join(', '),
      outcome: rule.conditions.outcome ?? 'any',
      resourceType: rule.conditions.resourceType ?? '',
      severity: rule.severity,
      enabled: rule.enabled,
      notifyEmails: rule.notifyEmails ?? '',
      scope: rule.organizationId === null ? 'global' : 'tenant',
    });
  };

  const applyPreset = (preset: Partial<RuleDraft>) => {
    setDraft((d) => ({ ...EMPTY_DRAFT, ...preset, ...(d?.id ? { id: d.id } : {}) }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">กฎการกำกับดูแล</h1>
        <p className="text-[12px] text-ink-muted">
          กำหนดกฎที่เฝ้าดูบันทึกการตรวจสอบและแจ้งเตือนคุณเมื่อมีการกระทำที่อ่อนไหว
          กฎและคำสำคัญถูกจัดเก็บในฐานข้อมูล — เพิ่มหรือปรับแก้ได้โดยไม่ต้องแก้โค้ด
        </p>
      </header>

      {/* Alerts feed */}
      <section className="bg-white border border-border-subtle rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-ink" />
            <h2 className="text-[14px] font-semibold text-ink tracking-tightish">การแจ้งเตือนล่าสุด</h2>
          </div>
          <span className="text-xs text-ink-muted">
            ทั้งหมด {alertsQuery.data?.total ?? 0} รายการ
          </span>
        </div>
        {alertsQuery.isLoading ? (
          <div className="text-[12px] text-ink-muted">กำลังโหลด…</div>
        ) : (alertsQuery.data?.data ?? []).length === 0 ? (
          <div className="text-sm text-ink-muted py-3">
            ยังไม่มีการแจ้งเตือน สร้างกฎด้านล่างเพื่อเริ่มเฝ้าดู
          </div>
        ) : (
          <ul className="divide-y divide-border-default">
            {alertsQuery.data!.data.map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${severityClass(a.severity)}`}>
                  {a.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink font-medium">{a.ruleName}</div>
                  <div className="text-xs text-ink-muted">{a.message}</div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-ink-muted mt-1">
                    <span>{new Date(a.createdAt).toLocaleString('th-TH')}</span>
                    {a.actorEmail ? <span>โดย {a.actorEmail}</span> : null}
                    {a.action ? (
                      <span className="font-mono">{a.action}</span>
                    ) : null}
                    {a.matchedKeywords?.length ? (
                      <span className="text-amber-600">
                        คำสำคัญ: {a.matchedKeywords.join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                {a.acknowledgedAt ? (
                  <span className="text-[10px] uppercase text-green-700 px-2 py-0.5 rounded bg-green-100">
                    รับทราบแล้ว
                  </span>
                ) : (
                  <button
                    onClick={() => ackMutation.mutate(a.id)}
                    disabled={ackMutation.isPending}
                    className="text-xs px-2 py-1 border border-border-subtle rounded hover:border-primary inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> รับทราบ
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rules list */}
      <section className="bg-white border border-border-subtle rounded-lg">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-ink tracking-tightish">กฎที่ใช้งานอยู่</h2>
            <p className="text-xs text-ink-muted">
              กฎแต่ละข้อจะถูกประเมินกับทุกเหตุการณ์ในบันทึกการตรวจสอบ
            </p>
          </div>
          {canManage ? (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover"
            >
              <Plus className="w-4 h-4" /> กฎใหม่
            </button>
          ) : null}
        </div>
        <ul className="divide-y divide-border-default">
          {(rulesQuery.data ?? []).length === 0 ? (
            <li className="px-5 py-6 text-[12px] text-ink-muted">
              ยังไม่มีกฎ สร้างใหม่ด้านบน — เริ่มจากพรีเซ็ตของสถานการณ์การกำกับดูแลที่พบบ่อย
            </li>
          ) : (
            rulesQuery.data!.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-start gap-3">
                <span
                  className={`text-[10px] uppercase px-2 py-0.5 rounded ${severityClass(r.severity)}`}
                >
                  {r.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-ink">{r.name}</div>
                    {r.organizationId === null ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                        ทั้งระบบ
                      </span>
                    ) : null}
                    {!r.enabled ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-alt text-ink-muted">
                        ปิดใช้งาน
                      </span>
                    ) : null}
                  </div>
                  {r.description ? (
                    <div className="text-xs text-ink-muted">{r.description}</div>
                  ) : null}
                  <div className="text-[11px] text-ink-muted mt-1 space-x-2">
                    <span className="font-mono">แอ็กชัน: {r.conditions.actionPattern}</span>
                    {r.conditions.metadataKeywords?.length ? (
                      <span className="text-amber-700">
                        คำสำคัญ: {r.conditions.metadataKeywords.join(', ')}
                      </span>
                    ) : null}
                    {r.conditions.outcome && r.conditions.outcome !== 'any' ? (
                      <span>ผลลัพธ์: {r.conditions.outcome}</span>
                    ) : null}
                    {r.conditions.resourceType ? (
                      <span>รีซอร์ส: {r.conditions.resourceType}</span>
                    ) : null}
                    {r.notifyEmails ? <span>แจ้งเตือน: {r.notifyEmails}</span> : null}
                  </div>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) =>
                          toggleMutation.mutate({ id: r.id, enabled: e.target.checked })
                        }
                      />
                      เปิดใช้งาน
                    </label>
                    <button
                      onClick={() => editRule(r)}
                      className="p-1.5 rounded hover:bg-surface-alt text-ink-muted"
                      title="แก้ไข"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`ลบกฎ "${r.name}" หรือไม่?`)) deleteMutation.mutate(r.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Editor */}
      {draft ? (
        <section className="bg-white border border-border-subtle rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-ink tracking-tightish">
              {draft.id ? 'แก้ไขกฎ' : 'กฎใหม่'}
            </h2>
            <button
              onClick={() => {
                setDraft(null);
                setError(null);
              }}
              className="text-sm text-ink-muted hover:text-ink"
            >
              ยกเลิก
            </button>
          </div>

          {!draft.id ? (
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="text-ink-muted self-center">เริ่มต้นด่วน:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.draft)}
                  className="px-2 py-1 rounded border border-border-subtle hover:border-primary"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="ชื่อ" required>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
                required
              />
            </Field>
            <Field label="ระดับความรุนแรง">
              <select
                value={draft.severity}
                onChange={(e) =>
                  setDraft({ ...draft, severity: e.target.value as Severity })
                }
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
              >
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </Field>
            <Field label="คำอธิบาย" className="md:col-span-2">
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
                placeholder="กฎนี้กำลังเฝ้าดูสิ่งใด?"
              />
            </Field>
            <Field
              label="รูปแบบของแอ็กชัน"
              required
              hint='จับคู่แบบ glob กับคีย์ของแอ็กชันในบันทึกการตรวจสอบ เช่น "documents.share", "documents.*", "*"'
              className="md:col-span-2"
            >
              <input
                value={draft.actionPattern}
                onChange={(e) =>
                  setDraft({ ...draft, actionPattern: e.target.value })
                }
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm font-mono"
                required
              />
            </Field>
            <Field
              label="คำสำคัญที่อ่อนไหว"
              hint="คั่นด้วยจุลภาค ทำงานเมื่อพบคำสำคัญใด ๆ ใน metadata ของคำขอ เว้นว่างเพื่อจับคู่ทุกเหตุการณ์"
              className="md:col-span-2"
            >
              <input
                value={draft.metadataKeywords}
                onChange={(e) =>
                  setDraft({ ...draft, metadataKeywords: e.target.value })
                }
                placeholder="ssn, passport, credit card"
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </Field>
            <Field label="ผลลัพธ์">
              <select
                value={draft.outcome}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    outcome: e.target.value as 'any' | 'success' | 'failure',
                  })
                }
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
              >
                <option value="any">ทั้งหมด</option>
                <option value="success">สำเร็จ</option>
                <option value="failure">ล้มเหลว</option>
              </select>
            </Field>
            <Field label="ประเภทรีซอร์ส" hint="ไม่บังคับ เช่น documents, templates">
              <input
                value={draft.resourceType}
                onChange={(e) => setDraft({ ...draft, resourceType: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </Field>
            <Field
              label="บทบาทของผู้กระทำ"
              hint="คั่นด้วยจุลภาค ทำงานเฉพาะเมื่อบทบาทของผู้กระทำตรงกับรายการ เว้นว่างเพื่อรับทุกบทบาท"
              className="md:col-span-2"
            >
              <input
                value={draft.actorRoles}
                onChange={(e) => setDraft({ ...draft, actorRoles: e.target.value })}
                placeholder="USER, ORG_ADMIN"
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </Field>
            <Field
              label="อีเมลผู้รับการแจ้งเตือน"
              hint="คั่นด้วยจุลภาค ทุกครั้งที่ตรงกับกฎจะส่งอีเมลไปยังที่อยู่เหล่านี้ เว้นว่างเพื่อบันทึกการแจ้งเตือนเฉพาะในแอป"
              className="md:col-span-2"
            >
              <input
                value={draft.notifyEmails}
                onChange={(e) => setDraft({ ...draft, notifyEmails: e.target.value })}
                placeholder="security@yourco.com, admin@yourco.com"
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </Field>
            {isGlobalAdmin ? (
              <Field label="ขอบเขต">
                <select
                  value={draft.scope}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      scope: e.target.value as 'tenant' | 'global',
                    })
                  }
                  className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm bg-white"
                  disabled={!!draft.id}
                >
                  <option value="tenant">เฉพาะองค์กรของฉันเท่านั้น</option>
                  <option value="global">ทั้งระบบ — ทุกผู้เช่า</option>
                </select>
              </Field>
            ) : null}
            <Field label="เปิดใช้งาน">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                />
                <span className="text-xs text-ink-muted">
                  เมื่อปิดอยู่ กฎยังคงอยู่ในระบบแต่จะไม่ทำงาน
                </span>
              </label>
            </Field>

            {error ? (
              <div className="md:col-span-2 flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
              </div>
            ) : null}

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="px-4 py-1.5 rounded border border-border-subtle text-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-4 py-1.5 rounded bg-primary text-white text-sm hover:bg-primary-hover disabled:opacity-50"
              >
                {saveMutation.isPending ? 'กำลังบันทึก…' : draft.id ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างกฎ'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-ink-subtle">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
      {hint ? <span className="text-[10px] text-ink-muted">{hint}</span> : null}
    </label>
  );
}
