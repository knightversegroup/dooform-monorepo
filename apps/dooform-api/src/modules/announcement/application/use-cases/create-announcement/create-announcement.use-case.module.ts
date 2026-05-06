import { Module } from '@nestjs/common'

import { AnnouncementRepositoriesModule } from '../../../infrastructure/persistence/typeorm/announcement-repositories.module'

import { CreateAnnouncementUseCase } from './create-announcement.use-case'

@Module({
  imports: [AnnouncementRepositoriesModule],
  providers: [CreateAnnouncementUseCase],
  exports: [CreateAnnouncementUseCase],
})
export class CreateAnnouncementUseCaseModule {}
