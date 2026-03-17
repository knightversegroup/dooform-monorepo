import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
  sub: string
  email: string
  token_type: 'access' | 'refresh'
  roles: string[]
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: string
  private readonly refreshSecret: string
  private readonly accessExpiresIn: string
  private readonly refreshExpiresIn: string

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
    this.accessExpiresIn = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '24h')
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY', '168h')
  }

  async generateTokenPair(userId: string, email: string, roles: string[]): Promise<TokenPair> {
    const safeRoles = roles ?? []

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, token_type: 'access', roles: safeRoles } satisfies JwtPayload,
        { secret: this.accessSecret, expiresIn: this.accessExpiresIn as any, issuer: 'dooform-auth-service' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, token_type: 'refresh', roles: safeRoles } satisfies JwtPayload,
        { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn as any, issuer: 'dooform-auth-service' },
      ),
    ])

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.parseExpiresIn(this.accessExpiresIn),
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, { secret: this.accessSecret })
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, { secret: this.refreshSecret })
  }

  getRefreshTokenDuration(): number {
    return this.parseExpiresIn(this.refreshExpiresIn) * 1000
  }

  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/)
    if (!match) return 86400 // default 24h
    const num = parseInt(match[1], 10)
    switch (match[2]) {
      case 's': return num
      case 'm': return num * 60
      case 'h': return num * 3600
      case 'd': return num * 86400
      default: return 86400
    }
  }
}
