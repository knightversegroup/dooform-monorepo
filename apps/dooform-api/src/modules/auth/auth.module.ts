import { Module, OnModuleInit, Logger } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthInterfaceModule } from './interface/auth.interface.module'
import { AuthService } from './application/services/auth.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '24h') as any },
      }),
    }),
    AuthInterfaceModule,
  ],
  exports: [JwtModule, AuthInterfaceModule],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name)

  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    try {
      await this.authService.seedDefaultRoles()
      this.logger.log('Auth module initialized')
    } catch (err) {
      this.logger.warn(`Auth seed skipped (DB schema may need migration): ${err}`)
    }

    // Schedule token cleanup every hour
    setInterval(() => {
      this.authService.cleanupExpiredTokens().catch((err) => {
        this.logger.error(`Token cleanup failed: ${err}`)
      })
    }, 60 * 60 * 1000)
  }
}
