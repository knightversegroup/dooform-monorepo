import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  createCollection,
  createEntry,
  deleteCollection,
  deleteEntry,
  listCollections,
  listEntries,
  publishCollection,
  unpublishCollection,
  updateCollection,
  updateEntry,
} from '../lib/api/dictionary';
import { useDictionaryOwnership } from '../lib/auth/useDictionaryOwnership';
import { useAuth } from '../lib/auth/AuthContext';
import { queryKeys } from '../lib/queryClient';
import type {
  DictionaryCollection,
  DictionaryEntry,
  DictionaryScope,
  DictionaryScopeFilter,
} from '../lib/api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const SCOPE_FILTERS: DictionaryScopeFilter[] = ['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'];

export default function DictionaryAdminPage() {
  const [scope, setScope] = useState<DictionaryScopeFilter>('ALL');
  const [search, setSearch] = useState('');
  const [openCollection, setOpenCollection] = useState<DictionaryCollection | null>(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [editCollection, setEditCollection] = useState<DictionaryCollection | null>(null);

  const queryClient = useQueryClient();
  const { canEdit, canDelete, canCreateScope } = useDictionaryOwnership();
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

  const params = useMemo(
    () => ({ scope, search: search || undefined, page: 0, pageSize: 100 }),
    [scope, search],
  );
  const collectionsQuery = useQuery({
    queryKey: queryKeys.dictionary.collections(params),
    queryFn: () => listCollections(params),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dictionary.all });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => {
      invalidate();
      setOpenCollection(null);
    },
  });
  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? publishCollection(id) : unpublishCollection(id),
    onSuccess: invalidate,
  });

  if (openCollection) {
    return (
      <CollectionEntriesView
        collection={openCollection}
        onBack={() => setOpenCollection(null)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="พจนานุกรม"
        description="สร้างและจัดการคอลเลกชันพจนานุกรมของคุณ แต่ละคอลเลกชันเก็บคำศัพท์ที่ผู้ใช้คนอื่นสามารถเรียกดูจากแผงด้านขวาได้"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewCollection(true)}
          >
            <Plus className="w-3.5 h-3.5" /> คอลเลกชันใหม่
          </Button>
        }
      />

      <div className="px-6 py-3 flex flex-col md:flex-row gap-2 border-b border-border-subtle bg-white">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาคอลเลกชัน…"
          className="flex-1 px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-1">
          {SCOPE_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              type="button"
              className={`px-2 py-1 rounded text-[11px] uppercase tracking-wide ${
                scope === s
                  ? 'bg-primary text-white'
                  : 'bg-bg-subtle text-ink-subtle hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 py-5">
        {collectionsQuery.isLoading ? <PageLoader /> : null}
        {collectionsQuery.error ? <ErrorMessage error={collectionsQuery.error} /> : null}

        {collectionsQuery.data?.data?.length ? (
          <div className="overflow-x-auto rounded-md border border-border-subtle bg-white">
            <table className="w-full text-[13px]">
              <thead className="bg-bg-subtle text-ink-muted">
                <tr className="border-b border-border-subtle">
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    ชื่อ
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    ขอบเขต
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    สถานะ
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    อัปเดต
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {collectionsQuery.data.data.map((c) => (
                  <tr key={c.id} className="border-b border-border-subtle hover:bg-bg-subtle/60">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setOpenCollection(c)}
                        className="font-medium text-ink hover:text-primary text-left"
                      >
                        {c.name}
                      </button>
                      {c.description ? (
                        <div className="text-[11px] text-ink-faint truncate">
                          {c.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <ScopeBadge scope={c.scope} />
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={c.status === 'PUBLISHED' ? 'success' : 'warn'} caps>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-ink-muted whitespace-nowrap">
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {canEdit(c) ? (
                          <button
                            type="button"
                            onClick={() => setEditCollection(c)}
                            className="p-1 rounded text-ink-faint hover:bg-bg-subtle hover:text-ink"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                        {canEdit(c) && c.scope === 'GLOBAL' && isGlobalAdmin ? (
                          c.status === 'PUBLISHED' ? (
                            <button
                              type="button"
                              onClick={() =>
                                publishMutation.mutate({ id: c.id, publish: false })
                              }
                              disabled={publishMutation.isPending}
                              className="p-1 rounded text-ink-faint hover:bg-bg-subtle hover:text-ink disabled:opacity-50"
                              title="ยกเลิกการเผยแพร่"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                publishMutation.mutate({ id: c.id, publish: true })
                              }
                              disabled={publishMutation.isPending}
                              className="p-1 rounded text-primary hover:bg-primary/10 disabled:opacity-50"
                              title="เผยแพร่"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : null}
                        {canDelete(c) ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`ลบคอลเลกชัน "${c.name}" และคำทั้งหมดในนั้นหรือไม่?`)) {
                                deleteCollectionMutation.mutate(c.id);
                              }
                            }}
                            disabled={deleteCollectionMutation.isPending}
                            className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !collectionsQuery.isLoading ? (
          <p className="text-[13px] text-ink-muted">
            ยังไม่มีคอลเลกชัน คลิก <strong>คอลเลกชันใหม่</strong> เพื่อสร้าง
          </p>
        ) : null}
      </section>

      {showNewCollection ? (
        <CollectionFormModal
          initial={null}
          canCreateScope={canCreateScope}
          onClose={() => setShowNewCollection(false)}
        />
      ) : null}
      {editCollection ? (
        <CollectionFormModal
          initial={editCollection}
          canCreateScope={canCreateScope}
          onClose={() => setEditCollection(null)}
        />
      ) : null}
    </div>
  );
}

// ---------------- Collection form (create/edit) ----------------

function CollectionFormModal({
  initial,
  canCreateScope,
  onClose,
}: {
  initial: DictionaryCollection | null;
  canCreateScope: (s: DictionaryScope) => boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [scope, setScope] = useState<DictionaryScope>(initial?.scope ?? 'PERSONAL');

  const allScopes: DictionaryScope[] = ['PERSONAL', 'ORGANIZATION', 'GLOBAL'];
  const visibleScopes = allScopes.filter(
    (s) => canCreateScope(s) || (initial?.scope === s),
  );

  const mutation = useMutation({
    mutationFn: () =>
      initial
        ? updateCollection(initial.id, { name, description: description || null, scope })
        : createCollection({ name, description: description || null, scope }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictionary.all });
      onClose();
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <ModalShell title={initial ? 'แก้ไขคอลเลกชัน' : 'คอลเลกชันใหม่'} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="ชื่อ">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="คำอธิบาย (ไม่บังคับ)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="ขอบเขต">
          <div className="flex flex-wrap gap-1">
            {visibleScopes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setScope(s)}
                className={`px-2 py-1 rounded text-[11px] uppercase tracking-wide ${
                  scope === s
                    ? 'bg-primary text-white'
                    : 'bg-bg-subtle text-ink-subtle hover:text-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            {scope === 'PERSONAL'
              ? 'มองเห็นเฉพาะคุณเท่านั้น คุณเป็นผู้จัดการคำศัพท์ในคอลเลกชันนี้'
              : scope === 'ORGANIZATION'
              ? 'มองเห็นได้ทุกคนในองค์กรของคุณ ผู้ดูแลองค์กรและคุณสามารถจัดการได้'
              : 'รายการในตลาด — มองเห็นได้ทุก tenant เมื่อเผยแพร่แล้ว เฉพาะผู้ดูแลทั้งระบบเท่านั้น'}
          </p>
        </Field>
        {mutation.error ? <ErrorMessage error={mutation.error} /> : null}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-md text-[12px] text-ink-subtle hover:bg-bg-subtle"
          >
            ยกเลิก
          </button>
          <Button type="submit" size="sm" disabled={mutation.isPending || !name.trim()}>
            {mutation.isPending ? <Spinner className="text-white" /> : <Save className="w-3.5 h-3.5" />}
            บันทึก
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------------- Entries view (inside one collection) ----------------

function CollectionEntriesView({
  collection,
  onBack,
}: {
  collection: DictionaryCollection;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { canEdit } = useDictionaryOwnership();
  const ownsCollection = canEdit(collection);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<DictionaryEntry | null>(null);
  const [showNew, setShowNew] = useState(false);

  const params = useMemo(
    () => ({ search: search || undefined, page: 0, pageSize: 500 }),
    [search],
  );
  const entriesQuery = useQuery({
    queryKey: queryKeys.dictionary.entries(collection.id, params),
    queryFn: () => listEntries(collection.id, params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.dictionary.entries(collection.id, params),
      }),
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={collection.name}
        description={collection.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            {ownsCollection ? (
              <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
                <Plus className="w-3.5 h-3.5" /> เพิ่มคำ
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="w-3.5 h-3.5" /> ย้อนกลับ
            </Button>
          </div>
        }
      />

      <div className="px-6 py-3 flex items-center gap-2 border-b border-border-subtle bg-white">
        <ScopeBadge scope={collection.scope} />
        <Badge tone={collection.status === 'PUBLISHED' ? 'success' : 'warn'} caps>
          {collection.status}
        </Badge>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาคำ…"
          className="ml-auto px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <section className="px-6 py-5">
        {entriesQuery.isLoading ? <PageLoader /> : null}
        {entriesQuery.error ? <ErrorMessage error={entriesQuery.error} /> : null}

        {entriesQuery.data?.data?.length ? (
          <div className="overflow-x-auto rounded-md border border-border-subtle bg-white">
            <table className="w-full text-[13px]">
              <thead className="bg-bg-subtle text-ink-muted">
                <tr className="border-b border-border-subtle">
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    คำ (อังกฤษ)
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    ศัพท์
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium">
                    คำนิยาม
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {entriesQuery.data.data.map((e) => (
                  <tr key={e.id} className="border-b border-border-subtle hover:bg-bg-subtle/60">
                    <td className="px-3 py-2 font-medium text-ink">{e.term}</td>
                    <td className="px-3 py-2 text-ink-muted">{e.termTh ?? '—'}</td>
                    <td className="px-3 py-2 text-ink-subtle">
                      <div className="line-clamp-2">{e.definition}</div>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {ownsCollection ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(e)}
                            className="p-1 rounded text-ink-faint hover:bg-bg-subtle hover:text-ink"
                            title="แก้ไข"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`ลบ "${e.term}" หรือไม่?`)) deleteMutation.mutate(e.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !entriesQuery.isLoading ? (
          <p className="text-[13px] text-ink-muted">
            {ownsCollection
              ? 'ยังไม่มีคำ คลิก "เพิ่มคำ" เพื่อเริ่มเพิ่มคำในคอลเลกชันนี้'
              : 'คอลเลกชันนี้ยังไม่มีคำ'}
          </p>
        ) : null}
      </section>

      {showNew ? (
        <EntryFormModal
          collectionId={collection.id}
          initial={null}
          onClose={() => setShowNew(false)}
        />
      ) : null}
      {editing ? (
        <EntryFormModal
          collectionId={collection.id}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function EntryFormModal({
  collectionId,
  initial,
  onClose,
}: {
  collectionId: string;
  initial: DictionaryEntry | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState(initial?.term ?? '');
  const [termTh, setTermTh] = useState(initial?.termTh ?? '');
  const [definition, setDefinition] = useState(initial?.definition ?? '');
  const [definitionTh, setDefinitionTh] = useState(initial?.definitionTh ?? '');

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        term: term.trim(),
        termTh: termTh.trim() || null,
        definition: definition.trim(),
        definitionTh: definitionTh.trim() || null,
      };
      return initial ? updateEntry(initial.id, payload) : createEntry(collectionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictionary.all });
      onClose();
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    mutation.mutate();
  };

  return (
    <ModalShell title={initial ? 'แก้ไขคำ' : 'เพิ่มคำ'} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="คำ (ภาษาอังกฤษ)">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            required
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="ศัพท์ (ภาษาไทย)">
          <input
            value={termTh}
            onChange={(e) => setTermTh(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="คำนิยาม (ภาษาอังกฤษ)">
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            required
            rows={4}
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="คำนิยาม (ภาษาไทย)">
          <textarea
            value={definitionTh}
            onChange={(e) => setDefinitionTh(e.target.value)}
            rows={4}
            className="w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Field>
        {mutation.error ? <ErrorMessage error={mutation.error} /> : null}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-md text-[12px] text-ink-subtle hover:bg-bg-subtle"
          >
            ยกเลิก
          </button>
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending || !term.trim() || !definition.trim()}
          >
            {mutation.isPending ? <Spinner className="text-white" /> : <Save className="w-3.5 h-3.5" />}
            บันทึก
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------------- Bits ----------------

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-md border border-border-subtle bg-white shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-ink-faint hover:bg-bg-subtle hover:text-ink"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-ink-faint mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function ScopeBadge({ scope }: { scope: DictionaryScope }) {
  const cls =
    scope === 'GLOBAL'
      ? 'bg-indigo-50 text-indigo-700'
      : scope === 'ORGANIZATION'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-bg-subtle text-ink-muted';
  const Icon = scope === 'GLOBAL' ? Globe : scope === 'ORGANIZATION' ? Building2 : User;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${cls}`}
    >
      <Icon className="w-3 h-3" />
      {scope}
    </span>
  );
}
