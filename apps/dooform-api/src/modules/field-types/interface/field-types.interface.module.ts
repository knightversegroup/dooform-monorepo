import { Module } from '@nestjs/common'

import { DataTypesController } from './rest/controllers/data-types.controller'

@Module({
  controllers: [DataTypesController],
})
export class FieldTypesInterfaceModule {}
