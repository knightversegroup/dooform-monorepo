import CryptoUtils from '../shared/CryptoUtils'

import { Identifier } from './Identifier'

type EntityIdentifierType = string

export interface IEntityProps {
  id?: EntityIdentifierType
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface IEntityRelations {
  [key: string]: Entity<any>[] | Entity<any> | null
}

enum EntityState {
  NEW = 'NEW',
  UNCHANGED = 'UNCHANGED',
  UPDATED = 'UPDATED',
  SAVED = 'SAVED',
  DELETED = 'DELETED',
}

export type GetEntityProps<T extends Entity<any, any>> = T extends Entity<infer U, any> ? U : never
export type GetEntityRelations<T extends Entity<any, any>> =
  T extends Entity<any, infer U> ? U : never

export abstract class Entity<
  T extends IEntityProps,
  R extends IEntityRelations = IEntityRelations,
> {
  private readonly _id: Identifier<IEntityProps['id']>
  private _props: T
  private readonly _relations: R = {} as R
  protected _state: EntityState = EntityState.NEW
  protected _previousProps = new Map<keyof T, T[keyof T]>()

  static generateId(): Identifier<IEntityProps['id']> {
    return new Identifier<IEntityProps['id']>(CryptoUtils.generateUUID())
  }

  constructor(props: T) {
    this._id = props.id ? new Identifier(props.id) : Entity.generateId()
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    }

    if (props.id) {
      this.updateState(EntityState.UNCHANGED)
    }
  }

  get id(): EntityIdentifierType {
    return this._id.toValue()!
  }

  public isNew(): boolean {
    return this._state === EntityState.NEW
  }

  public isUpdated(): boolean {
    return this._state === EntityState.UPDATED
  }

  public isSaved(): boolean {
    return this._state === EntityState.SAVED
  }

  public isUnchanged(): boolean {
    return this._state === EntityState.UNCHANGED
  }

  public isDeleted(): boolean {
    return this._state === EntityState.DELETED
  }

  public getProps(): T {
    return this._props
  }

  public getProp(prop: 'createdAt' | 'updatedAt'): Date
  public getProp<K extends keyof T>(prop: K): T[K]
  public getProp<K extends keyof T>(prop: K): T[K] {
    return this._props[prop]
  }

  private updateState(state: EntityState): void {
    this._state = state
  }

  public equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false
    }
    if (!(entity instanceof Entity)) {
      return false
    }
    return this.id === entity.id
  }

  protected updateTimestamp(): void {
    this.updateProp('updatedAt', new Date())
  }

  protected updateProp<K extends keyof T>(prop: K, value: T[K]): void {
    const shouldUpdateState = this.isUnchanged() || this.isUpdated() || this.isSaved()

    if (shouldUpdateState) {
      this._previousProps.set(prop, this._props[prop])
      this.updateState(EntityState.UPDATED)
      if (prop !== 'updatedAt') {
        this.updateTimestamp()
      }
    }

    this._props[prop] = value
  }

  protected updateProps(props: {
    [K in keyof Partial<T>]: T[K]
  }): void {
    const shouldUpdateState = this.isUnchanged() || this.isUpdated()

    for (const [prop, value] of Object.entries(props)) {
      if (shouldUpdateState) {
        this._previousProps.set(prop as keyof T, this._props[prop as keyof T])
      }
      this._props[prop as keyof T] = value as T[keyof T]
    }

    if (shouldUpdateState) {
      this.updateTimestamp()
    }
  }

  protected delete() {
    this.updateProp('deletedAt', new Date())
    this.updateState(EntityState.DELETED)
  }

  public getRowData() {
    return {
      ...this._props,
      id: this.id,
    }
  }

  protected setRelation<K extends keyof R>(key: K, value: R[K]): void {
    this._relations[key] = value
  }

  protected hasRelation<K extends keyof R>(key: K): boolean {
    return this._relations[key] !== null && this._relations[key] !== undefined
  }

  protected getRelation<K extends keyof R>(key: K): R[K] {
    return this._relations[key]
  }

  protected removeRelation<K extends keyof R>(key: K): void {
    delete this._relations[key]
  }

  private _changeState(state: EntityState): void {
    this._state = state
    if (state === EntityState.SAVED || state === EntityState.UNCHANGED) {
      this._previousProps.clear()
    }
  }

  static readonly INTERNAL_STATE_MANAGER = {
    markAsSaved: (entity: Entity<any>) => entity._changeState(EntityState.SAVED),
    markAsUnchanged: (entity: Entity<any>) => entity._changeState(EntityState.UNCHANGED),
    markAsNew: (entity: Entity<any>) => entity._changeState(EntityState.NEW),
    markAsUpdated: (entity: Entity<any>) => entity._changeState(EntityState.UPDATED),
    markAsDeleted: (entity: Entity<any>) => entity._changeState(EntityState.DELETED),
  }

  static readonly INTERNAL_PROP_MANAGER = {
    setProp: <T extends IEntityProps>(entity: Entity<T>, prop: keyof T, value: T[keyof T]) => {
      entity._props[prop] = value
    },
  }

  static readonly INTERNAL_RELATION_MANAGER = {
    setRelation: <T extends IEntityProps, R extends IEntityRelations, K extends keyof R>(
      entity: Entity<T, R>,
      key: K,
      value: R[K]
    ) => entity.setRelation(key, value),
    getRelation: <T extends IEntityProps, R extends IEntityRelations, K extends keyof R>(
      entity: Entity<T, R>,
      key: K
    ) => entity.getRelation(key),
  }
}
