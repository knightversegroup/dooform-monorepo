import { Module } from '@nestjs/common'

import { FieldTypesRepositoriesModule } from '../../../infrastructure/persistence/typeorm/field-types-repositories.module'
import { UpdateDataTypeUseCase } from './update-data-type.use-case'

@Module({
  imports: [FieldTypesRepositoriesModule],
  providers: [UpdateDataTypeUseCase],
  exports: [UpdateDataTypeUseCase],
})
export class UpdateDataTypeUseCaseModule {}
