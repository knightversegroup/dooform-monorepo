import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { InputType } from '../enums/input-type.enum'

export interface DataTypeProps extends IEntityProps {
  /** Stable code referenced by FieldDefinition.dataType (e.g. `email`, `id_number`). */
  code: string
  /** Human-readable label shown in the picker. */
  label: string
  /** Default input control to use on forms when this data type is selected. */
  defaultInputType: InputType
  /** Optional explanation shown to admins/users. */
  description?: string | null
  /** Optional list of `{label, value}` choices when defaultInputType is select/radio. */
  options?: Array<{ label: string; value: string }> | null
  /** Pre-fill value applied to a fresh form input of this data type. */
  defaultValue?: string | null
  /** Quick-pick suggestions offered as chips next to the input. */
  suggestedValues?: string[] | null
  /** Sort order in the picker (smaller = first). */
  sortOrder?: number
  /** True if this is one of the seeded built-in types (cannot be deleted). */
  isBuiltIn: boolean
}

export class DataType extends Entity<DataTypeProps> {
  static create(props: {
    code: string
    label: string
    defaultInputType: InputType
    description?: string | null
    options?: Array<{ label: string; value: string }> | null
    defaultValue?: string | null
    suggestedValues?: string[] | null
    sortOrder?: number
    isBuiltIn?: boolean
  }): DataType {
    return new DataType({
      code: props.code,
      label: props.label,
      defaultInputType: props.defaultInputType,
      description: props.description ?? null,
      options: props.options ?? null,
      defaultValue: props.defaultValue ?? null,
      suggestedValues: props.suggestedValues ?? null,
      sortOrder: props.sortOrder ?? 0,
      isBuiltIn: props.isBuiltIn ?? false,
    })
  }

  get code(): string { return this.getProp('code') }
  get label(): string { return this.getProp('label') }
  get defaultInputType(): InputType { return this.getProp('defaultInputType') }
  get description(): string | null | undefined { return this.getProp('description') }
  get options(): Array<{ label: string; value: string }> | null | undefined {
    return this.getProp('options')
  }
  get defaultValue(): string | null | undefined { return this.getProp('defaultValue') }
  get suggestedValues(): string[] | null | undefined {
    return this.getProp('suggestedValues')
  }
  get sortOrder(): number { return this.getProp('sortOrder') ?? 0 }
  get isBuiltIn(): boolean { return !!this.getProp('isBuiltIn') }

  rename(label: string): void { this.updateProp('label', label) }
  setDefaultInputType(t: InputType): void { this.updateProp('defaultInputType', t) }
  setDescription(d: string | null): void { this.updateProp('description', d) }
  setOptions(o: Array<{ label: string; value: string }> | null): void {
    this.updateProp('options', o)
  }
  setDefaultValue(v: string | null): void { this.updateProp('defaultValue', v) }
  setSuggestedValues(v: string[] | null): void {
    this.updateProp('suggestedValues', v)
  }
  setSortOrder(n: number): void { this.updateProp('sortOrder', n) }
}
