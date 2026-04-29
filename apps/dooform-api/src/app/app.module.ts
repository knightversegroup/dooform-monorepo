import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { TemplateModule } from '../modules/template/template.module';
import { DocumentModule } from '../modules/document/document.module';

@Module({
  imports: [DatabaseModule, TemplateModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
