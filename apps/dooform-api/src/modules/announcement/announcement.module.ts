import { Module } from '@nestjs/common'

import { AnnouncementInterfaceModule } from './interface/announcement.interface.module'

@Module({
  imports: [AnnouncementInterfaceModule],
})
export class AnnouncementModule {}
