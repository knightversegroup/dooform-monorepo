import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PermissionService } from '../../../application/services/permission.service'
import { PERMISSIONS_METADATA } from '../decorators/require-permission.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_METADATA, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthenticatedUser | undefined
    if (!user) throw new ForbiddenException('Authentication required')

    const missing = required.filter(
      (key) => !this.permissions.userHas({ userId: user.userId, role: user.role }, key),
    )
    if (missing.length) {
      throw new ForbiddenException(
        `Missing permission${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
      )
    }
    return true
  }
}
