import {
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

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  // When true, the link renders the unread-notifications badge.
  showBadge?: boolean;
  // When set, the user must hold at least one of these permission keys.
  requiresAny?: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Sidebar layout grouped into sections like Linear's "Workspace / Account / Admin".
export const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/templates',  label: 'Templates',  icon: FileText, requiresAny: ['templates:read'] },
      { to: '/documents',  label: 'Documents',  icon: History,  requiresAny: ['documents:read'] },
      { to: '/inbox',      label: 'Inbox',      icon: Bell,     requiresAny: ['notifications:read'], showBadge: true },
      { to: '/watermarks', label: 'Watermarks', icon: Stamp,    requiresAny: ['watermarks:read'] },
      { to: '/dictionary', label: 'Dictionary', icon: Book,     requiresAny: ['dictionary:read'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile',      label: 'Profile',      icon: UserCircle },
      { to: '/settings/organization', label: 'Organization', icon: Building2,  requiresAny: ['organization:read'] },
      { to: '/settings/audit-log',    label: 'Audit log',    icon: ScrollText, requiresAny: ['organization:audit:read'] },
      { to: '/settings/compliance',   label: 'Compliance',   icon: Scale,      requiresAny: ['organization:audit:read'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings/permissions',   label: 'Permissions',        icon: ShieldCheck, requiresAny: ['platform:permissions:manage'] },
      { to: '/settings/tenants',       label: 'Tenants',            icon: HardDrive,   requiresAny: ['platform:tenants:manage'] },
      { to: '/settings/taxonomy',      label: 'Template taxonomy',  icon: Layers,      requiresAny: ['platform:taxonomy:manage'] },
      { to: '/settings/tiers',         label: 'Subscription tiers', icon: CreditCard,  requiresAny: ['platform:tiers:manage'] },
      { to: '/settings/field-types',   label: 'Field types',        icon: Settings,    requiresAny: ['settings:field-types:read'] },
      { to: '/settings/announcements', label: 'Announcements',      icon: Megaphone,   requiresAny: ['announcements:manage'] },
    ],
  },
];

type Can = (key: string) => boolean;

function isItemVisible(item: NavItem, can: Can): boolean {
  return !item.requiresAny || item.requiresAny.some(can);
}

/** Strip nav items the user can't see, then drop sections that end up empty. */
export function getVisibleSections(can: Can): NavSection[] {
  return navSections
    .map((s) => ({ ...s, items: s.items.filter((it) => isItemVisible(it, can)) }))
    .filter((s) => s.items.length > 0);
}
