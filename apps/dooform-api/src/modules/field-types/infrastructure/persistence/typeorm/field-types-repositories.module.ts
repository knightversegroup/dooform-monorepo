import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DataTypeModel } from './models/data-type.model'
import { TypeOrmDataTypeRepository } from './repositories/data-type.repository'

@Module({
  imports: [TypeOrmModule.forFeature([DataTypeModel]), UnitOfWorkTypeOrmModule],
  providers: [
    { provide: 'IDataTypeRepository', useClass: TypeOrmDataTypeRepository },
  ],
  exports: ['IDataTypeRepository', TypeOrmModule],
})
export class FieldTypesRepositoriesModule {}
