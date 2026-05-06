import { Module } from '@nestjs/common'

import { AnnouncementRepositoriesModule } from '../../../infrastructure/persistence/typeorm/announcement-repositories.module'

import { UpdateAnnouncementUseCase } from './update-announcement.use-case'

@Module({
  imports: [AnnouncementRepositoriesModule],
  providers: [UpdateAnnouncementUseCase],
  exports: [UpdateAnnouncementUseCase],
})
export class UpdateAnnouncementUseCaseModule {}
