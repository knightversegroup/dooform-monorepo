import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { TemplateModule } from '../modules/template/template.module';
import { DocumentModule } from '../modules/document/document.module';
import { WorkflowModule } from '../modules/workflow/workflow.module';
import { FieldTypesModule } from '../modules/field-types/field-types.module';
import { AuthModule } from '../modules/auth/auth.module';
import { DictionaryModule } from '../modules/dictionary/dictionary.module';
import { AnnouncementModule } from '../modules/announcement/announcement.module';
import { MailerModule } from '../common/mailer/mailer.module';
import { JwtAuthGuard } from '../modules/auth/interface/rest/guards/jwt-auth.guard';
import { PermissionsGuard } from '../modules/auth/interface/rest/guards/permissions.guard';
import { AuditInterceptor } from '../modules/auth/interface/rest/interceptors/audit.interceptor';

@Module({
  imports: [
    DatabaseModule,
    MailerModule,
    AuthModule,
    TemplateModule,
    DocumentModule,
    WorkflowModule,
    FieldTypesModule,
    DictionaryModule,
    AnnouncementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
