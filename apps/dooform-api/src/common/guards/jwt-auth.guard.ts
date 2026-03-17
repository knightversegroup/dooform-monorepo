import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { timingSafeEqual } from 'crypto'

import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    // Check API Key first (service-to-service auth)
    const apiKey = request.headers['x-api-key']
    if (apiKey) {
      const configuredApiKey = this.configService.get<string>('API_KEY')
      if (
        configuredApiKey &&
        apiKey.length === configuredApiKey.length &&
        timingSafeEqual(Buffer.from(apiKey), Buffer.from(configuredApiKey))
      ) {
        request.user = { userId: 'api-key', email: 'system', roles: ['admin'] }
        return true
      }
      throw new UnauthorizedException('Invalid API key')
    }

    // Check Bearer token
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException('Missing authentication token')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      })

      if (payload.token_type !== 'access') {
        throw new UnauthorizedException('Invalid token type')
      }

      request.user = {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return true
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
