import { Module } from '@nestjs/common'

import { AnnouncementRepositoriesModule } from '../../../infrastructure/persistence/typeorm/announcement-repositories.module'

import { ListAllAnnouncementsUseCase } from './list-all-announcements.use-case'

@Module({
  imports: [AnnouncementRepositoriesModule],
  providers: [ListAllAnnouncementsUseCase],
  exports: [ListAllAnnouncementsUseCase],
})
export class ListAllAnnouncementsUseCaseModule {}
