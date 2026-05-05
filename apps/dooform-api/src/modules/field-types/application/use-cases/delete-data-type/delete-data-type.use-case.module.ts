import { Module } from '@nestjs/common'

import { FieldTypesRepositoriesModule } from '../../../infrastructure/persistence/typeorm/field-types-repositories.module'
import { DeleteDataTypeUseCase } from './delete-data-type.use-case'

@Module({
  imports: [FieldTypesRepositoriesModule],
  providers: [DeleteDataTypeUseCase],
  exports: [DeleteDataTypeUseCase],
})
export class DeleteDataTypeUseCaseModule {}
