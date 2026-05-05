import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { DataType } from '../../../domain/entities/data-type.entity'
import { InputType } from '../../../domain/enums/input-type.enum'
import type { IDataTypeRepository } from '../../../domain/repositories/data-type.repository'

interface ListDataTypesResult {
  data: Array<{
    id: string
    code: string
    label: string
    defaultInputType: InputType
    description: string | null | undefined
    options: Array<{ label: string; value: string }> | null | undefined
    defaultValue: string | null | undefined
    suggestedValues: string[] | null | undefined
    sortOrder: number
    isBuiltIn: boolean
    createdAt: Date | undefined
    updatedAt: Date | undefined
  }>
}

/**
 * Built-in catalogue. The first call to this use case auto-seeds the table when it
 * is empty so a brand-new install gets a sensible default set of data types.
 */
const SEED: Array<{
  code: string
  label: string
  defaultInputType: InputType
  description?: string
  defaultValue?: string
  suggestedValues?: string[]
  sortOrder: number
}> = [
  { code: 'text',         label: 'Free text',          defaultInputType: InputType.TEXT,            sortOrder: 10 },
  { code: 'long_text',    label: 'Paragraph',          defaultInputType: InputType.TEXTAREA,        sortOrder: 20 },
  { code: 'name',         label: 'Person name',        defaultInputType: InputType.TEXT,            sortOrder: 30 },
  { code: 'name_prefix',  label: 'Name prefix',        defaultInputType: InputType.SELECT,          sortOrder: 35,
    suggestedValues: ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'] },
  { code: 'email',        label: 'Email',              defaultInputType: InputType.EMAIL,           sortOrder: 40 },
  { code: 'phone',        label: 'Phone number',       defaultInputType: InputType.TEL,             sortOrder: 50 },
  { code: 'id_number',    label: 'National ID',        defaultInputType: InputType.TEXT,            sortOrder: 60 },
  { code: 'address',      label: 'Address',            defaultInputType: InputType.TEXTAREA,        sortOrder: 70 },
  { code: 'province',     label: 'Province',           defaultInputType: InputType.TEXT,            sortOrder: 75 },
  { code: 'district',     label: 'District',           defaultInputType: InputType.TEXT,            sortOrder: 76 },
  { code: 'subdistrict',  label: 'Sub-district',       defaultInputType: InputType.TEXT,            sortOrder: 77 },
  { code: 'postal_code',  label: 'Postal code',        defaultInputType: InputType.TEXT,            sortOrder: 80 },
  { code: 'country',      label: 'Country',            defaultInputType: InputType.SELECT,          sortOrder: 85,
    defaultValue: 'Thailand',
    suggestedValues: ['Thailand', 'Japan', 'Singapore', 'United States'] },
  { code: 'date',         label: 'Date',               defaultInputType: InputType.DATE,            sortOrder: 100 },
  { code: 'time',         label: 'Time',               defaultInputType: InputType.TIME,            sortOrder: 110 },
  { code: 'datetime',     label: 'Date & time',        defaultInputType: InputType.DATETIME_LOCAL,  sortOrder: 120 },
  { code: 'number',       label: 'Number',             defaultInputType: InputType.NUMBER,          sortOrder: 130 },
  { code: 'currency',     label: 'Currency amount',    defaultInputType: InputType.NUMBER,          sortOrder: 140 },
  { code: 'percentage',   label: 'Percentage',         defaultInputType: InputType.NUMBER,          sortOrder: 150 },
  { code: 'url',          label: 'URL',                defaultInputType: InputType.URL,             sortOrder: 160 },
  { code: 'choice',       label: 'Choice (options)',   defaultInputType: InputType.SELECT,          sortOrder: 170 },
  { code: 'boolean',      label: 'Yes / No',           defaultInputType: InputType.CHECKBOX,        sortOrder: 180,
    suggestedValues: ['Yes', 'No'] },
]

@Injectable()
@UseClassLogger('field-types')
export class ListDataTypesUseCase implements UseCase<void, ListDataTypesResult> {
  constructor(
    @Inject('IDataTypeRepository')
    private readonly repo: IDataTypeRepository,
  ) {}

  @UseResult()
  async execute(): Promise<Result<ListDataTypesResult>> {
    const count = await this.repo.countAll()
    if (count === 0) {
      for (const seed of SEED) {
        const dt = DataType.create({
          code: seed.code,
          label: seed.label,
          defaultInputType: seed.defaultInputType,
          defaultValue: seed.defaultValue ?? null,
          suggestedValues: seed.suggestedValues ?? null,
          sortOrder: seed.sortOrder,
          isBuiltIn: true,
        })
        await this.repo.save(dt)
      }
    }
    const items = await this.repo.findAll()
    return {
      data: items.map((dt) => {
        const p = dt.getProps()
        return {
          id: dt.id,
          code: p.code,
          label: p.label,
          defaultInputType: p.defaultInputType,
          description: p.description,
          options: p.options,
          defaultValue: p.defaultValue,
          suggestedValues: p.suggestedValues,
          sortOrder: p.sortOrder ?? 0,
          isBuiltIn: !!p.isBuiltIn,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }
      }),
    } as any
  }
}
