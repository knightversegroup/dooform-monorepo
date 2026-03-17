import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { TemplateModule } from '../modules/template/template.module';
import { DocumentModule } from '../modules/document/document.module';
import { AiModule } from '../modules/ai/ai.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { ConfigDataModule } from '../modules/config/config-data.module';
import { GeolocationsModule } from '../modules/geolocations/geolocations.module';
import { AuthModule } from '../modules/auth/auth.module';

import { HealthController } from '../common/controllers/health.controller';
import { GlobalExceptionFilter } from '../common/filters';
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs';
import { JwtAuthGuard, RolesGuard, QuotaGuard } from '../common/guards';
import { LoggingInterceptor, ActivityLoggingInterceptor } from '../common/interceptors';
import { RequestValidationMiddleware } from '../common/middleware';

@Module({
  imports: [
    DatabaseModule,

    // JWT configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRY', '24h') as any,
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting: 1000 requests per minute, burst of 100
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 1000,
      },
    ]),

    AuthModule,
    TemplateModule,
    DocumentModule,
    AiModule,
    AnalyticsModule,
    ConfigDataModule,
    GeolocationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,

    // Global exception filters (order matters: last registered = first executed)
    // GlobalExceptionFilter catches NestJS HttpExceptions (guards, throttler, etc.)
    // HttpResultExceptionFilter catches domain exceptions (business logic errors)
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: HttpResultExceptionFilter },

    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ActivityLoggingInterceptor },

    // Global guards (order matters: throttler → auth → roles)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: QuotaGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestValidationMiddleware).forRoutes('*');
  }
}
