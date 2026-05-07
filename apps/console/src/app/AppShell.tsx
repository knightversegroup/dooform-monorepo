import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth/AuthContext';
import { useCanFn } from '../lib/auth/useCan';
import { listNotifications } from '../lib/api/notifications';
import { queryKeys } from '../lib/queryClient';
import { RightPanel } from '../components/right-panel/RightPanel';
import { RightPanelProvider } from '../components/right-panel/RightPanelContext';
import { Sidebar } from './shell/Sidebar';
import { AnnouncementBar } from './shell/AnnouncementBar';

export default function AppShell() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <RightPanelProvider>
      <div className="h-screen flex flex-col md:flex-row bg-bg text-ink overflow-hidden">
        <Sidebar unreadCount={unreadCount} />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-bg">
          <AnnouncementBar />
          <Outlet />
        </main>

        <RightPanel />
      </div>
    </RightPanelProvider>
  );
}

// Polled every 30s for the sidebar Inbox badge. Disabled until the user is
// loaded and they actually hold the `notifications:read` permission.
function useUnreadNotificationCount(): number {
  const { user } = useAuth();
  const can = useCanFn();
  const userId = user?.id ?? '';

  const query = useQuery({
    queryKey: queryKeys.notifications.list({ user: userId, scope: 'header' }),
    queryFn: () => listNotifications({ unread: true, pageSize: 1 }),
    refetchInterval: 30_000,
    enabled: Boolean(userId) && can('notifications:read'),
  });

  return query.data?.unreadCount ?? 0;
}
