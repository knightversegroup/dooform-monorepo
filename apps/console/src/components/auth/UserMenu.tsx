import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ChevronUp, LogOut, User as UserIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth/AuthContext';

/**
 * Pinned-to-bottom-of-sidebar user widget. Click to open a popover above with
 * profile, organization, and logout. Linear-style: compact, hairline border, no
 * heavy fills.
 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate('/auth/login', { replace: true });
  };

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white text-left transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-6 h-6 rounded-md object-cover shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-bg-muted text-ink-subtle text-[11px] font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-ink truncate">{user.name}</div>
          <div className="text-[10px] text-ink-faint truncate">{user.email}</div>
        </div>
        <ChevronUp
          className={`w-3.5 h-3.5 text-ink-faint shrink-0 transition-transform ${
            open ? 'rotate-0' : 'rotate-180'
          }`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-border-subtle rounded-md shadow-pop overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border-subtle">
            <div className="text-[13px] font-medium text-ink truncate">{user.name}</div>
            <div className="text-[11px] text-ink-muted truncate">{user.email}</div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wide">
              <span className="px-1 py-0.5 rounded bg-bg-subtle text-ink-muted border border-border-subtle">
                {user.role.replace('_', ' ')}
              </span>
              <span className="px-1 py-0.5 rounded bg-bg-subtle text-ink-muted border border-border-subtle">
                {user.userTier}
              </span>
            </div>
          </div>
          <Link
            to="/settings/profile"
            onClick={() => setOpen(false)}
            className="w-full text-left px-3 py-2 text-[12px] hover:bg-bg-subtle flex items-center gap-2 text-ink-subtle hover:text-ink"
          >
            <UserIcon className="w-3.5 h-3.5" /> ตั้งค่าโปรไฟล์
          </Link>
          <Link
            to="/settings/organization"
            onClick={() => setOpen(false)}
            className="w-full text-left px-3 py-2 text-[12px] hover:bg-bg-subtle flex items-center gap-2 text-ink-subtle hover:text-ink"
          >
            <Building2 className="w-3.5 h-3.5" /> องค์กร
          </Link>
          <div className="border-t border-border-subtle" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-[12px] hover:bg-red-50 flex items-center gap-2 text-red-600"
          >
            <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
          </button>
        </div>
      ) : null}
    </div>
  );
}
