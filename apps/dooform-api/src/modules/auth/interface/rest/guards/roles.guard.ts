import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UserRole } from '../../../../user/domain/enums/user.enum'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthenticatedUser | undefined
    if (!user) throw new ForbiddenException('Authentication required')

    if (user.role === UserRole.GLOBAL_ADMIN) return true
    if (required.includes(user.role)) return true

    throw new ForbiddenException('Insufficient role')
  }
}
