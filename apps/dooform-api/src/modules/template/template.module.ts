import { Module } from '@nestjs/common'

import { TemplateInterfaceModule } from './interface/template.interface.module'

@Module({
  imports: [TemplateInterfaceModule],
})
export class TemplateModule {}
