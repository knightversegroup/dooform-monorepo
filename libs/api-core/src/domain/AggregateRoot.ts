import type { DomainEvent } from './DomainEvent'
import { Entity, type IEntityProps, type IEntityRelations } from './Entity'

export interface IAggregateRootProps extends IEntityProps {
  domainEvents?: DomainEvent[]
}

export type IAggregateRootRelations = IEntityRelations

export abstract class AggregateRoot<
  T extends IAggregateRootProps,
  R extends IAggregateRootRelations = IAggregateRootRelations,
> extends Entity<T, R> {
  domainEvents: DomainEvent[] = []

  constructor(props: T) {
    super(props)
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents
  }

  clearDomainEvents(): void {
    this.domainEvents = []
  }
}
