export interface FieldValidation {
  pattern?: string
  min?: number
  max?: number
  options?: string[]
}

export interface RadioOption {
  /** The bracket placeholder this option fills in the DOCX (e.g. `S_1_1`). */
  placeholder: string
  /** Display label shown next to the radio button. */
  label?: string
  /** Tick character written into the chosen placeholder; others get an empty string. */
  value?: string
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
