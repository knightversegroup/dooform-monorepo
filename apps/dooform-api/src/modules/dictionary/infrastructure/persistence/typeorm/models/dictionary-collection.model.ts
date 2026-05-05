import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DictionaryScope, DictionaryStatus } from '../../../../domain/enums/dictionary.enum'

@Entity('dictionary_collections')
@Index(['organizationId', 'scope'])
@Index(['ownerUserId', 'scope'])
@Index(['scope', 'status'])
export class DictionaryCollectionModel extends BaseTypeOrmModel {
  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({
    type: 'enum',
    enum: DictionaryScope,
    default: DictionaryScope.PERSONAL,
  })
  scope!: DictionaryScope

  @Column({
    type: 'enum',
    enum: DictionaryStatus,
    default: DictionaryStatus.PUBLISHED,
  })
  status!: DictionaryStatus

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null
}
