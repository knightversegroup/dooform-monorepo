import type { UserRole } from '../../../../user/domain/enums/user.enum'
import type { UserTier } from '../../../../document/domain/enums/document.enum'

export interface AuthenticatedUser {
  userId: string
  email: string
  /**
   * Legacy single-role field. Derived from `roles[]` (the highest-privilege
   * code by convention: GLOBAL_ADMIN > ORG_ADMIN > USER > everything else).
   * Kept for back-compat with callsites that haven't migrated to multi-role.
   * New code should call `permissionService.userHas(user, '<key>')` instead.
   */
  role: UserRole
  /**
   * All role codes the user holds right now. Includes system roles
   * (USER/ORG_ADMIN/GLOBAL_ADMIN) and any custom roles. Driven from the
   * `role_assignments` table at token issuance time.
   */
  roles: string[]
  userTier: UserTier
  organizationId: string | null
  emailVerified: boolean
  onboarded: boolean
}
