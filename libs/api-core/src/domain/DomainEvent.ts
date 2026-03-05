export interface IEventMetadata {
  timestamp: Date
  eventId: string
  correlationId?: string
}

export abstract class DomainEvent {
  public readonly metadata: IEventMetadata

  constructor(metadata?: Partial<IEventMetadata>) {
    this.metadata = {
      timestamp: new Date(),
      eventId: crypto.randomUUID(),
      ...metadata,
    }
  }

  abstract get eventName(): string
}

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>
}
