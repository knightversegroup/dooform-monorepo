import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { TyphoonService } from './typhoon.service'

@Module({
  imports: [ConfigModule],
  providers: [TyphoonService],
  exports: [TyphoonService],
})
export class TyphoonModule {}
