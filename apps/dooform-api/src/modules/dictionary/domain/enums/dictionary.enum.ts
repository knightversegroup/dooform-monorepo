export enum DictionaryScope {
  PERSONAL = 'PERSONAL',
  ORGANIZATION = 'ORGANIZATION',
  GLOBAL = 'GLOBAL',
}

/**
 * Lifecycle for dictionary entries. Personal/Organization entries default to PUBLISHED
 * (no review needed) while GLOBAL entries are drafted by a GLOBAL_ADMIN and only become
 * visible to other tenants once PUBLISHED — this is the marketplace listing flag.
 *
 * Purchase / acquisition of GLOBAL entries by an org is intentionally deferred; for now
 * any authenticated user can see PUBLISHED global entries in a read-only "Marketplace" view.
 */
export enum DictionaryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}
