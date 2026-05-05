import { Module } from '@nestjs/common'

import { UsersController } from './rest/controllers/users.controller'
import { DocumentSharesController } from './rest/controllers/document-shares.controller'
import { DocumentLifecycleController } from './rest/controllers/document-lifecycle.controller'
import { DocumentCommentsController } from './rest/controllers/document-comments.controller'
import { DocumentActivitiesController } from './rest/controllers/document-activities.controller'
import { DocumentSignaturesController } from './rest/controllers/document-signatures.controller'
import { NotificationsController } from './rest/controllers/notifications.controller'

@Module({
  controllers: [
    UsersController,
    DocumentSharesController,
    DocumentLifecycleController,
    DocumentCommentsController,
    DocumentActivitiesController,
    DocumentSignaturesController,
    NotificationsController,
  ],
})
export class WorkflowInterfaceModule {}
