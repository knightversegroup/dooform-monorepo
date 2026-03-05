import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { TemplateModel } from './models/template.model'
import { TypeOrmTemplateRepository } from './repositories/template.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateModel]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'ITemplateRepository',
      useClass: TypeOrmTemplateRepository,
    },
  ],
  exports: ['ITemplateRepository'],
})
export class TemplateRepositoriesModule {}
