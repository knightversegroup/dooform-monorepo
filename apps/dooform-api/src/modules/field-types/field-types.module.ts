import { Module } from '@nestjs/common'

import { FieldTypesInterfaceModule } from './interface/field-types.interface.module'

@Module({
  imports: [FieldTypesInterfaceModule],
})
export class FieldTypesModule {}
