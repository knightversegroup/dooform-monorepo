import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { type Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { CookieService } from '../services/cookie.service'
import type { AccessTokenPayload } from '../services/token.service'
import type { AuthenticatedUser } from '../../interface/rest/types/authenticated-user'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
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
