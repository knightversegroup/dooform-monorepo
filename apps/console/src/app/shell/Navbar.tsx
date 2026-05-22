import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ChevronDown,
  LogOut,
  Search,
  Settings as SettingsIcon,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useCanFn } from '../../lib/auth/useCan';
import { DooformLogo } from './DooformLogo';
import {
  getVisibleSettingsSections,
  getVisibleTabs,
  type NavMenuSection,
  type NavTab,
} from './navTabs';

interface NavbarProps {
  unreadCount: number;
}

export function Navbar({ unreadCount }: NavbarProps) {
  const can = useCanFn();
  const tabs = getVisibleTabs(can);
  const settingsSections = getVisibleSettingsSections(can);

  return (
    <header className="sticky top-0 z-40">
      <div className="flex flex-col justify-center h-16 py-2.5 bg-stone-100">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto h-8 px-6">
          <Brand />
          <div className="flex items-center gap-3">
            <SearchBox />
            <AccountMenu />
          </div>
        </div>
      </div>

      <div className="flex h-12 bg-stone-100 border-b border-neutral-200">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto h-12 px-6">
          <div className="flex items-center gap-3 h-12">
            {tabs
              .filter((t) => t.position === 'left')
              .map((tab) => (
                <TabLink key={tab.to} tab={tab} unreadCount={unreadCount} />
              ))}
          </div>
          <div className="flex items-center gap-2.5 h-12">
            {settingsSections.length > 0 ? (
              <SettingsMenu sections={settingsSections} />
            ) : null}
            {tabs
              .filter((t) => t.position === 'right')
              .map((tab) => (
                <TabLink key={tab.to} tab={tab} unreadCount={unreadCount} />
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function SettingsMenu({ sections }: { sections: NavMenuSection[] }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  const active = pathname.startsWith('/settings');

  return (
    <div className="relative h-12" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-2 px-2 py-1 h-12 text-sm font-medium transition-colors border-b-2 ${
          active
            ? 'text-blue-900 border-blue-900'
            : 'text-neutral-600 border-transparent hover:text-blue-900'
        }`}
      >
        <SettingsIcon className="w-5 h-5" strokeWidth={1.67} />
        <span>การตั้งค่า</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
          {sections.map((section, idx) => (
            <div
              key={section.label}
              className={idx > 0 ? 'border-t border-neutral-100 pt-1 mt-1' : ''}
            >
              <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const itemActive =
                  pathname === item.to || pathname.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      itemActive
                        ? 'text-blue-900 bg-blue-50'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Brand() {
  return (
    <Link to="/templates" className="flex items-center gap-2 p-1">
      <DooformLogo width={106} height={20} className="shrink-0" />
      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-200/70">
        คอนโซล
      </span>
    </Link>
  );
}

function SearchBox() {
  return (
    <div className="relative flex items-center w-64 h-8 px-3 py-1 bg-white border border-neutral-300 rounded">
      <input
        type="text"
        placeholder="ค้นหา…"
        className="flex-1 text-sm font-medium text-neutral-700 placeholder-neutral-400 bg-transparent outline-none"
      />
      <Search className="w-4 h-4 text-neutral-400" />
    </div>
  );
}

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    queryClient.clear();
    navigate('/auth/login', { replace: true });
  };

  if (!user) return null;

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1 h-8 bg-blue-900 border border-blue-900 rounded text-white text-sm font-medium"
      >
        <span>บัญชี</span>
      </button>

      {open ? (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center justify-center">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wide">
              <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                {user.role.replace('_', ' ')}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                {user.userTier}
              </span>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            >
              <UserIcon className="w-4 h-4 opacity-60" />
              <span>ตั้งค่าโปรไฟล์</span>
            </Link>
            <Link
              to="/settings/organization"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            >
              <Building2 className="w-4 h-4 opacity-60" />
              <span>องค์กร</span>
            </Link>
          </div>
          <div className="border-t border-neutral-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabLink({ tab, unreadCount }: { tab: NavTab; unreadCount: number }) {
  const { pathname } = useLocation();
  const active =
    tab.to === '/'
      ? pathname === '/'
      : pathname === tab.to || pathname.startsWith(tab.to + '/');
  const Icon = tab.icon;

  return (
    <Link
      to={tab.to}
      className={`relative flex items-center gap-2.5 px-2 py-1 h-12 text-sm font-medium transition-colors border-b-2 ${
        active
          ? 'text-blue-900 border-blue-900'
          : 'text-neutral-600 border-transparent hover:text-blue-900'
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={1.67} />
      <span>{tab.label}</span>
      {tab.showBadge && unreadCount > 0 ? (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-medium bg-blue-900 text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
