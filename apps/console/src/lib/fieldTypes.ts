/**
 * Catalogue of data types a placeholder can be tagged with. Each maps to a default
 * input control. The console uses this list to drive the per-placeholder data-type
 * picker on the template configure-fields page.
 */
export interface DataTypeDef {
  code: string;
  label: string;
  /** Default input control to use when this data type is selected. */
  inputType: InputTypeCode;
  description?: string;
}

export type InputTypeCode =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'email'
  | 'tel'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface InputTypeDef {
  code: InputTypeCode;
  label: string;
}

export const DATA_TYPES: DataTypeDef[] = [
  { code: 'text',         label: 'Free text',          inputType: 'text' },
  { code: 'long_text',    label: 'Paragraph',          inputType: 'textarea' },
  { code: 'name',         label: 'Person name',        inputType: 'text' },
  { code: 'name_prefix',  label: 'Name prefix (Mr./Ms.)', inputType: 'select' },
  { code: 'email',        label: 'Email',              inputType: 'email' },
  { code: 'phone',        label: 'Phone number',       inputType: 'tel' },
  { code: 'id_number',    label: 'National ID',        inputType: 'text' },
  { code: 'house_code',   label: 'House code',         inputType: 'text' },
  { code: 'address',      label: 'Address',            inputType: 'textarea' },
  { code: 'province',     label: 'Province',           inputType: 'text' },
  { code: 'district',     label: 'District',           inputType: 'text' },
  { code: 'subdistrict',  label: 'Sub-district',       inputType: 'text' },
  { code: 'postal_code',  label: 'Postal code',        inputType: 'text' },
  { code: 'country',      label: 'Country',            inputType: 'select' },
  { code: 'date',         label: 'Date',               inputType: 'date' },
  { code: 'time',         label: 'Time',               inputType: 'time' },
  { code: 'datetime',     label: 'Date & time',        inputType: 'datetime-local' },
  { code: 'weekday',      label: 'Weekday',            inputType: 'select' },
  { code: 'lunar_month',  label: 'Lunar month',        inputType: 'select' },
  { code: 'zodiac',       label: 'Zodiac sign',        inputType: 'select' },
  { code: 'number',       label: 'Number',             inputType: 'number' },
  { code: 'currency',     label: 'Currency amount',    inputType: 'number' },
  { code: 'percentage',   label: 'Percentage',         inputType: 'number' },
  { code: 'url',          label: 'URL',                inputType: 'text' },
  { code: 'officer_name', label: 'Officer name',       inputType: 'select' },
  { code: 'choice',       label: 'Choice (options)',   inputType: 'select' },
  { code: 'boolean',      label: 'Yes / No',           inputType: 'checkbox' },
];

export const INPUT_TYPES: InputTypeDef[] = [
  { code: 'text',           label: 'Text input' },
  { code: 'textarea',       label: 'Multi-line text' },
  { code: 'number',         label: 'Number' },
  { code: 'date',           label: 'Date picker' },
  { code: 'datetime-local', label: 'Date & time' },
  { code: 'time',           label: 'Time' },
  { code: 'email',          label: 'Email' },
  { code: 'tel',            label: 'Phone' },
  { code: 'select',         label: 'Dropdown' },
  { code: 'radio',          label: 'Radio group' },
  { code: 'checkbox',       label: 'Checkbox' },
];

export const DATA_TYPE_BY_CODE = new Map(DATA_TYPES.map((d) => [d.code, d]));
export const INPUT_TYPE_BY_CODE = new Map(INPUT_TYPES.map((i) => [i.code, i]));

export function defaultInputForDataType(code: string): InputTypeCode {
  return DATA_TYPE_BY_CODE.get(code)?.inputType ?? 'text';
}
