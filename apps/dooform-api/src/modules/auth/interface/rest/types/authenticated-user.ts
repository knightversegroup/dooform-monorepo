import type { UserRole } from '../../../../user/domain/enums/user.enum'
import type { UserTier } from '../../../../document/domain/enums/document.enum'

export interface AuthenticatedUser {
  userId: string
  email: string
  role: UserRole
  userTier: UserTier
  organizationId: string | null
  emailVerified: boolean
  onboarded: boolean
}
