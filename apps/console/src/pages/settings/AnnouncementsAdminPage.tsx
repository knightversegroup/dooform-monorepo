import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, X } from 'lucide-react';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAllAnnouncements,
  updateAnnouncement,
  type Announcement,
  type CreateAnnouncementInput,
} from '../../lib/api/announcements';
import { ApiError } from '../../lib/api/client';
import { queryKeys } from '../../lib/queryClient';

const inputCls =
  'w-full px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary';
const labelCls = 'block text-[11px] uppercase tracking-wide font-medium text-ink-muted mb-1';

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('th-TH') : '—';

export default function AnnouncementsAdminPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const query = useQuery({
    queryKey: queryKeys.announcements.adminList(),
    queryFn: listAllAnnouncements,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.announcements.all }),
    onError: (err) =>
      alert(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ'),
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold text-ink tracking-tightish">
            ประกาศ
          </h1>
          <p className="text-[12px] text-ink-muted">
            แบนเนอร์ที่แสดงด้านบนของคอนโซลสำหรับผู้ใช้ที่ลงชื่อเข้าใช้ทุกคน
            ใช้เพื่อสื่อสารช่วงเวลาบำรุงรักษา ฟีเจอร์ใหม่ หรือคำแนะนำเร่งด่วน
            ประกาศที่ใช้งานอยู่ (อยู่ในช่วงเริ่ม/สิ้นสุด และเปิดสวิตช์) จะปรากฏที่ด้านบนของแอป
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover shrink-0"
        >
          <Plus className="w-4 h-4" /> {showNew ? 'ปิด' : 'ประกาศใหม่'}
        </button>
      </header>

      {showNew ? (
        <AnnouncementForm
          onClose={() => setShowNew(false)}
          onSaved={() =>
            qc.invalidateQueries({ queryKey: queryKeys.announcements.all })
          }
        />
      ) : null}

      {editing ? (
        <AnnouncementForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() =>
            qc.invalidateQueries({ queryKey: queryKeys.announcements.all })
          }
        />
      ) : null}

      <section className="bg-white border border-border-subtle rounded-lg overflow-hidden">
        {query.isLoading ? (
          <div className="px-5 py-4 text-[12px] text-ink-muted">กำลังโหลด…</div>
        ) : query.error ? (
          <div className="px-5 py-4 text-[12px] text-red-600">
            {query.error instanceof Error
              ? query.error.message
              : 'โหลดประกาศไม่สำเร็จ'}
          </div>
        ) : (query.data ?? []).length === 0 ? (
          <div className="px-5 py-8 text-center text-[12px] text-ink-muted">
            ยังไม่มีประกาศ คลิก <strong>ประกาศใหม่</strong> เพื่อเพิ่ม
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="py-2 px-4">ข้อความ</th>
                <th className="py-2 px-4 w-28">สถานะ</th>
                <th className="py-2 px-4 w-44">ช่วงเวลา</th>
                <th className="py-2 px-4 w-40">อัปเดต</th>
                <th className="py-2 px-4 w-32 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {query.data!.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-bg-subtle/60 cursor-pointer"
                  onClick={() => setEditing(row)}
                >
                  <td className="py-2 px-4 align-top">
                    <div className="font-medium text-ink line-clamp-2">
                      {row.message}
                    </div>
                    {row.linkUrl ? (
                      <div className="text-[11px] text-ink-faint truncate">
                        {row.linkText ? `${row.linkText} → ` : ''}
                        {row.linkUrl}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2 px-4 align-top">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide font-medium ${
                        row.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-bg-subtle text-ink-muted border-border-subtle'
                      }`}
                    >
                      {row.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="py-2 px-4 align-top text-[12px] text-ink-muted whitespace-nowrap">
                    {row.startsAt || row.endsAt ? (
                      <>
                        <div>{fmt(row.startsAt)}</div>
                        <div className="text-ink-faint">→ {fmt(row.endsAt)}</div>
                      </>
                    ) : (
                      <span className="text-ink-faint">ตลอดเวลา</span>
                    )}
                  </td>
                  <td className="py-2 px-4 align-top text-[12px] text-ink-muted whitespace-nowrap">
                    {fmt(row.updatedAt)}
                  </td>
                  <td className="py-2 px-4 align-top text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(row);
                        }}
                        className="px-2 py-1 text-[12px] rounded text-ink-subtle hover:bg-bg-subtle hover:text-ink"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              'ลบประกาศนี้หรือไม่? ผู้ใช้จะไม่เห็นทันที',
                            )
                          ) {
                            deleteMutation.mutate(row.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function AnnouncementForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Announcement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [message, setMessage] = useState(initial?.message ?? '');
  const [linkText, setLinkText] = useState(initial?.linkText ?? '');
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.endsAt));

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateAnnouncementInput = {
        message: message.trim(),
        linkText: linkText.trim() || null,
        linkUrl: linkUrl.trim() || null,
        isActive,
        startsAt: fromLocalInput(startsAt),
        endsAt: fromLocalInput(endsAt),
      };
      return initial
        ? updateAnnouncement(initial.id, payload)
        : createAnnouncement(payload);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    mutation.mutate();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border-subtle rounded-lg p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-ink">
          {initial ? 'แก้ไขประกาศ' : 'ประกาศใหม่'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-ink-faint hover:bg-bg-subtle hover:text-ink"
          aria-label="ปิด"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className={labelCls} htmlFor="ann-message">
          ข้อความ
        </label>
        <textarea
          id="ann-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={2}
          className={`${inputCls} resize-y`}
          placeholder="ช่วงบำรุงรักษา วันศุกร์ 22:00–24:00 น. …"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
        <div>
          <label className={labelCls} htmlFor="ann-link-text">
            ข้อความลิงก์ (ไม่บังคับ)
          </label>
          <input
            id="ann-link-text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className={inputCls}
            placeholder="อ่านต่อ"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ann-link-url">
            URL ลิงก์ (ไม่บังคับ)
          </label>
          <input
            id="ann-link-url"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ann-starts">
            เริ่มเมื่อ (ไม่บังคับ)
          </label>
          <input
            id="ann-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ann-ends">
            สิ้นสุดเมื่อ (ไม่บังคับ)
          </label>
          <input
            id="ann-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-[13px] text-ink">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        เปิดใช้งาน (ยกเลิกการเลือกเพื่อซ่อนโดยไม่ต้องลบ)
      </label>

      {mutation.error ? (
        <div className="text-[12px] text-red-600">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'บันทึกไม่สำเร็จ'}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm rounded text-ink-subtle hover:bg-bg-subtle hover:text-ink"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || !message.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {mutation.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
        </button>
      </div>
    </form>
  );
}

// `<input type="datetime-local">` consumes/produces `YYYY-MM-DDTHH:mm` in local
// time. The API speaks ISO UTC strings. Convert at the edges.
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
