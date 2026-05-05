import { Inject, Injectable } from '@nestjs/common'

import { ActivityType } from '../enums/workflow.enum'
import { DocumentActivity } from '../entities/document-activity.entity'
import type { IDocumentActivityRepository } from '../repositories/document-activity.repository'

/**
 * Domain service that records activity rows. Used by other use cases to keep an audit
 * trail of every state-changing operation on a document.
 */
@Injectable()
export class ActivityService {
  constructor(
    @Inject('IDocumentActivityRepository')
    private readonly activities: IDocumentActivityRepository,
  ) {}

  async record(
    documentId: string,
    userId: string,
    type: ActivityType,
    payload: Record<string, unknown> = {},
  ): Promise<DocumentActivity> {
    const activity = DocumentActivity.create({ documentId, userId, type, payload })
    return this.activities.save(activity)
  }
}
