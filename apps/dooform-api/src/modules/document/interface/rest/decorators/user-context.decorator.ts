import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import { UserTier } from '../../../domain/enums/document.enum'

export interface UserContext {
  userId: string
  userTier: UserTier
  watermarkDisabled: boolean
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest()
    return {
      userId: request.headers['x-user-id'] ?? '',
      userTier: (request.headers['x-user-tier'] ?? UserTier.FREE) as UserTier,
      watermarkDisabled: request.headers['x-user-watermark-disabled'] === 'true',
    }
  },
)
