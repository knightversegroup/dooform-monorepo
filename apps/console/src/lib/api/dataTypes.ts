import { http } from './client';

export type InputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'email'
  | 'tel'
  | 'url'
  | 'select'
  | 'radio'
  | 'checkbox';

export const INPUT_TYPE_OPTIONS: { code: InputType; label: string }[] = [
  { code: 'text',           label: 'Text input' },
  { code: 'textarea',       label: 'Multi-line text' },
  { code: 'number',         label: 'Number' },
  { code: 'date',           label: 'Date picker' },
  { code: 'datetime-local', label: 'Date & time' },
  { code: 'time',           label: 'Time' },
  { code: 'email',          label: 'Email' },
  { code: 'tel',            label: 'Phone' },
  { code: 'url',            label: 'URL' },
  { code: 'select',         label: 'Dropdown' },
  { code: 'radio',          label: 'Radio group' },
  { code: 'checkbox',       label: 'Checkbox' },
];

export interface DataTypeOption {
  value: string;
  label: string;
}

export interface DataTypeDto {
  id: string;
  code: string;
  label: string;
  defaultInputType: InputType;
  description?: string | null;
  /** Choices for select/radio data types (e.g. Sex → [Male, Female]). */
  options?: DataTypeOption[] | null;
  /** Pre-fill value applied when a fresh form input gets this data type. */
  defaultValue?: string | null;
  /** Quick-pick suggestions offered as chips next to the input. */
  suggestedValues?: string[] | null;
  sortOrder: number;
  isBuiltIn: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function listDataTypes() {
  return http.get<{ data: DataTypeDto[] }>('/v1/field-types/data-types');
}

export function createDataType(input: {
  code: string;
  label: string;
  defaultInputType: InputType;
  description?: string | null;
  options?: DataTypeOption[] | null;
  defaultValue?: string | null;
  suggestedValues?: string[] | null;
  sortOrder?: number;
}) {
  return http.post<{ id: string; code: string }>(
    '/v1/field-types/data-types',
    { body: input },
  );
}

export function updateDataType(
  id: string,
  input: {
    label?: string;
    defaultInputType?: InputType;
    description?: string | null;
    options?: DataTypeOption[] | null;
    defaultValue?: string | null;
    suggestedValues?: string[] | null;
    sortOrder?: number;
  },
) {
  return http.patch<{ id: string }>(
    `/v1/field-types/data-types/${id}`,
    { body: input },
  );
}

export function deleteDataType(id: string) {
  return http.delete<{ ok: true }>(`/v1/field-types/data-types/${id}`);
}
