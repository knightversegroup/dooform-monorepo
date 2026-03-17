import { Module } from '@nestjs/common'

import { TyphoonService } from './typhoon.service'

@Module({
  providers: [TyphoonService],
  exports: [TyphoonService],
})
export class TyphoonModule {}
