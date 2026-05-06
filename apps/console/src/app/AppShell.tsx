import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bell,
  Book,
  Building2,
  CreditCard,
  FileText,
  HardDrive,
  History,
  Layers,
  Megaphone,
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
import {
  listActiveAnnouncements,
  type Announcement,
} from '../lib/api/announcements';
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
      { to: '/settings/announcements', label: 'Announcements', icon: Megaphone, requiresAny: ['announcements:manage'] },
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
        <AnnouncementBar />
        <Outlet />
      </main>

      <RightPanel />
    </div>
    </RightPanelProvider>
  );
}

// How long each announcement stays before rolling to the next.
const ANNOUNCEMENT_INTERVAL_MS = 6000;
// Must match the Tailwind `duration-500` on the sliding layers below.
const ANNOUNCEMENT_TRANSITION_MS = 500;

function AnnouncementBar() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.announcements.active(),
    queryFn: listActiveAnnouncements,
    enabled: Boolean(user),
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
  });

  const announcements = query.data ?? [];
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Reset to first when the active set changes (e.g. an admin published a new one).
  useEffect(() => {
    setIndex(0);
    setAnimating(false);
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = window.setInterval(() => {
      setAnimating(true);
      // After the slide finishes, advance the index and snap layers back to
      // their resting positions in the same render (transition class is removed
      // when `animating` flips to false, so the snap is instant).
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % announcements.length);
        setAnimating(false);
      }, ANNOUNCEMENT_TRANSITION_MS);
    }, ANNOUNCEMENT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[index];
  const next = announcements[(index + 1) % announcements.length];
  const hasMultiple = announcements.length > 1;

  // Each frame phase:
  //   rest:        current at y=0,  next at y=100% (off-screen below), no transition
  //   animating:   current to y=-100%, next to y=0,                    transition on
  // Both layers share the same classes; only their translate values differ.
  const transitionCls = animating
    ? 'transition-transform duration-500 ease-in-out'
    : '';

  return (
    <div className="relative h-9 shrink-0 overflow-hidden bg-[#0f2d3d] text-[12px] text-white">
      <div
        className={`absolute inset-0 ${transitionCls} ${
          animating ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <AnnouncementContent announcement={current} />
      </div>
      {hasMultiple ? (
        <div
          className={`absolute inset-0 ${transitionCls} ${
            animating ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <AnnouncementContent announcement={next} />
        </div>
      ) : null}
    </div>
  );
}

function AnnouncementContent({ announcement }: { announcement: Announcement }) {
  const message = announcement.message?.trim() ?? '';
  const linkText = announcement.linkText?.trim() ?? '';
  const href = announcement.linkUrl?.trim() || null;

  const inner = (
    <span className="flex min-w-0 items-center gap-2 text-white/90 hover:text-white">
      <span className="truncate">{message}</span>
      {linkText ? (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 font-medium text-white">
          {linkText}
          {href ? <ArrowRight className="w-3 h-3" /> : null}
        </span>
      ) : href ? (
        <ArrowRight className="w-3 h-3 shrink-0" />
      ) : null}
    </span>
  );

  return (
    <div className="flex h-full items-center gap-4 px-4 sm:px-6">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1"
        >
          {inner}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1">{inner}</div>
      )}
    </div>
  );
}
