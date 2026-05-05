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
    label: 'Any document share',
    draft: {
      name: 'Document shared',
      description: 'Fires every time a document is shared with another user.',
      actionPattern: 'documents.shares.*',
      severity: 'WARN',
    },
  },
  {
    label: 'Sensitive document content (keyword scan)',
    draft: {
      name: 'Sensitive document keywords',
      description:
        'Scans every document/template create/update for sensitive keywords. Tweak the list to suit your compliance scope.',
      actionPattern: 'documents.*',
      metadataKeywords:
        'ssn,passport,credit card,social security,national id,medical record',
      severity: 'CRITICAL',
    },
  },
  {
    label: 'Bulk document deletes',
    draft: {
      name: 'Document deletes',
      actionPattern: 'documents.delete',
      severity: 'WARN',
    },
  },
  {
    label: 'Failed login attempts',
    draft: {
      name: 'Failed logins',
      actionPattern: 'auth.login',
      outcome: 'failure',
      severity: 'WARN',
    },
  },
  {
    label: 'Permission changes',
    draft: {
      name: 'Role / permission changes',
      actionPattern: 'admin.permissions.*',
      severity: 'INFO',
    },
  },
  {
    label: 'Member added or removed',
    draft: {
      name: 'Member changes',
      actionPattern: 'organization.member*.*',
      severity: 'INFO',
    },
  },
  {
    label: 'Catch-all: any failure',
    draft: {
      name: 'All failures',
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
      setError(err instanceof ApiError ? err.message : 'Save failed');
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
      setError('Name and action pattern are required.');
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
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">Compliance rules</h1>
        <p className="text-[12px] text-ink-muted">
          Define rules that watch the audit log and alert you when sensitive actions happen.
          Rules and keywords are stored in the database — no code changes needed to add or
          tweak them.
        </p>
      </header>

      {/* Alerts feed */}
      <section className="bg-white border border-border-subtle rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-ink" />
            <h2 className="text-[14px] font-semibold text-ink tracking-tightish">Recent alerts</h2>
          </div>
          <span className="text-xs text-ink-muted">
            {alertsQuery.data?.total ?? 0} total
          </span>
        </div>
        {alertsQuery.isLoading ? (
          <div className="text-[12px] text-ink-muted">Loading…</div>
        ) : (alertsQuery.data?.data ?? []).length === 0 ? (
          <div className="text-sm text-ink-muted py-3">
            No alerts yet. Create a rule below to start monitoring.
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
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    {a.actorEmail ? <span>by {a.actorEmail}</span> : null}
                    {a.action ? (
                      <span className="font-mono">{a.action}</span>
                    ) : null}
                    {a.matchedKeywords?.length ? (
                      <span className="text-amber-600">
                        keywords: {a.matchedKeywords.join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                {a.acknowledgedAt ? (
                  <span className="text-[10px] uppercase text-green-700 px-2 py-0.5 rounded bg-green-100">
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => ackMutation.mutate(a.id)}
                    disabled={ackMutation.isPending}
                    className="text-xs px-2 py-1 border border-border-subtle rounded hover:border-primary inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Acknowledge
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
            <h2 className="text-[14px] font-semibold text-ink tracking-tightish">Active rules</h2>
            <p className="text-xs text-ink-muted">
              Each rule is evaluated against every audit event.
            </p>
          </div>
          {canManage ? (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover"
            >
              <Plus className="w-4 h-4" /> New rule
            </button>
          ) : null}
        </div>
        <ul className="divide-y divide-border-default">
          {(rulesQuery.data ?? []).length === 0 ? (
            <li className="px-5 py-6 text-[12px] text-ink-muted">
              No rules yet. Create one above — start with a preset for common compliance scenarios.
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
                        Global
                      </span>
                    ) : null}
                    {!r.enabled ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-alt text-ink-muted">
                        Disabled
                      </span>
                    ) : null}
                  </div>
                  {r.description ? (
                    <div className="text-xs text-ink-muted">{r.description}</div>
                  ) : null}
                  <div className="text-[11px] text-ink-muted mt-1 space-x-2">
                    <span className="font-mono">action: {r.conditions.actionPattern}</span>
                    {r.conditions.metadataKeywords?.length ? (
                      <span className="text-amber-700">
                        keywords: {r.conditions.metadataKeywords.join(', ')}
                      </span>
                    ) : null}
                    {r.conditions.outcome && r.conditions.outcome !== 'any' ? (
                      <span>outcome: {r.conditions.outcome}</span>
                    ) : null}
                    {r.conditions.resourceType ? (
                      <span>resource: {r.conditions.resourceType}</span>
                    ) : null}
                    {r.notifyEmails ? <span>notifies: {r.notifyEmails}</span> : null}
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
                      Enabled
                    </label>
                    <button
                      onClick={() => editRule(r)}
                      className="p-1.5 rounded hover:bg-surface-alt text-ink-muted"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete rule "${r.name}"?`)) deleteMutation.mutate(r.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title="Delete"
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
              {draft.id ? 'Edit rule' : 'New rule'}
            </h2>
            <button
              onClick={() => {
                setDraft(null);
                setError(null);
              }}
              className="text-sm text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>

          {!draft.id ? (
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="text-ink-muted self-center">Quick start:</span>
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
            <Field label="Name" required>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
                required
              />
            </Field>
            <Field label="Severity">
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
            <Field label="Description" className="md:col-span-2">
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
                placeholder="What is this rule watching for?"
              />
            </Field>
            <Field
              label="Action pattern"
              required
              hint='Glob match against the audit action key. e.g. "documents.share", "documents.*", "*"'
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
              label="Sensitive keywords"
              hint="Comma-separated. Fires when ANY keyword appears in the request metadata. Leave empty to match every event."
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
            <Field label="Outcome">
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
                <option value="any">Any</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </Field>
            <Field label="Resource type" hint="Optional, e.g. documents, templates">
              <input
                value={draft.resourceType}
                onChange={(e) => setDraft({ ...draft, resourceType: e.target.value })}
                className="w-full px-2 py-1.5 border border-border-subtle rounded text-sm"
              />
            </Field>
            <Field
              label="Actor roles"
              hint="Comma-separated. Only fires when actor's role matches one. Leave empty for any role."
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
              label="Notify emails"
              hint="Comma-separated. Each match emails these addresses. Leave empty to record alerts in-app only."
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
              <Field label="Scope">
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
                  <option value="tenant">My organization only</option>
                  <option value="global">Global — every tenant</option>
                </select>
              </Field>
            ) : null}
            <Field label="Enabled">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                />
                <span className="text-xs text-ink-muted">
                  When off, the rule still exists but never fires.
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-4 py-1.5 rounded bg-primary text-white text-sm hover:bg-primary-hover disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving…' : draft.id ? 'Save changes' : 'Create rule'}
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
