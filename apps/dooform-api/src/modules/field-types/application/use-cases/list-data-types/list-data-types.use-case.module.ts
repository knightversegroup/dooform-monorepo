import { Module } from '@nestjs/common'

import { FieldTypesRepositoriesModule } from '../../../infrastructure/persistence/typeorm/field-types-repositories.module'
import { ListDataTypesUseCase } from './list-data-types.use-case'

@Module({
  imports: [FieldTypesRepositoriesModule],
  providers: [ListDataTypesUseCase],
  exports: [ListDataTypesUseCase],
})
export class ListDataTypesUseCaseModule {}
