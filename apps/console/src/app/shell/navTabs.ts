import {
  Bell,
  Book,
  BookOpenText,
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
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type TabPosition = 'left' | 'right';

export interface NavTab {
  to: string;
  label: string;
  icon: LucideIcon;
  position: TabPosition;
  showBadge?: boolean;
  requiresAny?: string[];
}

export interface NavMenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  requiresAny?: string[];
}

export interface NavMenuSection {
  label: string;
  items: NavMenuItem[];
}

export const navTabs: NavTab[] = [
  { to: '/templates',  label: 'เทมเพลต',     icon: FileText,     position: 'left',  requiresAny: ['templates:read'] },
  { to: '/documents',  label: 'เอกสาร',      icon: History,      position: 'left',  requiresAny: ['documents:read'] },
  { to: '/inbox',      label: 'กล่องข้อความ', icon: Bell,         position: 'left',  requiresAny: ['notifications:read'], showBadge: true },
  { to: '/watermarks', label: 'ลายน้ำ',      icon: Stamp,        position: 'left',  requiresAny: ['watermarks:read'] },
  { to: '/dictionary', label: 'พจนานุกรม',   icon: Book,         position: 'left',  requiresAny: ['dictionary:read'] },
  { to: '/docs',       label: 'คู่มือ',       icon: BookOpenText, position: 'right' },
];

// Right-side "Settings" dropdown — grouped like the old Sidebar's Account / Admin
// sections. We do NOT filter by permission here: route-level RequirePermission
// guards already gate access on click, and hiding items from the menu makes
// admin pages effectively undiscoverable when a user is a hair short on perms.
export const settingsSections: NavMenuSection[] = [
  {
    label: 'บัญชี',
    items: [
      { to: '/settings/profile',      label: 'โปรไฟล์',           icon: UserCircle },
      { to: '/settings/organization', label: 'องค์กร',             icon: Building2 },
      { to: '/settings/audit-log',    label: 'บันทึกการตรวจสอบ',  icon: ScrollText },
      { to: '/settings/compliance',   label: 'การกำกับดูแล',      icon: Scale },
    ],
  },
  {
    label: 'ผู้ดูแลระบบ',
    items: [
      { to: '/settings/iam',            label: 'IAM',                       icon: UserCog },
      { to: '/settings/roles',          label: 'บทบาท',                     icon: ShieldCheck },
      { to: '/settings/permissions',    label: 'สิทธิ์พื้นฐานของบทบาท',     icon: ShieldCheck },
      { to: '/settings/tenants',        label: 'ผู้เช่า',                    icon: HardDrive },
      { to: '/settings/platform-users', label: 'ผู้ใช้แพลตฟอร์ม',           icon: Users },
      { to: '/settings/taxonomy',       label: 'หมวดหมู่เทมเพลต',           icon: Layers },
      { to: '/settings/tiers',          label: 'ระดับการสมัครสมาชิก',       icon: CreditCard },
      { to: '/settings/field-types',    label: 'ประเภทฟิลด์',                icon: Settings },
      { to: '/settings/announcements',  label: 'ประกาศ',                     icon: Megaphone },
    ],
  },
];

type Can = (key: string) => boolean;

export function getVisibleTabs(can: Can): NavTab[] {
  return navTabs.filter((t) => !t.requiresAny || t.requiresAny.some(can));
}

export function getVisibleSettingsSections(can: Can): NavMenuSection[] {
  return settingsSections
    .map((s) => ({
      ...s,
      items: s.items.filter((it) => !it.requiresAny || it.requiresAny.some(can)),
    }))
    .filter((s) => s.items.length > 0);
}
