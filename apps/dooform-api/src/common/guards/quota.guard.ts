import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Optional,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_QUOTA_KEY } from '../decorators/require-quota.decorator';

export const QUOTA_SERVICE = 'QUOTA_SERVICE';

export interface IQuotaService {
  checkQuota(userId: string): Promise<boolean>;
  useQuota(userId: string, documentId?: string): Promise<any>;
}

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() @Inject(QUOTA_SERVICE) private readonly quotaService?: IQuotaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireQuota = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_QUOTA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requireQuota) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Authentication required for quota check');
    }

    // Admin users bypass quota check
    const userRoles: string[] = Array.isArray(user.roles)
      ? user.roles
      : [user.roles];
    if (userRoles.includes('admin')) return true;

    // If quota service is not yet available (auth module not loaded), allow through
    if (!this.quotaService) return true;

    const hasQuota = await this.quotaService.checkQuota(user.userId);
    if (!hasQuota) {
      throw new ForbiddenException('Quota exceeded');
    }

    return true;
  }
}
