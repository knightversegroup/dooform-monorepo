import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { EventType } from '../enums/analytics.enum'

export interface StatisticsProps extends IEntityProps {
  eventType: EventType
  templateId: string | null
  date: Date
  count: number
}

export class Statistics extends Entity<StatisticsProps> {
  static create(props: {
    eventType: EventType
    templateId?: string | null
    date: Date
    count?: number
  }): Statistics {
    return new Statistics({
      eventType: props.eventType,
      templateId: props.templateId ?? null,
      date: props.date,
      count: props.count ?? 0,
    })
  }

  get eventType(): EventType {
    return this.getProp('eventType')
  }

  get templateId(): string | null {
    return this.getProp('templateId')
  }

  get date(): Date {
    return this.getProp('date')
  }

  get count(): number {
    return this.getProp('count')
  }

  increment(): void {
    this.updateProp('count', this.count + 1)
  }
}
