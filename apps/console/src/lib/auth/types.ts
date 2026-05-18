export type UserRole = 'USER' | 'ORG_ADMIN' | 'GLOBAL_ADMIN';
export type UserTier = 'free' | 'pro' | 'max';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  userTier: UserTier;
  organizationId: string | null;
  emailVerified: boolean;
  onboarded: boolean;
  timezone: string | null;
  locale: string | null;
  jobTitle: string | null;
  // Effective permission keys for this user — used to hide UI controls. Server is still
  // the source of truth and re-checks on every request.
  permissions: string[];
}

export interface CompleteOnboardingPayload {
  name: string;
  avatarUrl?: string;
  organizationName?: string;
  jobTitle?: string;
  timezone?: string;
  locale?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
  inviteCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
  jobTitle?: string;
  timezone?: string;
  locale?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string | null;
  tier: UserTier;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  userTier: UserTier;
  jobTitle: string | null;
  createdAt: string;
}

export interface PermissionDefinition {
  key: string;
  group: string;
  label: string;
  description: string;
}

export type RoleGrants = Record<UserRole, string[]>;

export interface AssignmentCondition {
  title?: string;
  validBefore?: string;
  validAfter?: string;
  actionMatches?: string[];
  ipAllow?: string[];
  outcomeIn?: ('success' | 'failure')[];
}

export interface InviteCode {
  id: string;
  code: string;
  organizationId: string | null;
  createdByUserId: string;
  expiresAt: string | null;
  usedAt: string | null;
  usedByUserId: string | null;
  createdAt: string;
}
