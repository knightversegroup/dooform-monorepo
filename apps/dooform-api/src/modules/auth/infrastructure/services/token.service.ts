import { randomBytes, createHash } from 'crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import type { UserRole } from '../../../user/domain/enums/user.enum'
import type { UserTier } from '../../../document/domain/enums/document.enum'

export interface AccessTokenPayload {
  sub: string
  email: string
  /** Legacy primary role — derived from `roles` at token issuance. */
  role: UserRole
  /**
   * Full set of role codes the user holds at token issuance time. Includes
   * system roles and any custom roles. Token lifetime is short (15min) so a
   * role assignment change becomes visible on the next refresh; in-flight
   * permission checks still query the cached role assignments live.
   */
  roles?: string[]
  userTier: UserTier
  organizationId: string | null
  emailVerified: boolean
  onboarded: boolean
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessSecret(): string {
    return (
      this.config.get<string>('JWT_ACCESS_SECRET') ??
      this.config.getOrThrow<string>('JWT_SECRET')
    )
  }

  private accessTtl(): string {
    return (
      this.config.get<string>('JWT_ACCESS_TTL') ??
      this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '15m')
    )
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.accessSecret(),
      expiresIn: this.accessTtl() as unknown as number,
    })
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, {
      secret: this.accessSecret(),
    })
  }

  generateOpaqueToken(bytes = 32): string {
    return randomBytes(bytes).toString('hex')
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
