import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentModel } from './models/document.model'
import { TypeOrmDocumentRepository } from './repositories/document.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentModel]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'IDocumentRepository',
      useClass: TypeOrmDocumentRepository,
    },
  ],
  exports: ['IDocumentRepository'],
})
export class DocumentRepositoriesModule {}
