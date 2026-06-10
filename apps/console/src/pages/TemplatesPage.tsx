import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowDownAZ,
  ArrowUpRight,
  ArrowUpZA,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  FileText,
  Globe,
  Plus,
  Search,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import {
  archiveTemplate,
  deleteTemplate,
  getFieldDefinitions,
  getThumbnailUrl,
  listTemplates,
  publishTemplate,
  suggestAliases,
  unpublishTemplate,
  updateFieldDefinitions,
} from '../lib/api/templates';
import { listDocumentTypes } from '../lib/api/documentTypes';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { Template } from '../lib/api/types';
import { useCan } from '../lib/auth/useCan';
import { useTemplateOwnership } from '../lib/auth/useTemplateOwnership';

const PAGE_SIZE = 500;
const ALPHABET = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '#',
];

function displayNameOf(t: Template): string {
  return t.displayName ?? t.name ?? '';
}

function bucketLetter(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(ch) ? ch : '#';
}

export default function TemplatesPage() {
  const canCreateTemplate = useCan('templates:create');
  const canUpdateTemplate = useCan('templates:update');
  const canDeleteTemplate = useCan('templates:delete');
  const { canEdit: canEditTemplate, canDelete: canDeleteOwnedTemplate } =
    useTemplateOwnership();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAiProgress, setBulkAiProgress] = useState<{
    running: boolean;
    current: number;
    total: number;
    currentName: string;
  } | null>(null);

  const params = useMemo(
    () => ({
      status: status || undefined,
      page: 0,
      pageSize: PAGE_SIZE,
    }),
    [status]
  );

  const templatesQuery = useQuery({
    queryKey: queryKeys.templates.list(params),
    queryFn: () => listTemplates(params),
  });

  const docTypesQuery = useQuery({
    queryKey: queryKeys.documentTypes.list(),
    queryFn: () => listDocumentTypes(),
  });

  const allTemplates = templatesQuery.data?.data ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
  }, [queryClient]);

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishTemplate(id),
    onSuccess: invalidate,
  });
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishTemplate(id),
    onSuccess: invalidate,
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveTemplate(id),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: invalidate,
  });

  const recentTemplates = useMemo(() => {
    return [...allTemplates]
      .filter((t) => !!t.updatedAt)
      .sort((a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime()
      )
      .slice(0, 8);
  }, [allTemplates]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allTemplates;
    return allTemplates.filter((t) => {
      const haystack = `${displayNameOf(t)} ${t.description ?? ''} ${t.type ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [allTemplates, search]);

  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const cmp = displayNameOf(a).localeCompare(displayNameOf(b));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    const groups: Record<string, Template[]> = {};
    sorted.forEach((t) => {
      const letter = bucketLetter(displayNameOf(t));
      (groups[letter] ??= []).push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      const cmp = a.localeCompare(b);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortDirection]);

  const availableLetters = useMemo(() => {
    const s = new Set<string>();
    filtered.forEach((t) => s.add(bucketLetter(displayNameOf(t))));
    return s;
  }, [filtered]);

  const alphabetNavRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollAlphabetNav = useCallback((direction: 'left' | 'right') => {
    if (!alphabetNavRef.current) return;
    alphabetNavRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    setActiveLetter(letter);
    letterRefs.current[letter]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const toggleSelected = useCallback((template: Template) => {
    if (!canEditTemplate(template)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(template.id)) next.delete(template.id);
      else next.add(template.id);
      return next;
    });
  }, [canEditTemplate]);

  const allSelectable = filtered.filter(canEditTemplate);
  const allSelectableIds = useMemo(
    () => allSelectable.map((t) => t.id),
    [allSelectable]
  );
  const allSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        allSelectableIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      allSelectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectedTemplates = useMemo(
    () => allTemplates.filter((t) => selectedIds.has(t.id)),
    [allTemplates, selectedIds]
  );
  const selectedCount = selectedTemplates.length;
  const canBulkDelete = selectedTemplates.every(canDeleteOwnedTemplate);
  const isMutating =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  const runBulk = async (
    label: string,
    confirmMsg: string,
    fn: (id: string) => Promise<unknown>,
  ) => {
    if (!selectedCount) return;
    if (!confirm(`${confirmMsg} (${selectedCount} รายการ)`)) return;
    for (const id of selectedIds) {
      try {
        await fn(id);
      } catch (err) {
        console.error(`${label} failed for ${id}`, err);
      }
    }
    setSelectedIds(new Set());
    invalidate();
  };

  const runBulkAiSuggest = async () => {
    const templates = allTemplates;
    if (templates.length === 0) return;
    if (
      !confirm(
        `ใช้ AI แนะนำชื่อฟิลด์สำหรับเทมเพลตทั้งหมด ${templates.length} รายการ?\n\nกระบวนการนี้อาจใช้เวลาสักครู่`,
      )
    )
      return;

    setBulkAiProgress({ running: true, current: 0, total: templates.length, currentName: '' });
    let successCount = 0;
    let fieldsUpdated = 0;

    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      const name = t.displayName || t.name || '';
      setBulkAiProgress({ running: true, current: i + 1, total: templates.length, currentName: name });

      try {
        // Get field definitions
        const fieldsRes = await getFieldDefinitions(t.id);
        const fields = fieldsRes.fieldDefinitions || [];
        if (fields.length === 0) continue;

        // Get AI suggestions
        const placeholders = fields.map((f) => f.placeholder);
        const suggestRes = await suggestAliases(t.id, placeholders, name);
        const suggestions = suggestRes.suggestions || [];
        if (suggestions.length === 0) continue;

        // Apply suggestions
        const updated = fields.map((f) => {
          const s = suggestions.find((x) => x.placeholder === f.placeholder);
          if (s) {
            fieldsUpdated++;
            return { ...f, label: `${s.label_th} / ${s.label_en}` };
          }
          return f;
        });

        // Save
        await updateFieldDefinitions(t.id, updated);
        successCount++;
      } catch (err) {
        console.error(`AI suggest failed for ${t.id}:`, err);
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }

    setBulkAiProgress(null);
    alert(
      `เสร็จสิ้น!\n\n✅ สำเร็จ: ${successCount}/${templates.length} เทมเพลต\n📝 อัปเดตฟิลด์: ${fieldsUpdated} รายการ`,
    );
    invalidate();
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="เทมเพลต"
        description="ดู จัดการ และแก้ไขเทมเพลตแบบกลุ่ม"
        actions={
          <div className="flex items-center gap-2">
            {bulkAiProgress ? (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Spinner className="w-4 h-4" />
                <span>
                  {bulkAiProgress.current}/{bulkAiProgress.total}
                </span>
                <span className="max-w-[150px] truncate">{bulkAiProgress.currentName}</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={runBulkAiSuggest}
                disabled={allTemplates.length === 0}
                title="ใช้ AI แนะนำชื่อฟิลด์สำหรับเทมเพลตทั้งหมด"
              >
                <Wand2 className="w-3.5 h-3.5" /> AI แนะนำชื่อทั้งหมด
              </Button>
            )}
            {canCreateTemplate ? (
              <Link to="/templates/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-3.5 h-3.5" /> อัปโหลดเทมเพลต
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="w-full px-6 py-8 flex flex-col gap-[32px]">
        {/* Document type groups */}
        {docTypesQuery.data?.length ? (
          <section className="flex flex-col gap-[20px]">
            <div>
              <h2 className="text-[24px] font-semibold text-black">กลุ่มประเภทเอกสาร</h2>
              <p className="text-[16px] font-normal text-black mt-[2px]">
                เข้าไปยังหมวดหมู่เพื่อจัดการเทมเพลตประเภทต่าง ๆ ในที่เดียว
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {docTypesQuery.data.map((dt) => (
                <Link
                  key={dt.id}
                  to={`/templates/group/${dt.id}`}
                  className="border border-[#e6e6e6] rounded-md px-3 py-2.5 bg-white hover:bg-stone-50 transition-colors"
                >
                  <div className="font-medium text-black text-[13px] truncate">{dt.name}</div>
                  {dt.category ? (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {dt.category.replace(/_/g, ' ')}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Recent templates strip */}
        {recentTemplates.length > 0 && (
          <section className="flex flex-col gap-[20px]">
            <div>
              <h2 className="text-[24px] font-semibold text-black">เทมเพลตล่าสุด</h2>
              <p className="text-[16px] font-normal text-black mt-[2px]">
                เทมเพลตที่อัปเดตล่าสุดในเวิร์กสเปซของคุณ
              </p>
            </div>
            <div className="relative">
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-hide">
                {recentTemplates.map((tmpl) => (
                  <RecentTemplateCard key={tmpl.id} template={tmpl} />
                ))}
              </div>
              <div className="absolute top-0 right-0 w-[180px] h-full pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
          </section>
        )}

        {/* Sticky control bar */}
        <section className="sticky top-[112px] z-10 bg-white flex flex-col gap-[20px] pt-[20px] pb-[12px]">
          <div>
            <h2 className="text-[24px] font-semibold text-black">เทมเพลตทั้งหมด</h2>
            <p className="text-[16px] font-normal text-black mt-[2px]">
              ค้นหา กรอง และดำเนินการกับเทมเพลต
            </p>
          </div>

          <div className="flex items-center gap-[20px] flex-wrap">
            <div className="flex items-center gap-[4px] shrink-0">
              <div className="relative w-[420px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveLetter(null);
                  }}
                  placeholder="ค้นหาเทมเพลต…"
                  className="w-full h-[31px] pl-3 pr-8 border-[0.5px] border-[#b3b3b3] rounded text-[14px] font-medium text-black placeholder:text-[#b3b3b3] focus:outline-none focus:border-blue-900 transition-colors"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b3b3b3]" />
              </div>

              <button
                onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="w-[31px] h-[31px] flex items-center justify-center border-[0.5px] border-[#b3b3b3] rounded hover:bg-stone-50 transition-colors"
                title={sortDirection === 'asc' ? 'เรียง A→Z' : 'เรียง Z→A'}
              >
                {sortDirection === 'asc' ? (
                  <ArrowDownAZ className="w-[18px] h-[18px] text-[#4d4d4d]" />
                ) : (
                  <ArrowUpZA className="w-[18px] h-[18px] text-[#4d4d4d]" />
                )}
              </button>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-[31px] px-2 border-[0.5px] border-[#b3b3b3] rounded text-[14px] font-medium text-black bg-white focus:outline-none focus:border-blue-900 transition-colors"
              >
                <option value="">ทุกสถานะ</option>
                <option value="DRAFT">ฉบับร่าง</option>
                <option value="PUBLISHED">เผยแพร่แล้ว</option>
                <option value="ARCHIVED">เก็บถาวร</option>
              </select>
            </div>

            <div className="flex items-center gap-[2px] min-w-0">
              <button
                onClick={() => scrollAlphabetNav('left')}
                className="w-[31px] h-[31px] flex-shrink-0 flex items-center justify-center border-[0.5px] border-[#b3b3b3] rounded hover:bg-stone-50 transition-colors"
              >
                <ChevronLeft className="w-[18px] h-[18px] text-[#4d4d4d]" />
              </button>

              <div
                ref={alphabetNavRef}
                className="flex items-center gap-[2px] overflow-hidden min-w-0 scrollbar-hide"
              >
                {ALPHABET.filter((l) => availableLetters.has(l)).map((letter) => {
                  const isActive = activeLetter === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      className={`w-[31px] h-[31px] flex-shrink-0 flex items-center justify-center rounded text-[14px] font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'border-[0.5px] border-[#b3b3b3] text-black hover:bg-stone-50'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollAlphabetNav('right')}
                className="w-[31px] h-[31px] flex-shrink-0 flex items-center justify-center border-[0.5px] border-[#b3b3b3] rounded hover:bg-stone-50 transition-colors"
              >
                <ChevronRight className="w-[18px] h-[18px] text-[#4d4d4d]" />
              </button>
            </div>
          </div>

          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-[#e6e6e6] rounded-md">
              <span className="text-[12px] text-neutral-700">
                เลือกแล้ว {selectedCount} รายการ
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                {canUpdateTemplate ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating || !!bulkAiProgress}
                      onClick={async () => {
                        if (!confirm(`ใช้ AI แนะนำชื่อฟิลด์สำหรับ ${selectedCount} เทมเพลตที่เลือก?`)) return;
                        const selected = selectedTemplates;
                        setBulkAiProgress({ running: true, current: 0, total: selected.length, currentName: '' });
                        let fieldsUpdated = 0;
                        for (let i = 0; i < selected.length; i++) {
                          const t = selected[i];
                          const name = t.displayName || t.name || '';
                          setBulkAiProgress({ running: true, current: i + 1, total: selected.length, currentName: name });
                          try {
                            const fieldsRes = await getFieldDefinitions(t.id);
                            const fields = fieldsRes.fieldDefinitions || [];
                            if (fields.length === 0) continue;
                            const suggestRes = await suggestAliases(t.id, fields.map((f) => f.placeholder), name);
                            const suggestions = suggestRes.suggestions || [];
                            if (suggestions.length === 0) continue;
                            const updated = fields.map((f) => {
                              const s = suggestions.find((x) => x.placeholder === f.placeholder);
                              if (s) { fieldsUpdated++; return { ...f, label: `${s.label_th} / ${s.label_en}` }; }
                              return f;
                            });
                            await updateFieldDefinitions(t.id, updated);
                          } catch (err) { console.error(`AI failed for ${t.id}`, err); }
                          await new Promise((r) => setTimeout(r, 300));
                        }
                        setBulkAiProgress(null);
                        setSelectedIds(new Set());
                        alert(`เสร็จสิ้น! อัปเดตฟิลด์ ${fieldsUpdated} รายการ`);
                        invalidate();
                      }}
                    >
                      <Wand2 className="w-3.5 h-3.5" /> AI แนะนำชื่อ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() =>
                        runBulk('publish', 'เผยแพร่เทมเพลตที่เลือกหรือไม่?', (id) =>
                          publishMutation.mutateAsync(id),
                        )
                      }
                    >
                      <Globe className="w-3.5 h-3.5" /> เผยแพร่
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() =>
                        runBulk('unpublish', 'ยกเลิกการเผยแพร่เทมเพลตที่เลือกหรือไม่?', (id) =>
                          unpublishMutation.mutateAsync(id),
                        )
                      }
                    >
                      <FileEdit className="w-3.5 h-3.5" /> ยกเลิกการเผยแพร่
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() =>
                        runBulk('archive', 'เก็บเทมเพลตที่เลือกเข้าคลังหรือไม่?', (id) =>
                          archiveMutation.mutateAsync(id),
                        )
                      }
                    >
                      <Archive className="w-3.5 h-3.5" /> เก็บเข้าคลัง
                    </Button>
                  </>
                ) : null}
                {canDeleteTemplate ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isMutating || !canBulkDelete}
                    title={
                      canBulkDelete
                        ? undefined
                        : 'มีเทมเพลตบางรายการไม่ใช่ของคุณ — เฉพาะเจ้าของหรือผู้ดูแลทั้งระบบเท่านั้นที่ลบได้'
                    }
                    onClick={() =>
                      runBulk(
                        'delete',
                        'ลบเทมเพลตที่เลือกหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
                        (id) => deleteMutation.mutateAsync(id),
                      )
                    }
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  ล้าง
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        {/* Body */}
        {templatesQuery.isLoading ? (
          <PageLoader />
        ) : templatesQuery.error ? (
          <ErrorMessage error={templatesQuery.error} />
        ) : allTemplates.length === 0 ? (
          <EmptyState />
        ) : search.trim() && filtered.length === 0 ? (
          <EmptySearchState search={search} onClear={() => setSearch('')} />
        ) : (
          <section>
            {/* Table header */}
            <div className="flex items-center gap-[20px] border-b border-[#e6e6e6] py-[10px] text-[14px] font-medium text-[#4d4d4d]">
              <div className="w-[24px] flex-shrink-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  disabled={allSelectableIds.length === 0}
                  className="h-3.5 w-3.5 rounded border-neutral-300 accent-blue-900"
                />
              </div>
              <div className="w-[56px] flex-shrink-0"></div>
              <div className="flex-1 min-w-0">ชื่อ</div>
              <div className="w-[120px] flex-shrink-0">หมวดหมู่</div>
              <div className="w-[100px] flex-shrink-0">การมองเห็น</div>
              <div className="w-[120px] flex-shrink-0">สถานะ</div>
              <div className="w-[120px] flex-shrink-0">อัปเดต</div>
              <div className="w-[100px] flex-shrink-0"></div>
            </div>

            {/* Groups */}
            {grouped.map(([letter, group]) => (
              <div key={letter}>
                <div
                  ref={(el) => {
                    letterRefs.current[letter] = el;
                  }}
                  className="sticky top-[240px] z-[5] bg-white scroll-mt-[240px] text-[20px] font-semibold text-[#4d4d4d] border-b border-[#e6e6e6] py-[8px] mt-4"
                >
                  {letter}
                </div>

                {group.map((t) => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    selected={selectedIds.has(t.id)}
                    canSelect={canEditTemplate(t)}
                    onToggleSelect={() => toggleSelected(t)}
                  />
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function RecentTemplateCard({ template }: { template: Template }) {
  const [imgError, setImgError] = useState(false);
  const thumb = getThumbnailUrl(template.id);
  const name = displayNameOf(template);
  return (
    <Link to={`/templates/${template.id}`} className="flex-shrink-0 block">
      <div className="relative w-[180px] h-[256px] border border-[#cdcdcd] rounded overflow-hidden bg-white hover:shadow-md transition-shadow">
        {thumb && !imgError ? (
          <img
            src={thumb}
            alt={name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
            <span className="text-3xl font-semibold text-neutral-300">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-neutral-700 truncate w-[180px]">{name}</p>
    </Link>
  );
}

function TemplateRow({
  template,
  selected,
  canSelect,
  onToggleSelect,
}: {
  template: Template;
  selected: boolean;
  canSelect: boolean;
  onToggleSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const thumb = getThumbnailUrl(template.id);
  const name = displayNameOf(template);

  return (
    <div className="flex items-center gap-[20px] py-[12px] border-b border-[#e6e6e6] hover:bg-stone-50/50 transition-colors">
      <div className="w-[24px] flex-shrink-0">
        <input
          type="checkbox"
          checked={selected}
          disabled={!canSelect}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          title={
            canSelect
              ? undefined
              : 'เฉพาะเจ้าของเทมเพลตหรือผู้ดูแลทั้งระบบเท่านั้นที่ดำเนินการได้'
          }
          className="h-3.5 w-3.5 rounded border-neutral-300 accent-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>

      <div className="w-[56px] h-[56px] flex-shrink-0 rounded border border-[#e6e6e6] bg-white overflow-hidden flex items-center justify-center">
        {thumb && !imgError ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <FileText className="w-5 h-5 text-neutral-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/templates/${template.id}`}
          className="font-medium text-black text-[14px] truncate block hover:text-blue-900 hover:underline transition-colors"
        >
          {name}
        </Link>
        {template.description ? (
          <p className="text-[13px] text-neutral-500 truncate">{template.description}</p>
        ) : template.type ? (
          <p className="text-[13px] text-neutral-500 truncate">{template.type}</p>
        ) : null}
      </div>

      <div className="w-[120px] flex-shrink-0 text-[13px] text-neutral-700 truncate">
        {template.category ? (
          <Badge tone="muted" caps>{template.category.replace(/_/g, ' ')}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </div>

      <div className="w-[100px] flex-shrink-0 text-[13px]">
        {template.visibility ? (
          <Badge tone={template.visibility === 'GLOBAL' ? 'accent' : 'muted'} caps>
            {template.visibility}
          </Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </div>

      <div className="w-[120px] flex-shrink-0 text-[13px]">
        <StatusBadge status={template.status ?? 'DRAFT'} />
      </div>

      <div className="w-[120px] flex-shrink-0 text-[13px] text-neutral-700">
        {template.updatedAt
          ? new Date(template.updatedAt).toLocaleDateString('th-TH')
          : '—'}
      </div>

      <div className="w-[100px] flex-shrink-0 flex items-center justify-end">
        <Link
          to={`/templates/${template.id}/fields`}
          className="inline-flex items-center gap-1 text-[13px] text-black underline hover:text-blue-900 transition-colors"
        >
          แก้ไขฟิลด์
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-neutral-400" />
      </div>
      <p className="text-neutral-900 font-medium">ยังไม่มีเทมเพลต</p>
      <p className="text-sm text-neutral-500 mt-1">
        อัปโหลดเทมเพลตแรกของคุณเพื่อเริ่มต้น
      </p>
    </div>
  );
}

function EmptySearchState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-neutral-400" />
      </div>
      <p className="text-neutral-900 font-medium">
        ไม่มีเทมเพลตที่ตรงกับ &ldquo;{search}&rdquo;
      </p>
      <button
        onClick={onClear}
        className="mt-3 inline-flex items-center gap-1 text-sm text-blue-900 hover:text-blue-900/80 font-medium"
      >
        <X className="w-4 h-4" />
        ล้างคำค้นหา
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'PUBLISHED'
      ? 'success'
      : status === 'ARCHIVED'
      ? 'muted'
      : 'warn';
  return (
    <Badge tone={tone as 'success' | 'muted' | 'warn'} caps>
      {status}
    </Badge>
  );
}
