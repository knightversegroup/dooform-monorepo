import { randomUUID } from 'crypto'

import { BadRequestException, Injectable, Logger, NotFoundException, type OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  TemplateCategory,
  TemplateTier,
  TemplateType,
} from '../../domain/enums/template.enum'

import {
  TemplateTaxonomyModel,
  type TemplateTaxonomyKind,
} from '../../infrastructure/persistence/typeorm/models/template-taxonomy.model'

const KIND_DEFAULTS: Record<TemplateTaxonomyKind, Array<{ code: string; label: string }>> = {
  TYPE: Object.values(TemplateType).map((v) => ({ code: v, label: prettify(v) })),
  TIER: Object.values(TemplateTier).map((v) => ({ code: v, label: prettify(v) })),
  CATEGORY: Object.values(TemplateCategory).map((v) => ({ code: v, label: prettify(v) })),
}

function prettify(code: string): string {
  return code
    .split(/[_-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

export interface UpsertTaxonomyInput {
  kind: TemplateTaxonomyKind
  code: string
  label: string
  description?: string | null
  sortOrder?: number
  enabled?: boolean
}

@Injectable()
export class TemplateTaxonomyService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TemplateTaxonomyService.name)

  constructor(
    @InjectRepository(TemplateTaxonomyModel)
    private readonly repo: Repository<TemplateTaxonomyModel>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults()
  }

  private async seedDefaults(): Promise<void> {
    let inserted = 0
    for (const kind of Object.keys(KIND_DEFAULTS) as TemplateTaxonomyKind[]) {
      const existing = await this.repo.find({ where: { kind } })
      const existingCodes = new Set(existing.map((e) => e.code))
      const toInsert = KIND_DEFAULTS[kind].filter((d) => !existingCodes.has(d.code))
      if (!toInsert.length) continue
      await this.repo.save(
        toInsert.map((d, idx) =>
          this.repo.create({
            id: randomUUID(),
            kind,
            code: d.code,
            label: d.label,
            description: null,
            sortOrder: 100 + idx,
            enabled: true,
          }),
        ),
      )
      inserted += toInsert.length
    }
    if (inserted) this.logger.log(`Seeded ${inserted} template taxonomy entries`)
  }

  async listAll(): Promise<TemplateTaxonomyModel[]> {
    return this.repo.find({ order: { kind: 'ASC', sortOrder: 'ASC', label: 'ASC' } })
  }

  async listByKind(kind: TemplateTaxonomyKind, includeDisabled = false): Promise<TemplateTaxonomyModel[]> {
    return this.repo.find({
      where: includeDisabled ? { kind } : { kind, enabled: true },
      order: { sortOrder: 'ASC', label: 'ASC' },
    })
  }

  async create(input: UpsertTaxonomyInput): Promise<TemplateTaxonomyModel> {
    const code = input.code.trim().toUpperCase().replace(/\s+/g, '_')
    if (!code) throw new BadRequestException('code is required')
    const exists = await this.repo.findOne({ where: { kind: input.kind, code } })
    if (exists) throw new BadRequestException(`${input.kind} code "${code}" already exists`)
    const created = this.repo.create({
      id: randomUUID(),
      kind: input.kind,
      code,
      label: input.label,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 100,
      enabled: input.enabled ?? true,
    })
    return this.repo.save(created)
  }

  async update(id: string, input: Partial<UpsertTaxonomyInput>): Promise<TemplateTaxonomyModel> {
    const row = await this.repo.findOne({ where: { id } })
    if (!row) throw new NotFoundException('Taxonomy entry not found')
    if (input.label !== undefined) row.label = input.label
    if (input.description !== undefined) row.description = input.description ?? null
    if (input.sortOrder !== undefined) row.sortOrder = input.sortOrder
    if (input.enabled !== undefined) row.enabled = input.enabled
    return this.repo.save(row)
  }

  async delete(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } })
    if (!row) throw new NotFoundException('Taxonomy entry not found')
    // Built-in codes (those baked into the enum at compile time) cannot be deleted —
    // documents and templates reference them. Toggle `enabled=false` to hide instead.
    const builtIn = KIND_DEFAULTS[row.kind].some((d) => d.code === row.code)
    if (builtIn) {
      throw new BadRequestException(
        `Built-in ${row.kind} "${row.code}" cannot be deleted. Disable it instead.`,
      )
    }
    await this.repo.softDelete({ id })
  }
}
