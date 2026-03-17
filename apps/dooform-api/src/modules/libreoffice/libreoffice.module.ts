import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { LibreOfficeService } from './libreoffice.service'

@Module({
  imports: [HttpModule],
  providers: [LibreOfficeService],
  exports: [LibreOfficeService],
})
export class LibreOfficeModule {}
