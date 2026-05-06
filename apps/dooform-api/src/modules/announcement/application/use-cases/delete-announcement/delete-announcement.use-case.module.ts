import { Module } from '@nestjs/common'

import { AnnouncementRepositoriesModule } from '../../../infrastructure/persistence/typeorm/announcement-repositories.module'

import { DeleteAnnouncementUseCase } from './delete-announcement.use-case'

@Module({
  imports: [AnnouncementRepositoriesModule],
  providers: [DeleteAnnouncementUseCase],
  exports: [DeleteAnnouncementUseCase],
})
export class DeleteAnnouncementUseCaseModule {}
