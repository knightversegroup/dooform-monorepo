import { Module } from '@nestjs/common'

import { DictionaryController } from './rest/controllers/dictionary.controller'

@Module({
  controllers: [DictionaryController],
})
export class DictionaryInterfaceModule {}
