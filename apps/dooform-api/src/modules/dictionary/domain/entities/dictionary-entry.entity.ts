import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface DictionaryEntryProps extends IEntityProps {
  collectionId: string
  term: string
  termTh?: string | null
  definition: string
  definitionTh?: string | null
  tags?: string[] | null
  ownerUserId: string
}

/**
 * A single dictionary card. Visibility / status / edit rights all derive from the
 * parent `DictionaryCollection` — the entry only carries content + which collection
 * it belongs to + who added it (for audit attribution).
 */
export class DictionaryEntry extends Entity<DictionaryEntryProps> {
  static create(props: {
    collectionId: string
    term: string
    termTh?: string | null
    definition: string
    definitionTh?: string | null
    tags?: string[] | null
    ownerUserId: string
  }): DictionaryEntry {
    return new DictionaryEntry({
      collectionId: props.collectionId,
      term: props.term,
      termTh: props.termTh ?? null,
      definition: props.definition,
      definitionTh: props.definitionTh ?? null,
      tags: props.tags ?? null,
      ownerUserId: props.ownerUserId,
    })
  }

  get collectionId(): string {
    return this.getProps().collectionId
  }
  get term(): string {
    return this.getProps().term
  }
  get ownerUserId(): string {
    return this.getProps().ownerUserId
  }

  updateTerm(term: string): void {
    this.updateProp('term', term)
  }
  updateTermTh(termTh: string | null): void {
    this.updateProp('termTh', termTh)
  }
  updateDefinition(definition: string): void {
    this.updateProp('definition', definition)
  }
  updateDefinitionTh(definitionTh: string | null): void {
    this.updateProp('definitionTh', definitionTh)
  }
  updateTags(tags: string[] | null): void {
    this.updateProp('tags', tags)
  }
}
