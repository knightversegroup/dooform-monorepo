import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModel } from '../workflow/infrastructure/persistence/typeorm/models/user.model'
import { OrganizationModel } from '../user/infrastructure/persistence/typeorm/models/organization.model'

import { AuthService } from './application/services/auth.service'
import { CookieService } from './infrastructure/services/cookie.service'
import { PasswordService } from './infrastructure/services/password.service'
import { TokenService } from './infrastructure/services/token.service'
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy'
import { InviteCodeModel } from './infrastructure/persistence/typeorm/models/invite-code.model'
import { PasswordResetTokenModel } from './infrastructure/persistence/typeorm/models/password-reset-token.model'
import { RefreshTokenModel } from './infrastructure/persistence/typeorm/models/refresh-token.model'
import { RolePermissionModel } from './infrastructure/persistence/typeorm/models/role-permission.model'
import { UserPermissionModel } from './infrastructure/persistence/typeorm/models/user-permission.model'
import { AuditLogModel } from './infrastructure/persistence/typeorm/models/audit-log.model'
import { ComplianceRuleModel } from './infrastructure/persistence/typeorm/models/compliance-rule.model'
import { ComplianceAlertModel } from './infrastructure/persistence/typeorm/models/compliance-alert.model'
import { AdminSeedService } from './application/services/admin-seed.service'
import { AuditLogService } from './application/services/audit-log.service'
import { ComplianceService } from './application/services/compliance.service'
import { PermissionService } from './application/services/permission.service'
import { PermissionsGuard } from './interface/rest/guards/permissions.guard'
import { AuthController } from './interface/rest/controllers/auth.controller'
import { OrganizationController } from './interface/rest/controllers/organization.controller'
import { PermissionsController } from './interface/rest/controllers/permissions.controller'
import { TenantsAdminController } from './interface/rest/controllers/tenants.controller'
import { TiersAdminController, TiersPublicController } from './interface/rest/controllers/tiers.controller'
import { AuditLogsController } from './interface/rest/controllers/audit-logs.controller'
import { ComplianceController } from './interface/rest/controllers/compliance.controller'
import { StorageQuotaService } from '../user/application/services/storage-quota.service'
import { TierConfigService } from '../user/application/services/tier-config.service'
import { TierConfigModel } from '../user/infrastructure/persistence/typeorm/models/tier-config.model'
import { DocumentServicesModule } from '../document/infrastructure/services/document-services.module'

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_ACCESS_SECRET') ??
          config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_TTL') ??
            config.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '15m')) as unknown as number,
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    DocumentServicesModule,
    TypeOrmModule.forFeature([
      UserModel,
      OrganizationModel,
      RefreshTokenModel,
      PasswordResetTokenModel,
      InviteCodeModel,
      RolePermissionModel,
      UserPermissionModel,
      AuditLogModel,
      ComplianceRuleModel,
      ComplianceAlertModel,
      TierConfigModel,
    ]),
  ],
  controllers: [
    AuthController,
    OrganizationController,
    PermissionsController,
    TenantsAdminController,
    TiersAdminController,
    TiersPublicController,
    AuditLogsController,
    ComplianceController,
  ],
  providers: [
    AuthService,
    AdminSeedService,
    AuditLogService,
    ComplianceService,
    PermissionService,
    PermissionsGuard,
    PasswordService,
    TokenService,
    CookieService,
    JwtStrategy,
    StorageQuotaService,
    TierConfigService,
  ],
  exports: [
    AuthService,
    TokenService,
    CookieService,
    PermissionService,
    PermissionsGuard,
    StorageQuotaService,
    TierConfigService,
    AuditLogService,
    ComplianceService,
  ],
})
export class AuthModule {}
