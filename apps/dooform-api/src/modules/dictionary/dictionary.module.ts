import { Module } from '@nestjs/common'

import { DictionaryInterfaceModule } from './interface/dictionary.interface.module'

@Module({
  imports: [DictionaryInterfaceModule],
})
export class DictionaryModule {}
