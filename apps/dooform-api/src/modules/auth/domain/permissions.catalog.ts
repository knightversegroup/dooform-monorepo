// Single source of truth for what permissions exist in the system. Add a new permission
// here, decorate the controller method with @RequirePermission(key), and it shows up in
// the admin permissions UI automatically — no migration needed because the *catalog* is
// code, only the *grants* (which roles have which permissions) live in the DB.

import { UserRole } from '../../user/domain/enums/user.enum'

export interface PermissionDefinition {
  key: string
  group: string
  label: string
  description: string
}

export const PERMISSIONS: PermissionDefinition[] = [
  // Templates
  { key: 'templates:read', group: 'Templates', label: 'View templates', description: 'List and open templates.' },
  { key: 'templates:create', group: 'Templates', label: 'Create templates', description: 'Upload new templates.' },
  { key: 'templates:update', group: 'Templates', label: 'Edit templates', description: 'Change template metadata, fields, etc.' },
  { key: 'templates:delete', group: 'Templates', label: 'Delete templates', description: 'Permanently remove templates.' },

  // Documents
  { key: 'documents:read', group: 'Documents', label: 'View documents', description: 'List and open documents you have access to.' },
  { key: 'documents:create', group: 'Documents', label: 'Create documents', description: 'Process templates into documents.' },
  { key: 'documents:update', group: 'Documents', label: 'Edit documents', description: 'Annotate, rename, regenerate documents.' },
  { key: 'documents:delete', group: 'Documents', label: 'Delete documents', description: 'Permanently remove documents.' },
  { key: 'documents:share', group: 'Documents', label: 'Share documents', description: 'Manage shares and permissions.' },
  { key: 'documents:sign', group: 'Documents', label: 'Sign documents', description: 'Apply signatures to approved documents.' },

  // Watermarks
  { key: 'watermarks:read', group: 'Watermarks', label: 'View watermark presets', description: 'List watermark presets.' },
  { key: 'watermarks:manage', group: 'Watermarks', label: 'Manage watermarks', description: 'Create/edit/delete watermark presets and branding.' },

  // Organization
  { key: 'organization:read', group: 'Organization', label: 'View organization', description: 'See org details and member list.' },
  { key: 'organization:update', group: 'Organization', label: 'Edit organization', description: 'Rename the organization, change branding.' },
  { key: 'organization:members:manage', group: 'Organization', label: 'Manage members', description: 'Change roles and remove members.' },
  { key: 'organization:invites:manage', group: 'Organization', label: 'Manage invite codes', description: 'Create and revoke invite codes.' },
  { key: 'organization:tier:manage', group: 'Organization', label: 'Change subscription tier', description: 'Upgrade or downgrade the organization\'s subscription tier (free/pro/max).' },
  { key: 'organization:audit:read', group: 'Organization', label: 'View audit log', description: 'See compliance audit trail (who did what when). GLOBAL_ADMIN can view across all tenants.' },
  { key: 'organization:audit:manage', group: 'Organization', label: 'Manage compliance rules', description: 'Create, edit, and delete compliance/DLP alert rules.' },

  // Settings
  { key: 'settings:field-types:read', group: 'Settings', label: 'View field types', description: 'List the data-type catalog (needed when filling forms).' },
  { key: 'settings:field-types:manage', group: 'Settings', label: 'Manage field types', description: 'Create/edit/delete data types.' },

  // Document types (template grouping)
  { key: 'document-types:read', group: 'Templates', label: 'View document types', description: 'Browse template groupings/categories.' },
  { key: 'document-types:manage', group: 'Templates', label: 'Manage document types', description: 'Create/edit/delete template groupings and assign templates.' },

  // Notifications & activities
  { key: 'notifications:read', group: 'Workflow', label: 'View notifications', description: 'Read your inbox.' },
  { key: 'activities:read', group: 'Workflow', label: 'View activity log', description: 'See document activity history.' },

  // Workflow users directory
  { key: 'users:read', group: 'Organization', label: 'View user directory', description: 'List users in your organization (used by share dialogs).' },
  { key: 'users:create', group: 'Organization', label: 'Create users (legacy)', description: 'Legacy admin-only user creation. Most flows should use invite codes.' },

  // Dictionary (per-user glossary + org dictionary + global marketplace)
  { key: 'dictionary:read', group: 'Dictionary', label: 'View dictionary entries', description: 'Browse personal, organization, and published global dictionary entries.' },
  { key: 'dictionary:create', group: 'Dictionary', label: 'Create dictionary entries', description: 'Add personal entries; org/global creation is gated by role.' },
  { key: 'dictionary:update', group: 'Dictionary', label: 'Edit dictionary entries', description: 'Edit your own entries (org admins can edit org-scoped entries).' },
  { key: 'dictionary:delete', group: 'Dictionary', label: 'Delete dictionary entries', description: 'Delete your own entries (org admins can delete org-scoped entries).' },

  // Announcements (org/global broadcast banner shown in the console)
  { key: 'announcements:manage', group: 'Platform', label: 'Manage announcements', description: 'Create, edit, and delete the announcement banner shown in the console. GLOBAL_ADMIN only.' },

  // Platform (GLOBAL_ADMIN territory — typically not granted to other roles)
  { key: 'platform:permissions:manage', group: 'Platform', label: 'Manage permissions', description: 'Edit which roles have which permissions. GLOBAL_ADMIN only.' },
  { key: 'platform:tenants:manage', group: 'Platform', label: 'Manage tenants', description: 'View and set storage quotas for any organization. GLOBAL_ADMIN only.' },
  { key: 'platform:taxonomy:manage', group: 'Platform', label: 'Manage template taxonomy', description: 'Edit the template type/tier/category lists shown in upload + edit forms. GLOBAL_ADMIN only.' },
  { key: 'platform:tiers:manage', group: 'Platform', label: 'Manage subscription tiers', description: 'Configure per-tier feature flags (e.g. branding watermark). GLOBAL_ADMIN only.' },

  // Fine-grained permissions that replace hardcoded `caller.role === 'GLOBAL_ADMIN'`
  // checks scattered through use-cases, services, and policies. Default-granted only
  // to GLOBAL_ADMIN so current behavior is preserved, but they can now be flipped on
  // for a specific role (or a specific user via per-user overrides).
  { key: 'templates:publish-global', group: 'Templates', label: 'Publish global templates', description: 'Create or change a template to GLOBAL visibility (visible to every tenant).' },
  { key: 'templates:read-cross-org', group: 'Templates', label: 'View templates across orgs', description: 'See draft / archived templates in tenants other than your own.' },
  { key: 'templates:edit-any', group: 'Templates', label: 'Edit any template', description: 'Modify or delete templates you did not create. Owners can always edit their own.' },
  { key: 'compliance:rules:manage-global', group: 'Organization', label: 'Manage global compliance rules', description: 'Create, edit, and delete platform-wide (organizationId=NULL) compliance rules.' },
  { key: 'audit-logs:read-cross-org', group: 'Organization', label: 'View audit logs across orgs', description: 'Read audit logs from tenants other than your own. Required for platform-wide compliance investigations.' },
  { key: 'tenants:manage-any-org', group: 'Platform', label: 'Manage any tenant', description: 'Edit storage quotas, tier, and membership in any organization. GLOBAL_ADMIN only by default.' },
  { key: 'users:assign-role', group: 'Organization', label: 'Assign user roles', description: 'Change a member\'s role within scope (org admins are still bounded to their own tenant).' },
  { key: 'users:assign-global-admin', group: 'Platform', label: 'Grant GLOBAL_ADMIN role', description: 'Promote a user to GLOBAL_ADMIN. Hard floor — only users with this permission may grant it.' },
  { key: 'users:override-permissions', group: 'Platform', label: 'Override user permissions', description: 'Grant or revoke individual permissions on a specific user, on top of their role.' },

  // IAM: custom role management
  { key: 'roles:read', group: 'Platform', label: 'View roles', description: 'List system and custom roles and the permissions they grant.' },
  { key: 'roles:create', group: 'Platform', label: 'Create roles', description: 'Define new custom roles by bundling existing permissions.' },
  { key: 'roles:update', group: 'Platform', label: 'Edit roles', description: 'Change a role\'s name, description, or permission set. System roles can have their permissions edited but not their code.' },
  { key: 'roles:delete', group: 'Platform', label: 'Delete roles', description: 'Delete a custom role (system roles can\'t be deleted).' },
]

