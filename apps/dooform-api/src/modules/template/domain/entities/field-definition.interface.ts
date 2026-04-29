export interface FieldValidation {
  pattern?: string
  min?: number
  max?: number
  options?: string[]
}

export interface RadioOption {
  label: string
  value: string
}

export interface FieldDefinition {
  placeholder: string
  dataType: string
  entity?: string
  inputType?: string
  validation?: FieldValidation
  label?: string
  description?: string
  group?: string
  groupOrder?: number
  order?: number
  defaultValue?: string
  isMerged?: boolean
  mergedFields?: string[]
  separator?: string
  mergePattern?: string
  isRadioGroup?: boolean
  radioGroupId?: string
  radioOptions?: RadioOption[]
}
