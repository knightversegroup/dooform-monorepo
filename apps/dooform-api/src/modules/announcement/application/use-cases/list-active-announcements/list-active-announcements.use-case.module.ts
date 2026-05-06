import { Module } from '@nestjs/common'

import { AnnouncementRepositoriesModule } from '../../../infrastructure/persistence/typeorm/announcement-repositories.module'

import { ListActiveAnnouncementsUseCase } from './list-active-announcements.use-case'

@Module({
  imports: [AnnouncementRepositoriesModule],
  providers: [ListActiveAnnouncementsUseCase],
  exports: [ListActiveAnnouncementsUseCase],
})
export class ListActiveAnnouncementsUseCaseModule {}
