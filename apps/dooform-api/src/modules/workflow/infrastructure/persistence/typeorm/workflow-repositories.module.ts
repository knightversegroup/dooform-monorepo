import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentModel } from '../../../../document/infrastructure/persistence/typeorm/models/document.model'
import { UserModel } from './models/user.model'
import { DocumentShareModel } from './models/document-share.model'
import { DocumentCommentModel } from './models/document-comment.model'
import { DocumentActivityModel } from './models/document-activity.model'
import { DocumentSignatureModel } from './models/document-signature.model'
import { NotificationModel } from './models/notification.model'

import { TypeOrmUserRepository } from './repositories/user.repository'
import { TypeOrmDocumentShareRepository } from './repositories/document-share.repository'
import { TypeOrmDocumentCommentRepository } from './repositories/document-comment.repository'
import { TypeOrmDocumentActivityRepository } from './repositories/document-activity.repository'
import { TypeOrmDocumentSignatureRepository } from './repositories/document-signature.repository'
import { TypeOrmNotificationRepository } from './repositories/notification.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentModel,
      UserModel,
      DocumentShareModel,
      DocumentCommentModel,
      DocumentActivityModel,
      DocumentSignatureModel,
      NotificationModel,
    ]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },
    { provide: 'IDocumentShareRepository', useClass: TypeOrmDocumentShareRepository },
    { provide: 'IDocumentCommentRepository', useClass: TypeOrmDocumentCommentRepository },
    { provide: 'IDocumentActivityRepository', useClass: TypeOrmDocumentActivityRepository },
    { provide: 'IDocumentSignatureRepository', useClass: TypeOrmDocumentSignatureRepository },
    { provide: 'INotificationRepository', useClass: TypeOrmNotificationRepository },
  ],
  exports: [
    TypeOrmModule,
    'IUserRepository',
    'IDocumentShareRepository',
    'IDocumentCommentRepository',
    'IDocumentActivityRepository',
    'IDocumentSignatureRepository',
    'INotificationRepository',
  ],
})
export class WorkflowRepositoriesModule {}
