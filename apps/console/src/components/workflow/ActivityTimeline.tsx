import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  CheckCircle2,
  FilePen,
  MessageSquare,
  PenLine,
  RefreshCw,
  Share2,
  Sparkles,
  UserMinus,
  Users,
} from 'lucide-react';
import { type ActivityType, listActivities } from '../../lib/api/activities';
import { listUsers } from '../../lib/api/users';
import { queryKeys } from '../../lib/queryClient';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Spinner } from '../ui/Spinner';

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CREATED: Sparkles,
  SHARED: Share2,
  UNSHARED: UserMinus,
  ROLE_CHANGED: Users,
  EDITED: FilePen,
  COMMENTED: MessageSquare,
  STATE_CHANGED: RefreshCw,
  SIGNED: PenLine,
  FINALIZED: CheckCircle2,
  ARCHIVED: Archive,
};

const VERBS: Record<ActivityType, string> = {
  CREATED: 'สร้างเอกสาร',
  SHARED: 'แชร์เอกสาร',
  UNSHARED: 'เพิกถอนการแชร์',
  ROLE_CHANGED: 'เปลี่ยนบทบาท',
  EDITED: 'แก้ไขเอกสาร',
  COMMENTED: 'เพิ่มความคิดเห็น',
  STATE_CHANGED: 'เปลี่ยนสถานะวงจร',
  SIGNED: 'ลงนามเอกสาร',
  FINALIZED: 'ยืนยันเอกสารฉบับสุดท้าย',
  ARCHIVED: 'เก็บเอกสารเข้าคลัง',
};

export function ActivityTimeline({ documentId }: { documentId: string }) {
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.forDocument(documentId),
    queryFn: () => listActivities(documentId),
  });
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  });
  const userMap = new Map(
    (usersQuery.data?.data ?? []).map((u) => [u.id, u.displayName])
  );

  if (activitiesQuery.isLoading) return <Spinner />;
  if (activitiesQuery.error)
    return <ErrorMessage error={activitiesQuery.error} />;

  const items = activitiesQuery.data?.data ?? [];
  if (items.length === 0)
    return <p className="text-sm text-ink-muted">ยังไม่มีกิจกรรม</p>;

  return (
    <ol className="space-y-3 relative">
      {items.map((a) => {
        const Icon = ICONS[a.type] ?? RefreshCw;
        return (
          <li
            key={a.id}
            className="flex items-start gap-3 rounded-md border border-border-default bg-white p-3"
          >
            <div className="rounded-full bg-primary/10 text-primary p-1.5 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium">
                  {userMap.get(a.userId) ?? a.userId}
                </span>{' '}
                <span className="text-ink-muted">{VERBS[a.type] ?? a.type}</span>
              </div>
              {Object.keys(a.payload ?? {}).length > 0 ? (
                <pre className="text-[11px] text-ink-muted whitespace-pre-wrap mt-1 font-mono">
                  {JSON.stringify(a.payload, null, 2)}
                </pre>
              ) : null}
              <div className="text-[11px] text-ink-muted mt-1">
                {a.createdAt ? new Date(a.createdAt).toLocaleString('th-TH') : ''}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
