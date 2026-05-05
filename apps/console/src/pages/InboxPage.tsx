import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck } from 'lucide-react';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/api/notifications';
import { listUsers } from '../lib/api/users';
import { getHistory } from '../lib/api/documents';
import { stripDocxExtension } from '../lib/filename';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { LifecycleBadge } from './DocumentsPage';

export default function InboxPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list({ scope: 'inbox' }),
    queryFn: () => listNotifications({ pageSize: 50 }),
  });
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  });
  const awaitingQuery = useQuery({
    queryKey: queryKeys.documents.history({
      scope: 'shared',
      lifecycleStatus: ['IN_REVIEW', 'APPROVED'],
    }),
    queryFn: () =>
      getHistory({
        scope: 'shared',
        lifecycleStatus: ['IN_REVIEW', 'APPROVED'],
        pageSize: 20,
      }),
  });

  const userMap = new Map(
    (usersQuery.data?.data ?? []).map((u) => [u.id, u.displayName])
  );

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Notifications and documents waiting for your input."
        actions={
          (notificationsQuery.data?.unreadCount ?? 0) > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Spinner />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Notifications
          </h2>
          {notificationsQuery.isLoading ? <PageLoader /> : null}
          {notificationsQuery.error ? (
            <ErrorMessage error={notificationsQuery.error} />
          ) : null}
          {notificationsQuery.data?.data?.length ? (
            <ul className="space-y-2">
              {notificationsQuery.data.data.map((n) => {
                const actor = n.actorUserId
                  ? userMap.get(n.actorUserId) ?? n.actorUserId
                  : 'System';
                const message = describeNotification(n.type);
                return (
                  <li
                    key={n.id}
                    className={`rounded-md border p-3 flex items-start justify-between gap-3 ${
                      n.readAt
                        ? 'border-border-subtle bg-white'
                        : 'border-primary/40 bg-primary/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{actor}</span>{' '}
                        <span className="text-ink-muted">{message}</span>
                      </div>
                      {n.documentId ? (
                        <Link
                          to={`/documents/${n.documentId}`}
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            if (!n.readAt) markReadMutation.mutate(n.id);
                          }}
                        >
                          Open document
                        </Link>
                      ) : null}
                      <div className="text-[11px] text-ink-muted mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.readAt ? (
                      <button
                        onClick={() => markReadMutation.mutate(n.id)}
                        className="text-xs text-primary hover:underline whitespace-nowrap"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : !notificationsQuery.isLoading ? (
            <p className="text-sm text-ink-muted">You're all caught up.</p>
          ) : null}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Awaiting your action
          </h2>
          {awaitingQuery.isLoading ? <PageLoader /> : null}
          {awaitingQuery.error ? <ErrorMessage error={awaitingQuery.error} /> : null}
          {awaitingQuery.data?.data?.length ? (
            <ul className="space-y-2">
              {awaitingQuery.data.data.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-md border border-border-subtle bg-white p-3"
                >
                  <Link
                    to={`/documents/${doc.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {stripDocxExtension(doc.filename ?? '') || doc.templateId}
                  </Link>
                  <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-2">
                    <LifecycleBadge status={doc.lifecycleStatus ?? 'DRAFT'} />
                    <span>
                      Owner: {userMap.get(doc.ownerUserId ?? '') ?? doc.ownerUserId ?? '—'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : !awaitingQuery.isLoading ? (
            <p className="text-sm text-ink-muted">
              Nothing waiting on you right now.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function describeNotification(type: string): string {
  switch (type) {
    case 'SHARED_WITH_YOU':
      return 'shared a document with you';
    case 'NEW_COMMENT':
      return 'left a new comment';
    case 'STATE_CHANGED':
      return 'changed a document’s lifecycle';
    case 'SIGNATURE_REQUESTED':
      return 'requested your signature';
    case 'SIGNED':
      return 'signed a document';
    default:
      return type;
  }
}
