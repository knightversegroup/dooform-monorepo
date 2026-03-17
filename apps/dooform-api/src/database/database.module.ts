import { Module, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { TemplateModel } from '../modules/template/infrastructure/persistence/typeorm/models/template.model'
import { DocumentTypeModel } from '../modules/template/infrastructure/persistence/typeorm/models/document-type.model'
import { DocumentModel } from '../modules/document/infrastructure/persistence/typeorm/models/document.model'
import { ActivityLogModel } from '../modules/analytics/infrastructure/persistence/typeorm/models/activity-log.model'
import { StatisticsModel } from '../modules/analytics/infrastructure/persistence/typeorm/models/statistics.model'
import { DataTypeModel } from '../modules/config/infrastructure/persistence/typeorm/models/data-type.model'
import { InputTypeModel } from '../modules/config/infrastructure/persistence/typeorm/models/input-type.model'
import { FieldRuleModel } from '../modules/config/infrastructure/persistence/typeorm/models/field-rule.model'
import { EntityRuleModel } from '../modules/config/infrastructure/persistence/typeorm/models/entity-rule.model'
import { FilterCategoryModel } from '../modules/config/infrastructure/persistence/typeorm/models/filter-category.model'
import { FilterOptionModel } from '../modules/config/infrastructure/persistence/typeorm/models/filter-option.model'
import { AdministrativeBoundaryModel } from '../modules/geolocations/infrastructure/persistence/typeorm/models/administrative-boundary.model'
import { UserModel } from '../modules/auth/infrastructure/persistence/typeorm/models/user.model'
import { RoleModel } from '../modules/auth/infrastructure/persistence/typeorm/models/role.model'
import { UserRoleModel } from '../modules/auth/infrastructure/persistence/typeorm/models/user-role.model'
import { RefreshTokenModel } from '../modules/auth/infrastructure/persistence/typeorm/models/refresh-token.model'
import { UserQuotaModel } from '../modules/auth/infrastructure/persistence/typeorm/models/user-quota.model'
import { QuotaTransactionModel } from '../modules/auth/infrastructure/persistence/typeorm/models/quota-transaction.model'

const entities = [
  TemplateModel,
  DocumentTypeModel,
  DocumentModel,
  ActivityLogModel,
  StatisticsModel,
  DataTypeModel,
  InputTypeModel,
  FieldRuleModel,
  EntityRuleModel,
  FilterCategoryModel,
  FilterOptionModel,
  AdministrativeBoundaryModel,
  UserModel,
  RoleModel,
  UserRoleModel,
  RefreshTokenModel,
  UserQuotaModel,
  QuotaTransactionModel,
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
          synchronize: false,
          extra: {
            max: 5,
          },
          logging: nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
        }
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name)

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    // Auto-add missing columns to existing tables using TypeORM metadata
    for (const meta of this.dataSource.entityMetadatas) {
      const tableName = meta.tableName
      try {
        // Get existing columns from the DB
        const existingCols: { column_name: string }[] = await this.dataSource.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
          [tableName],
        )
        if (existingCols.length === 0) continue // Table doesn't exist, skip

        const existingSet = new Set(existingCols.map((c) => c.column_name))

        for (const col of meta.columns) {
          const dbName = col.databaseName
          if (existingSet.has(dbName)) continue

          // Determine SQL type and default
          let sqlType = 'TEXT'
          let defaultVal = "DEFAULT ''"

          const colType = (col.type as string)?.toString()?.toLowerCase() ?? ''
          const length = col.length ? `(${col.length})` : ''

          if (colType === 'uuid') {
            sqlType = 'UUID'
            defaultVal = ''
          } else if (colType === 'varchar' || colType === 'character varying') {
            sqlType = `VARCHAR${length || '(255)'}`
            defaultVal = `DEFAULT '${col.default ?? ''}'`
          } else if (colType === 'text') {
            sqlType = 'TEXT'
            defaultVal = `DEFAULT '${col.default ?? ''}'`
          } else if (colType === 'int' || colType === 'integer') {
            sqlType = 'INTEGER'
            defaultVal = `DEFAULT ${col.default ?? 0}`
          } else if (colType === 'bigint') {
            sqlType = 'BIGINT'
            defaultVal = `DEFAULT ${col.default ?? 0}`
          } else if (colType === 'boolean') {
            sqlType = 'BOOLEAN'
            defaultVal = `DEFAULT ${col.default ?? false}`
          } else if (colType === 'json' || colType === 'jsonb') {
            sqlType = colType.toUpperCase()
            defaultVal = `DEFAULT '${col.default ?? '{}'}'`
          } else if (colType === 'date') {
            sqlType = 'DATE'
            defaultVal = ''
          } else if (colType === 'timestamptz' || colType === 'timestamp with time zone') {
            sqlType = 'TIMESTAMPTZ'
            defaultVal = ''
          }

          const nullable = col.isNullable ? 'NULL' : (defaultVal ? 'NOT NULL' : 'NULL')

          try {
            await this.dataSource.query(
              `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${dbName}" ${sqlType} ${nullable} ${defaultVal}`.trim(),
            )
            this.logger.log(`Added column "${dbName}" to "${tableName}"`)
          } catch (colErr: any) {
            this.logger.warn(`Could not add "${dbName}" to "${tableName}": ${colErr.message}`)
          }
        }
      } catch {
        // Table might not exist, skip
      }
    }
  }
}
