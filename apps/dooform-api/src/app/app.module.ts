import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { TemplateModule } from '../modules/template/template.module';

@Module({
  imports: [DatabaseModule, TemplateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
