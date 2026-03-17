import { Module } from '@nestjs/common'

import { TyphoonModule } from '../../services/typhoon.module'

import { MapFieldsUseCase } from './map-fields.use-case'

@Module({
  imports: [TyphoonModule],
  providers: [MapFieldsUseCase],
  exports: [MapFieldsUseCase],
})
export class MapFieldsUseCaseModule {}
