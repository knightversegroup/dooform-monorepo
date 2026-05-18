import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TemplateModel } from '../modules/template/infrastructure/persistence/typeorm/models/template.model'
import { DocumentTypeModel } from '../modules/template/infrastructure/persistence/typeorm/models/document-type.model'
import { DocumentModel } from '../modules/document/infrastructure/persistence/typeorm/models/document.model'
import { DocumentAnnotationModel } from '../modules/document/infrastructure/persistence/typeorm/models/document-annotation.model'
import { WatermarkPresetModel } from '../modules/document/infrastructure/persistence/typeorm/models/watermark-preset.model'
import { SystemConfigModel } from '../modules/document/infrastructure/persistence/typeorm/models/system-config.model'
import { UserModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/user.model'
import { DocumentShareModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/document-share.model'
import { DocumentCommentModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/document-comment.model'
import { DocumentActivityModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/document-activity.model'
import { DocumentSignatureModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/document-signature.model'
import { NotificationModel } from '../modules/workflow/infrastructure/persistence/typeorm/models/notification.model'
import { DataTypeModel } from '../modules/field-types/infrastructure/persistence/typeorm/models/data-type.model'
import { OrganizationModel } from '../modules/user/infrastructure/persistence/typeorm/models/organization.model'
import { RefreshTokenModel } from '../modules/auth/infrastructure/persistence/typeorm/models/refresh-token.model'
import { PasswordResetTokenModel } from '../modules/auth/infrastructure/persistence/typeorm/models/password-reset-token.model'
import { InviteCodeModel } from '../modules/auth/infrastructure/persistence/typeorm/models/invite-code.model'
import { RolePermissionModel } from '../modules/auth/infrastructure/persistence/typeorm/models/role-permission.model'
import { UserPermissionModel } from '../modules/auth/infrastructure/persistence/typeorm/models/user-permission.model'
import { AuditLogModel } from '../modules/auth/infrastructure/persistence/typeorm/models/audit-log.model'
import { ComplianceRuleModel } from '../modules/auth/infrastructure/persistence/typeorm/models/compliance-rule.model'
import { ComplianceAlertModel } from '../modules/auth/infrastructure/persistence/typeorm/models/compliance-alert.model'
import { TemplateTaxonomyModel } from '../modules/template/infrastructure/persistence/typeorm/models/template-taxonomy.model'
import { TierConfigModel } from '../modules/user/infrastructure/persistence/typeorm/models/tier-config.model'
import { DictionaryCollectionModel } from '../modules/dictionary/infrastructure/persistence/typeorm/models/dictionary-collection.model'
import { DictionaryEntryModel } from '../modules/dictionary/infrastructure/persistence/typeorm/models/dictionary-entry.model'
import { AnnouncementModel } from '../modules/announcement/infrastructure/persistence/typeorm/models/announcement.model'

const entities = [
  TemplateModel,
  DocumentTypeModel,
  DocumentModel,
  DocumentAnnotationModel,
  WatermarkPresetModel,
  SystemConfigModel,
  UserModel,
  DocumentShareModel,
  DocumentCommentModel,
  DocumentActivityModel,
  DocumentSignatureModel,
  NotificationModel,
  DataTypeModel,
  OrganizationModel,
  RefreshTokenModel,
  PasswordResetTokenModel,
  InviteCodeModel,
  RolePermissionModel,
  UserPermissionModel,
  AuditLogModel,
  ComplianceRuleModel,
  ComplianceAlertModel,
  TemplateTaxonomyModel,
  TierConfigModel,
  DictionaryCollectionModel,
  DictionaryEntryModel,
  AnnouncementModel,
]

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL')
        const nodeEnv = configService.get<string>('NODE_ENV', 'development')
        const ssl = configService.get<string>('DATABASE_SSL', 'false') === 'true'

        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: ssl ? { rejectUnauthorized: false } : false,
          entities,
          synchronize: nodeEnv !== 'production',
          extra: {
            max: 5,
          },
          logging: nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
        }
      },
    }),
  ],
})
export class DatabaseModule {}
