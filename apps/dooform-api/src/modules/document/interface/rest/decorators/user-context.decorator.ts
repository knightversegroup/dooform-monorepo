import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import { UserTier } from '../../../domain/enums/document.enum'
import type { AuthenticatedUser } from '../../../../auth/interface/rest/types/authenticated-user'

export interface UserContext {
  userId: string
  userTier: UserTier
  watermarkDisabled: boolean
  organizationId: string | null
  role?: string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest()
    const authUser = request.user as AuthenticatedUser | undefined
    if (authUser) {
      return {
        userId: authUser.userId,
        userTier: authUser.userTier ?? UserTier.FREE,
        watermarkDisabled: authUser.userTier !== UserTier.FREE,
        organizationId: authUser.organizationId,
        role: authUser.role,
      }
    }
    // Fallback for non-authenticated contexts (e.g. service-to-service or tests).
    return {
      userId: request.headers['x-user-id'] ?? '',
      userTier: (request.headers['x-user-tier'] ?? UserTier.FREE) as UserTier,
      watermarkDisabled: request.headers['x-user-watermark-disabled'] === 'true',
      organizationId: request.headers['x-organization-id'] ?? null,
      role: request.headers['x-user-role'] ?? undefined,
    }
  },
)
