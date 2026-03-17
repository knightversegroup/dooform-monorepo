import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { QUOTA_SERVICE } from '../../../common/guards/quota.guard'
import { AuthPersistenceModule } from '../infrastructure/persistence/typeorm/auth-persistence.module'
import { JwtTokenService } from '../application/services/jwt-token.service'
import { AuthService } from '../application/services/auth.service'
import { GoogleAuthService } from '../application/services/google-auth.service'
import { LineAuthService } from '../application/services/line-auth.service'
import { QuotaService } from '../application/services/quota.service'
import { AdminService } from '../application/services/admin.service'

import { AuthController } from './rest/controllers/auth.controller'
import { QuotaController } from './rest/controllers/quota.controller'
import { AdminController } from './rest/controllers/admin.controller'

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
    AuthPersistenceModule,
  ],
  controllers: [AuthController, QuotaController, AdminController],
  providers: [
    JwtTokenService,
    AuthService,
    GoogleAuthService,
    LineAuthService,
    QuotaService,
    AdminService,
    { provide: QUOTA_SERVICE, useExisting: QuotaService },
  ],
  exports: [AuthService, JwtTokenService, QuotaService, QUOTA_SERVICE],
})
export class AuthInterfaceModule {}
