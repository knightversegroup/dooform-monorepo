import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('dictionary_entries')
@Index(['collectionId'])
@Index(['collectionId', 'term'])
export class DictionaryEntryModel extends BaseTypeOrmModel {
  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId!: string

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string

  @Column({ type: 'varchar', length: 255 })
  term!: string

  @Column({ name: 'term_th', type: 'varchar', length: 255, nullable: true })
  termTh!: string | null

  @Column({ type: 'text' })
  definition!: string

  @Column({ name: 'definition_th', type: 'text', nullable: true })
  definitionTh!: string | null

  @Column({ type: 'jsonb', nullable: true })
  tags!: string[] | null
}
