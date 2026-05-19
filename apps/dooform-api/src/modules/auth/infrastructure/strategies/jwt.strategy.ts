import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { type Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'

import { UserModel } from '../../../workflow/infrastructure/persistence/typeorm/models/user.model'

import { CookieService } from '../services/cookie.service'
import type { AccessTokenPayload } from '../services/token.service'
import type { AuthenticatedUser } from '../../interface/rest/types/authenticated-user'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(UserModel)
    private readonly users: Repository<UserModel>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[CookieService.ACCESS_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('JWT_ACCESS_SECRET') ?? config.getOrThrow<string>('JWT_SECRET'),
    })
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    // Re-check active status on every request so admin-initiated deactivation
    // takes effect immediately. The access token would otherwise stay valid
    // for the rest of its lifetime (15 min default) and the user could keep
    // using cached JWTs even after refresh tokens are revoked. One indexed PK
    // lookup per authenticated request — cheap enough at our scale.
    const user = await this.users.findOne({
      where: { id: payload.sub },
      select: ['id', 'isActive'],
    })
    if (!user) throw new UnauthorizedException('User not found')
    if (user.isActive === false) throw new UnauthorizedException('Account deactivated')

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      // Legacy tokens issued before the multi-role rollout don't carry
      // `roles`; synthesize from the single `role` claim so guards and the
      // frontend continue to see at least one role for the principal.
      roles: payload.roles && payload.roles.length > 0 ? payload.roles : [payload.role],
      userTier: payload.userTier,
      organizationId: payload.organizationId,
      emailVerified: payload.emailVerified,
      onboarded: payload.onboarded,
    }
  }
}
