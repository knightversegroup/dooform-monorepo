export class OrgPath {
  static for(orgId: string, ...segments: string[]): string {
    return `orgs/${orgId}/${segments.join('/')}`
  }
}
