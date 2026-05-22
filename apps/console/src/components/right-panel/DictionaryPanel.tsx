import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Globe,
  Search,
  User,
} from 'lucide-react';
import { listCollections, listEntries } from '../../lib/api/dictionary';
import { queryKeys } from '../../lib/queryClient';
import type {
  DictionaryCollection,
  DictionaryEntry,
  DictionaryScopeFilter,
} from '../../lib/api/types';
import { useRightPanel } from './RightPanelContext';
import { Spinner } from '../ui/Spinner';
import { ErrorMessage } from '../ui/ErrorMessage';

type Mode =
  | { kind: 'collections' }
  | { kind: 'entries'; collection: DictionaryCollection }
  | { kind: 'detail'; collection: DictionaryCollection; entry: DictionaryEntry };

const SCOPES: DictionaryScopeFilter[] = ['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'];

/**
 * Read-only dictionary browser. Hierarchy: collection → entries inside it → entry detail.
 * No add/edit/delete actions live here — owners manage collections from the dedicated
 * admin page at /dictionary. Users who want to add words ask the collection's owner.
 */
export function DictionaryPanel() {
  const { defaultScope } = useRightPanel();
  const [scope, setScope] = useState<DictionaryScopeFilter>(defaultScope);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mode, setMode] = useState<Mode>({ kind: 'collections' });

  useEffect(() => {
    setScope(defaultScope);
  }, [defaultScope]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(t);
  }, [search]);

  if (mode.kind === 'detail') {
    return (
      <EntryDetail
        collection={mode.collection}
        entry={mode.entry}
        onBack={() => setMode({ kind: 'entries', collection: mode.collection })}
      />
    );
  }

  if (mode.kind === 'entries') {
    return (
      <EntriesView
        collection={mode.collection}
        onBack={() => setMode({ kind: 'collections' })}
        onOpen={(entry) => setMode({ kind: 'detail', collection: mode.collection, entry })}
      />
    );
  }

  return (
    <CollectionsView
      scope={scope}
      setScope={setScope}
      search={search}
      setSearch={setSearch}
      debouncedSearch={debouncedSearch}
      onOpen={(collection) => setMode({ kind: 'entries', collection })}
    />
  );
}

function CollectionsView({
  scope,
  setScope,
  search,
  setSearch,
  debouncedSearch,
  onOpen,
}: {
  scope: DictionaryScopeFilter;
  setScope: (s: DictionaryScopeFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  debouncedSearch: string;
  onOpen: (c: DictionaryCollection) => void;
}) {
  const params = useMemo(
    () => ({ scope, search: debouncedSearch || undefined, page: 0, pageSize: 100 }),
    [scope, debouncedSearch],
  );
  const query = useQuery({
    queryKey: queryKeys.dictionary.collections(params),
    queryFn: () => listCollections(params),
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-border-subtle space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาคอลเลกชัน…"
            className="w-full pl-8 pr-2 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1">
          {SCOPES.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              type="button"
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
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

      <div className="flex-1 min-h-0 overflow-y-auto">
        {query.isLoading ? (
          <div className="p-6 flex justify-center">
            <Spinner />
          </div>
        ) : query.error ? (
          <div className="p-3">
            <ErrorMessage error={query.error} />
          </div>
        ) : (query.data?.data ?? []).length === 0 ? (
          <div className="p-6 text-center text-[12px] text-ink-faint">
            ยังไม่มีคอลเลกชัน
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {query.data!.data.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onOpen(c)}
                  className="w-full text-left px-3 py-2 hover:bg-bg-subtle flex items-start gap-2"
                >
                  <ScopeIcon scope={c.scope} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink truncate">{c.name}</div>
                    {c.description ? (
                      <div className="text-[11px] text-ink-faint line-clamp-1">
                        {c.description}
                      </div>
                    ) : null}
                  </div>
                  {c.scope === 'GLOBAL' && c.status === 'DRAFT' ? (
                    <span className="text-[9px] uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      ฉบับร่าง
                    </span>
                  ) : null}
                  <ChevronRight className="w-3 h-3 text-ink-faint mt-0.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EntriesView({
  collection,
  onBack,
  onOpen,
}: {
  collection: DictionaryCollection;
  onBack: () => void;
  onOpen: (e: DictionaryEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(t);
  }, [search]);

  const params = useMemo(
    () => ({ search: debouncedSearch || undefined, page: 0, pageSize: 200 }),
    [debouncedSearch],
  );
  const query = useQuery({
    queryKey: queryKeys.dictionary.entries(collection.id, params),
    queryFn: () => listEntries(collection.id, params),
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-md text-ink-faint hover:bg-bg-subtle hover:text-ink"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink truncate">{collection.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-faint">
              {collection.scope}
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาคำ…"
            className="w-full pl-8 pr-2 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {query.isLoading ? (
          <div className="p-6 flex justify-center">
            <Spinner />
          </div>
        ) : query.error ? (
          <div className="p-3">
            <ErrorMessage error={query.error} />
          </div>
        ) : (query.data?.data ?? []).length === 0 ? (
          <div className="p-6 text-center text-[12px] text-ink-faint">
            ยังไม่มีคำ ขอให้เจ้าของคอลเลกชันเพิ่มคำเข้าไป
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {query.data!.data.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onOpen(e)}
                  className="w-full text-left px-3 py-2 hover:bg-bg-subtle flex items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink truncate">
                      {e.term}
                      {e.termTh ? (
                        <span className="text-ink-muted font-normal"> · {e.termTh}</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-ink-faint line-clamp-1">
                      {e.definition}
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-ink-faint mt-0.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EntryDetail({
  collection,
  entry,
  onBack,
}: {
  collection: DictionaryCollection;
  entry: DictionaryEntry;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border-subtle flex items-center gap-2">
        <button
          onClick={onBack}
          type="button"
          className="p-1 rounded-md text-ink-faint hover:bg-bg-subtle hover:text-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[13px] font-medium text-ink truncate">{collection.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div>
          <div className="text-[15px] font-semibold text-ink">{entry.term}</div>
          {entry.termTh ? (
            <div className="text-[13px] text-ink-muted">{entry.termTh}</div>
          ) : null}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">
            คำนิยาม
          </div>
          <div className="text-[13px] text-ink whitespace-pre-wrap">{entry.definition}</div>
        </div>

        {entry.definitionTh ? (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">
              คำนิยาม
            </div>
            <div className="text-[13px] text-ink whitespace-pre-wrap">{entry.definitionTh}</div>
          </div>
        ) : null}

        <div className="text-[10px] text-ink-faint pt-2 border-t border-border-subtle">
          ต้องการแก้ไข? ติดต่อเจ้าของคอลเลกชันนี้
        </div>
      </div>
    </div>
  );
}

function ScopeIcon({ scope }: { scope: DictionaryCollection['scope'] }) {
  if (scope === 'PERSONAL')
    return <User className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" />;
  if (scope === 'ORGANIZATION')
    return <Building2 className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" />;
  return <Globe className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" />;
}
