import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { TierService } from '../../../../user/application/services/tier.service'
import { CAPABILITIES_METADATA } from '../decorators/require-capability.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tier: TierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(CAPABILITIES_METADATA, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthenticatedUser | undefined
    if (!user) throw new ForbiddenException('Authentication required')

    for (const key of required) {
      // TierService.assertCapability throws ForbiddenException with the required
      // tier embedded — the frontend reads that to render upgrade CTAs.
      await this.tier.assertCapability(user.organizationId, key)
    }
    return true
  }
}
