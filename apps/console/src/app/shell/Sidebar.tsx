import { NavLink } from 'react-router-dom';
import { UserMenu } from '../../components/auth/UserMenu';
import { useCanFn } from '../../lib/auth/useCan';
import { getVisibleSections, type NavItem, type NavSection } from './nav';

interface SidebarProps {
  unreadCount: number;
}

export function Sidebar({ unreadCount }: SidebarProps) {
  const can = useCanFn();
  const sections = getVisibleSections(can);

  return (
    <aside className="w-full md:w-[232px] md:h-screen md:sticky md:top-0 md:flex md:flex-col shrink-0 bg-bg-subtle border-b md:border-b-0 md:border-r border-border-subtle">
      <SidebarBrand />
      <SidebarNav sections={sections} unreadCount={unreadCount} />
      <SidebarFooter />
    </aside>
  );
}

function SidebarBrand() {
  return (
    <div className="px-3 py-3 border-b border-border-subtle flex items-center gap-2 min-w-0 shrink-0">
      <div className="w-6 h-6 rounded-md bg-primary text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
        D
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink truncate">Dooform</div>
        <div className="text-[10px] text-ink-faint truncate">Console</div>
      </div>
    </div>
  );
}

function SidebarNav({
  sections,
  unreadCount,
}: {
  sections: NavSection[];
  unreadCount: number;
}) {
  // The nav scrolls internally so a tall list never pushes the user menu off screen.
  return (
    <nav className="flex-1 min-h-0 p-2 overflow-y-auto">
      {sections.map((section) => (
        <SidebarSection
          key={section.label}
          section={section}
          unreadCount={unreadCount}
        />
      ))}
    </nav>
  );
}

function SidebarSection({
  section,
  unreadCount,
}: {
  section: NavSection;
  unreadCount: number;
}) {
  return (
    <div className="mb-3">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium text-ink-faint">
        {section.label}
      </div>
      <div className="flex flex-col">
        {section.items.map((item) => (
          <SidebarLink key={item.to} item={item} unreadCount={unreadCount} />
        ))}
      </div>
    </div>
  );
}

const linkBaseCls =
  'group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[13px] transition-colors';
const linkActiveCls =
  'bg-white text-ink font-medium border border-border-subtle';
const linkIdleCls = 'text-ink-subtle hover:bg-white hover:text-ink';

function SidebarLink({
  item,
  unreadCount,
}: {
  item: NavItem;
  unreadCount: number;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [linkBaseCls, isActive ? linkActiveCls : linkIdleCls].join(' ')
      }
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate flex-1">{item.label}</span>
      {item.showBadge ? <UnreadBadge count={unreadCount} /> : null}
    </NavLink>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-medium bg-primary text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-border-subtle p-2 shrink-0">
      <UserMenu />
    </div>
  );
}
