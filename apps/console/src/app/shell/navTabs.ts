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
  { to: '/templates',  label: 'Templates',  icon: FileText,     position: 'left',  requiresAny: ['templates:read'] },
  { to: '/documents',  label: 'Documents',  icon: History,      position: 'left',  requiresAny: ['documents:read'] },
  { to: '/inbox',      label: 'Inbox',      icon: Bell,         position: 'left',  requiresAny: ['notifications:read'], showBadge: true },
  { to: '/watermarks', label: 'Watermarks', icon: Stamp,        position: 'left',  requiresAny: ['watermarks:read'] },
  { to: '/dictionary', label: 'Dictionary', icon: Book,         position: 'left',  requiresAny: ['dictionary:read'] },
  { to: '/docs',       label: 'Docs',       icon: BookOpenText, position: 'right' },
];

// Right-side "Settings" dropdown — grouped like the old Sidebar's Account / Admin
// sections. We do NOT filter by permission here: route-level RequirePermission
// guards already gate access on click, and hiding items from the menu makes
// admin pages effectively undiscoverable when a user is a hair short on perms.
export const settingsSections: NavMenuSection[] = [
  {
    label: 'Account',
    items: [
      { to: '/settings/profile',      label: 'Profile',      icon: UserCircle },
      { to: '/settings/organization', label: 'Organization', icon: Building2 },
      { to: '/settings/audit-log',    label: 'Audit log',    icon: ScrollText },
      { to: '/settings/compliance',   label: 'Compliance',   icon: Scale },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings/iam',           label: 'IAM',                icon: UserCog },
      { to: '/settings/roles',         label: 'Roles',              icon: ShieldCheck },
      { to: '/settings/permissions',   label: 'Role baselines',     icon: ShieldCheck },
      { to: '/settings/tenants',       label: 'Tenants',            icon: HardDrive },
      { to: '/settings/taxonomy',      label: 'Template taxonomy',  icon: Layers },
      { to: '/settings/tiers',         label: 'Subscription tiers', icon: CreditCard },
      { to: '/settings/field-types',   label: 'Field types',        icon: Settings },
      { to: '/settings/announcements', label: 'Announcements',      icon: Megaphone },
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
