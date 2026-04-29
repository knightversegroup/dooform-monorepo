import { Module } from '@nestjs/common'

import { DocumentInterfaceModule } from './interface/document.interface.module'

@Module({
  imports: [DocumentInterfaceModule],
})
export class DocumentModule {}
