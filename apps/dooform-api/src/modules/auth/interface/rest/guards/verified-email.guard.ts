import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

import type { AuthenticatedUser } from '../types/authenticated-user'

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthenticatedUser | undefined
    if (!user) throw new ForbiddenException('Authentication required')
    if (!user.emailVerified) throw new ForbiddenException('Email verification required')
    return true
  }
}
