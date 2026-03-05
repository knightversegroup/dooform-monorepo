import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TemplateModel } from '../modules/template/infrastructure/persistence/typeorm/models/template.model'

const entities = [TemplateModel]

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
