import { http } from '../api/client';
import type {
  AssignmentCondition,
  AuthUser,
  ChangePasswordPayload,
  CompleteOnboardingPayload,
  InviteCode,
  LoginPayload,
  Organization,
  OrganizationMember,
  PermissionDefinition,
  RegisterPayload,
  RoleGrants,
  UpdateProfilePayload,
  UserRole,
} from './types';

export const authApi = {
  me: () => http.get<AuthUser>('/auth/me'),
  login: (payload: LoginPayload) => http.post<AuthUser>('/auth/login', { body: payload }),
  register: (payload: RegisterPayload) => http.post<AuthUser>('/auth/register', { body: payload }),
  logout: () => http.post<void>('/auth/logout'),
  refresh: () => http.post<AuthUser>('/auth/refresh'),
  requestPasswordReset: (email: string) =>
    http.post<void>('/auth/request-password-reset', { body: { email } }),
  resetPassword: (token: string, password: string) =>
    http.post<void>('/auth/reset-password', { body: { token, password } }),
  completeOnboarding: (payload: CompleteOnboardingPayload) =>
    http.post<AuthUser>('/auth/complete-onboarding', { body: payload }),

  // Profile
  updateProfile: (payload: UpdateProfilePayload) =>
    http.patch<AuthUser>('/auth/me', { body: payload }),
  changePassword: (payload: ChangePasswordPayload) =>
    http.post<void>('/auth/me/change-password', { body: payload }),

  // Organization
  getOrganization: () => http.get<Organization>('/organization'),
  getOrganizationStorage: () =>
    http.get<{
      organizationId: string;
      name: string;
      slug: string;
      quotaBytes: number | null;
      usedBytes: number;
      percentUsed: number | null;
    }>('/organization/storage'),
  updateOrganization: (payload: { name?: string }) =>
    http.patch<Organization>('/organization', { body: payload }),
  updateOrganizationTier: (tier: 'free' | 'pro' | 'max') =>
    http.patch<Organization>('/organization/tier', { body: { tier } }),
  listMembers: () => http.get<OrganizationMember[]>('/organization/members'),
  updateMemberRole: (userId: string, role: UserRole) =>
    http.patch<OrganizationMember>(`/organization/members/${userId}/role`, { body: { role } }),
  removeMember: (userId: string) =>
    http.delete<void>(`/organization/members/${userId}`),

  // Invite codes (requires organization:invites:manage)
  listInviteCodes: () => http.get<InviteCode[]>('/auth/invite-codes'),
  createInviteCode: (input: { expiresInDays?: number }) =>
    http.post<InviteCode>('/auth/invite-codes', { body: input }),
  deleteInviteCode: (id: string) => http.delete<void>(`/auth/invite-codes/${id}`),

  // Platform admin: dynamic permissions (requires platform:permissions:manage)
  permissionsCatalog: () => http.get<PermissionDefinition[]>('/admin/permissions/catalog'),
  permissionsGrants: () => http.get<RoleGrants>('/admin/permissions/grants'),
  setRoleGrants: (role: UserRole, permissions: string[]) =>
    http.put<{ ok: boolean; role: UserRole; permissions: string[] }>(
      `/admin/permissions/grants/${role}`,
      { body: { permissions } },
    ),

  // Per-user permission assignment (requires users:override-permissions
  // for overrides, users:assign-role for role changes).
  getUserPermissions: (userId: string) =>
    http.get<{
      userId: string;
      email: string;
      displayName: string;
      role: UserRole;
      effectivePermissions: string[];
      overrides: Array<{
        permissionKey: string;
        effect: 'ALLOW' | 'DENY';
        grantedByUserId: string | null;
        createdAt: string;
      }>;
    }>(`/admin/permissions/users/${userId}`),
  replaceUserOverrides: (
    userId: string,
    overrides: Array<{ key: string; effect: 'ALLOW' | 'DENY' }>,
  ) =>
    http.put<{
      ok: boolean;
      overrides: Array<{
        permissionKey: string;
        effect: 'ALLOW' | 'DENY';
        grantedByUserId: string | null;
        createdAt: string;
      }>;
      effectivePermissions: string[];
    }>(`/admin/permissions/users/${userId}/overrides`, { body: { overrides } }),
  setUserRole: (userId: string, role: UserRole, reason?: string) =>
    http.patch<{ ok: boolean; role: UserRole; previousRole?: UserRole; changed: boolean }>(
      `/admin/permissions/users/${userId}/role`,
      { body: { role, reason } },
    ),

  // IAM-style multi-role assignments.
  listRoles: () =>
    http.get<
      Array<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        permissions: string[];
        assigneeCount: number;
      }>
    >('/admin/permissions/roles'),
  getRole: (id: string) =>
    http.get<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      isSystem: boolean;
      permissions: string[];
      assigneeCount: number;
    }>(`/admin/permissions/roles/${id}`),
  createRole: (input: {
    code: string;
    name: string;
    description?: string;
    permissions: string[];
  }) =>
    http.post<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      isSystem: boolean;
      permissions: string[];
      assigneeCount: number;
    }>('/admin/permissions/roles', { body: input }),
  updateRole: (
    id: string,
    input: { name?: string; description?: string | null; permissions?: string[] },
  ) =>
    http.patch<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      isSystem: boolean;
      permissions: string[];
      assigneeCount: number;
    }>(`/admin/permissions/roles/${id}`, { body: input }),
  deleteRole: (id: string) =>
    http.delete<{ ok: boolean }>(`/admin/permissions/roles/${id}`),

  listUserAssignments: (userId: string) =>
    http.get<
      Array<{
        id: string;
        userId: string;
        roleId: string;
        roleCode: string;
        roleName: string;
        grantedByUserId: string | null;
        grantedAt: string;
        expiresAt: string | null;
        condition: AssignmentCondition | null;
      }>
    >(`/admin/permissions/users/${userId}/assignments`),
  grantUserRole: (
    userId: string,
    input: { roleId: string; expiresAt?: string; condition?: AssignmentCondition },
  ) =>
    http.post<{
      id: string;
      userId: string;
      roleId: string;
      roleCode: string;
      roleName: string;
      grantedByUserId: string | null;
      grantedAt: string;
      expiresAt: string | null;
      condition: AssignmentCondition | null;
    }>(`/admin/permissions/users/${userId}/assignments`, { body: input }),
  revokeUserAssignment: (userId: string, assignmentId: string) =>
    http.delete<{ ok: boolean }>(
      `/admin/permissions/users/${userId}/assignments/${assignmentId}`,
    ),
  resetUserIam: (userId: string) =>
    http.post<{ role: UserRole; assignments: number; overrides: number }>(
      `/admin/permissions/users/${userId}/reset`,
    ),
  updateUserAssignment: (
    userId: string,
    assignmentId: string,
    input: { expiresAt?: string | null; condition?: AssignmentCondition | null },
  ) =>
    http.patch<{
      id: string;
      userId: string;
      roleId: string;
      roleCode: string;
      roleName: string;
      grantedByUserId: string | null;
      grantedAt: string;
      expiresAt: string | null;
      condition: AssignmentCondition | null;
    }>(`/admin/permissions/users/${userId}/assignments/${assignmentId}`, { body: input }),

  // Platform admin: tenants & storage quotas (requires platform:tenants:manage)
  listTenants: () =>
    http.get<
      Array<{
        organizationId: string;
        name: string;
        slug: string;
        quotaBytes: number | null;
        usedBytes: number;
        percentUsed: number | null;
        memberCount: number;
        tier: string;
        createdAt: string;
      }>
    >('/admin/tenants'),
  listPlatformUsers: (params?: {
    organizationId?: string | 'none';
    search?: string;
    page?: number;
    pageSize?: number;
  }) =>
    http.get<{
      data: Array<{
        id: string;
        email: string;
        displayName: string;
        role: UserRole;
        userTier: string;
        organizationId: string | null;
        organizationName: string | null;
        organizationSlug: string | null;
        emailVerified: boolean;
        isActive: boolean;
        createdAt: string;
        onboardedAt: string | null;
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>('/admin/users', {
      query: params as Record<string, string | number | undefined>,
    }),
  adminUpdateUser: (
    userId: string,
    patch: {
      displayName?: string;
      email?: string;
      jobTitle?: string | null;
      timezone?: string | null;
      locale?: string | null;
      emailVerified?: boolean;
      organizationId?: string | null;
      userTier?: string;
    },
  ) =>
    http.patch<{ id: string; email: string; displayName: string }>(`/admin/users/${userId}`, {
      body: patch,
    }),
  adminSetUserActive: (userId: string, isActive: boolean) =>
    http.patch<{ id: string; isActive: boolean }>(`/admin/users/${userId}/active`, {
      body: { isActive },
    }),
  adminResetUserPassword: (userId: string) =>
    http.post<{ sentTo: string; tokenForDev?: string }>(
      `/admin/users/${userId}/reset-password`,
    ),
  listTenantMembers: (
    organizationId: string,
    params?: { search?: string; page?: number; pageSize?: number },
  ) =>
    http.get<{
      data: Array<{
        id: string;
        email: string;
        displayName: string;
        role: UserRole;
        userTier: string;
        organizationId: string | null;
        organizationName: string | null;
        organizationSlug: string | null;
        emailVerified: boolean;
        createdAt: string;
        onboardedAt: string | null;
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/admin/tenants/${organizationId}/members`, {
      query: params as Record<string, string | number | undefined>,
    }),
  setTenantQuota: (organizationId: string, quotaBytes: number | null) =>
    http.patch<{ organizationId: string; quotaBytes: number | null; usedBytes: number }>(
      `/admin/tenants/${organizationId}/quota`,
      { body: { quotaBytes } },
    ),
  recomputeTenantUsage: (organizationId: string) =>
    http.post<{ organizationId: string; quotaBytes: number | null; usedBytes: number }>(
      `/admin/tenants/${organizationId}/recompute`,
    ),

  // Tier feature flags — admin endpoint (GLOBAL_ADMIN — platform:tiers:manage).
  listTiers: () =>
    http.get<
      Array<{
        id: string;
        code: string;
        label: string;
        description: string | null;
        applyBrandingWatermark: boolean;
        sortOrder: number;
        enabled: boolean;
        createdAt: string;
      }>
    >('/admin/tiers'),
  // Public tier list — open to any authenticated user. Used by template upload + edit
  // forms so the tier dropdown matches the platform's subscription tiers exactly
  // (same source of truth as /settings/tiers admin console).
  listEnabledTiers: () =>
    http.get<
      Array<{
        id: string;
        code: string;
        label: string;
        description: string | null;
        sortOrder: number;
        applyBrandingWatermark: boolean;
        enabled: boolean;
      }>
    >('/tiers'),
  createTier: (input: {
    code: string;
    label: string;
    description?: string;
    applyBrandingWatermark?: boolean;
    sortOrder?: number;
    enabled?: boolean;
  }) => http.post<unknown>('/admin/tiers', { body: input }),
  updateTier: (
    id: string,
    input: {
      label?: string;
      description?: string;
      applyBrandingWatermark?: boolean;
      sortOrder?: number;
      enabled?: boolean;
    },
  ) => http.patch<unknown>(`/admin/tiers/${id}`, { body: input }),
  deleteTier: (id: string) => http.delete<{ ok: boolean }>(`/admin/tiers/${id}`),

  // Audit log (compliance trail). ORG_ADMIN sees their own org. GLOBAL_ADMIN may pass
  // organizationId to narrow to one tenant, or leave it blank for cross-tenant view.
  listAuditLogs: (params?: {
    organizationId?: string;
    actorUserId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    outcome?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) =>
    http.get<{
      data: Array<{
        id: string;
        organizationId: string | null;
        actorUserId: string | null;
        actorEmail: string | null;
        actorRole: string | null;
        action: string;
        resourceType: string | null;
        resourceId: string | null;
        outcome: string;
        metadata: Record<string, unknown> | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: string;
      }>;
      total: number;
    }>('/audit-logs', { query: params as Record<string, string | number | undefined> }),

  // Compliance rules + alerts (configurable DLP)
  listComplianceRules: () =>
    http.get<
      Array<{
        id: string;
        organizationId: string | null;
        name: string;
        description: string | null;
        conditions: {
          actionPattern: string;
          metadataKeywords?: string[];
          actorRoles?: string[];
          outcome?: 'success' | 'failure' | 'any';
          resourceType?: string;
        };
        severity: 'INFO' | 'WARN' | 'CRITICAL';
        enabled: boolean;
        notifyEmails: string | null;
        createdAt: string;
      }>
    >('/compliance/rules'),
  createComplianceRule: (input: {
    name: string;
    description?: string;
    conditions: Record<string, unknown>;
    severity?: 'INFO' | 'WARN' | 'CRITICAL';
    enabled?: boolean;
    notifyEmails?: string;
    scope?: 'global' | 'tenant';
  }) => http.post<unknown>('/compliance/rules', { body: input }),
  updateComplianceRule: (id: string, input: Record<string, unknown>) =>
    http.patch<unknown>(`/compliance/rules/${id}`, { body: input }),
  deleteComplianceRule: (id: string) =>
    http.delete<{ ok: boolean }>(`/compliance/rules/${id}`),

  listComplianceAlerts: (params?: {
    organizationId?: string;
    acknowledged?: 'true' | 'false';
    severity?: 'INFO' | 'WARN' | 'CRITICAL';
    page?: number;
    pageSize?: number;
  }) =>
    http.get<{
      data: Array<{
        id: string;
        organizationId: string | null;
        ruleId: string;
        ruleName: string;
        auditLogId: string;
        severity: 'INFO' | 'WARN' | 'CRITICAL';
        message: string;
        matchedKeywords: string[] | null;
        actorEmail: string | null;
        actorUserId: string | null;
        action: string | null;
        acknowledgedAt: string | null;
        acknowledgedBy: string | null;
        createdAt: string;
      }>;
      total: number;
    }>('/compliance/alerts', {
      query: params as Record<string, string | number | undefined>,
    }),
  acknowledgeComplianceAlert: (id: string) =>
    http.post<unknown>(`/compliance/alerts/${id}/acknowledge`),
  unreadComplianceAlerts: () =>
    http.get<{ count: number }>('/compliance/alerts/unread-count'),
};
