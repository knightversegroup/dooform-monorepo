import { Module } from '@nestjs/common'

import { AiInterfaceModule } from './interface/ai.interface.module'

@Module({
  imports: [AiInterfaceModule],
})
export class AiModule {}
