import { Module } from '@nestjs/common'

import { AdminAnnouncementsController } from './rest/controllers/admin-announcements.controller'
import { AnnouncementsController } from './rest/controllers/announcements.controller'

@Module({
  controllers: [AnnouncementsController, AdminAnnouncementsController],
})
export class AnnouncementInterfaceModule {}
