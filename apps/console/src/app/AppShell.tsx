import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth/AuthContext';
import { useCanFn } from '../lib/auth/useCan';
import { listNotifications } from '../lib/api/notifications';
import { queryKeys } from '../lib/queryClient';
import { RightPanel } from '../components/right-panel/RightPanel';
import { RightPanelProvider } from '../components/right-panel/RightPanelContext';
import { Navbar } from './shell/Navbar';
import { AnnouncementBar } from './shell/AnnouncementBar';

export default function AppShell() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <RightPanelProvider>
      <div className="min-h-screen bg-bg text-ink flex">
        <main className="flex-1 min-w-0 flex flex-col">
          <Navbar unreadCount={unreadCount} />
          <AnnouncementBar />
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        <RightPanel />
      </div>
    </RightPanelProvider>
  );
}

// Polled every 30s for the Navbar Inbox badge. Disabled until the user is
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