const PERMISSION_KEYS = new Set(PERMISSIONS.map((p) => p.key))

export function isValidPermissionKey(key: string): boolean {
  return PERMISSION_KEYS.has(key)
}

// Default grants applied on first boot (only seeded if there are zero rows for that role).
// GLOBAL_ADMIN bypasses checks entirely, but we still seed it for visibility in the UI.
export const DEFAULT_GRANTS: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    // Read-only across the board, plus the create/update/sign actions needed for a
    // member to actually fill out and finalize their own documents.
    'templates:read',
    'documents:read',
    'documents:create',
    'documents:update',
    'documents:sign',
    'watermarks:read',
    'organization:read',
    'settings:field-types:read',
    'document-types:read',
    'notifications:read',
    'activities:read',
    'users:read',
    'dictionary:read',
    'dictionary:create',
    'dictionary:update',
    'dictionary:delete',
  ],
  [UserRole.ORG_ADMIN]: [
    'templates:read',
    'templates:create',
    'templates:update',
    'templates:delete',
    'documents:read',
    'documents:create',
    'documents:update',
    'documents:delete',
    'documents:share',
    'documents:sign',
    'watermarks:read',
    'watermarks:manage',
    'organization:read',
    'organization:update',
    'organization:audit:read',
    'organization:audit:manage',
    'organization:members:manage',
    'organization:invites:manage',
    'organization:tier:manage',
    'settings:field-types:read',
    'settings:field-types:manage',
    'document-types:read',
    'document-types:manage',
    'notifications:read',
    'activities:read',
    'users:read',
    'users:create',
    'users:assign-role',
    'roles:read',
    'dictionary:read',
    'dictionary:create',
    'dictionary:update',
    'dictionary:delete',
  ],
  [UserRole.GLOBAL_ADMIN]: PERMISSIONS.map((p) => p.key),
}
