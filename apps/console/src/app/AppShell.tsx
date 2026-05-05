import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Book,
  Building2,
  CreditCard,
  FileText,
  HardDrive,
  History,
  Layers,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Stamp,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { UserMenu } from '../components/auth/UserMenu';
import { listNotifications } from '../lib/api/notifications';
import { useAuth } from '../lib/auth/AuthContext';
import { useCanFn } from '../lib/auth/useCan';
import { queryKeys } from '../lib/queryClient';
import { RightPanel } from '../components/right-panel/RightPanel';
import { RightPanelProvider } from '../components/right-panel/RightPanelContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  showBadge?: boolean;
  requiresAny?: string[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Sidebar layout grouped into sections like Linear's "Workspace / Account / Admin".
const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/templates', label: 'Templates', icon: FileText, requiresAny: ['templates:read'] },
      { to: '/documents', label: 'Documents', icon: History, requiresAny: ['documents:read'] },
      { to: '/inbox', label: 'Inbox', icon: Bell, showBadge: true, requiresAny: ['notifications:read'] },
      { to: '/watermarks', label: 'Watermarks', icon: Stamp, requiresAny: ['watermarks:read'] },
      { to: '/dictionary', label: 'Dictionary', icon: Book, requiresAny: ['dictionary:read'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile', label: 'Profile', icon: UserCircle },
      { to: '/settings/organization', label: 'Organization', icon: Building2, requiresAny: ['organization:read'] },
      { to: '/settings/audit-log', label: 'Audit log', icon: ScrollText, requiresAny: ['organization:audit:read'] },
      { to: '/settings/compliance', label: 'Compliance', icon: Scale, requiresAny: ['organization:audit:read'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings/permissions', label: 'Permissions', icon: ShieldCheck, requiresAny: ['platform:permissions:manage'] },
      { to: '/settings/tenants', label: 'Tenants', icon: HardDrive, requiresAny: ['platform:tenants:manage'] },
      { to: '/settings/taxonomy', label: 'Template taxonomy', icon: Layers, requiresAny: ['platform:taxonomy:manage'] },
      { to: '/settings/tiers', label: 'Subscription tiers', icon: CreditCard, requiresAny: ['platform:tiers:manage'] },
      { to: '/settings/field-types', label: 'Field types', icon: Settings, requiresAny: ['settings:field-types:read'] },
    ],
  },
];

export default function AppShell() {
  const { user } = useAuth();
  const can = useCanFn();
  const activeUserId = user?.id ?? '';

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list({ user: activeUserId, scope: 'header' }),
    queryFn: () => listNotifications({ unread: true, pageSize: 1 }),
    refetchInterval: 30_000,
    enabled: Boolean(activeUserId) && can('notifications:read'),
  });
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <RightPanelProvider>
    <div className="h-screen flex flex-col md:flex-row bg-bg text-ink overflow-hidden">
      <aside className="w-full md:w-[232px] md:h-screen md:sticky md:top-0 md:flex md:flex-col shrink-0 bg-bg-subtle border-b md:border-b-0 md:border-r border-border-subtle">
        {/* Workspace header — top-of-sidebar identity */}
        <div className="px-3 py-3 border-b border-border-subtle flex items-center gap-2 min-w-0 shrink-0">
          <div className="w-6 h-6 rounded-md bg-primary text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
            D
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-ink truncate">Dooform</div>
            <div className="text-[10px] text-ink-faint truncate">Console</div>
          </div>
        </div>

        {/* Nav — internally scrollable so a tall list never pushes the user menu off screen */}
        <nav className="flex-1 min-h-0 p-2 overflow-y-auto">
          {navSections.map((section) => {
            const visible = section.items.filter(
              (item) => !item.requiresAny || item.requiresAny.some((k) => can(k)),
            );
            if (visible.length === 0) return null;
            return (
              <div key={section.label} className="mb-3">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium text-ink-faint">
                  {section.label}
                </div>
                <div className="flex flex-col">
                  {visible.map(({ to, label, icon: Icon, showBadge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        [
                          'group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[13px] transition-colors',
                          isActive
                            ? 'bg-white text-ink font-medium border border-border-subtle'
                            : 'text-ink-subtle hover:bg-white hover:text-ink',
                        ].join(' ')
                      }
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{label}</span>
                      {showBadge && unreadCount > 0 ? (
                        <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-medium bg-primary text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      ) : null}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User menu pinned to bottom */}
        <div className="border-t border-border-subtle p-2 shrink-0">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-bg">
        <Outlet />
      </main>

      <RightPanel />
    </div>
    </RightPanelProvider>
  );
}
