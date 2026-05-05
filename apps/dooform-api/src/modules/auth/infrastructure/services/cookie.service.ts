import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'

const ACCESS_COOKIE = 'dooform_access'
const REFRESH_COOKIE = 'dooform_refresh'

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  static readonly ACCESS_COOKIE = ACCESS_COOKIE
  static readonly REFRESH_COOKIE = REFRESH_COOKIE

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production'
    const secure = this.config.get<string>('COOKIE_SECURE', isProd ? 'true' : 'false') === 'true'
    const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined

    const accessTtlMs = this.parseTtlToMs(
      this.config.get<string>('JWT_ACCESS_TTL') ??
        this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '15m'),
    )
    const refreshTtlMs = this.parseTtlToMs(
      this.config.get<string>('JWT_REFRESH_TTL') ??
        this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRY', '7d'),
    )

    res.cookie(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: accessTtlMs,
    })

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      path: '/api/auth',
      maxAge: refreshTtlMs,
    })
  }

  clearAuthCookies(res: Response): void {
    const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined
    res.clearCookie(ACCESS_COOKIE, { path: '/', domain })
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth', domain })
  }

  private parseTtlToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim())
    if (!match) return 15 * 60 * 1000
    const n = parseInt(match[1], 10)
    const unit = match[2]
    const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
    return n * (multipliers[unit] ?? 60_000)
  }
}
