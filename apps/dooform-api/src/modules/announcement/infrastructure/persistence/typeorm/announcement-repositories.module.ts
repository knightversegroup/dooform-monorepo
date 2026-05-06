import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { AnnouncementModel } from './models/announcement.model'
import { TypeOrmAnnouncementRepository } from './repositories/announcement.repository'

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncementModel]), UnitOfWorkTypeOrmModule],
  providers: [
    {
      provide: 'IAnnouncementRepository',
      useClass: TypeOrmAnnouncementRepository,
    },
  ],
  exports: ['IAnnouncementRepository'],
})
export class AnnouncementRepositoriesModule {}
