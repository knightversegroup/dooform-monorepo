import { Module } from '@nestjs/common'

import { FieldTypesRepositoriesModule } from '../../../infrastructure/persistence/typeorm/field-types-repositories.module'
import { CreateDataTypeUseCase } from './create-data-type.use-case'

@Module({
  imports: [FieldTypesRepositoriesModule],
  providers: [CreateDataTypeUseCase],
  exports: [CreateDataTypeUseCase],
})
export class CreateDataTypeUseCaseModule {}
