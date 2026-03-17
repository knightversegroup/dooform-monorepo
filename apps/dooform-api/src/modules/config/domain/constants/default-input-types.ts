import type { InputTypeModel } from '../../infrastructure/persistence/typeorm/models/input-type.model'

type DefaultInputType = Pick<InputTypeModel, 'id' | 'code' | 'name' | 'description' | 'priority' | 'isActive'>

export const DEFAULT_INPUT_TYPES: DefaultInputType[] = [
  { id: 'it_text', code: 'text', name: 'Text', description: 'Single line text input', priority: 100, isActive: true },
  { id: 'it_textarea', code: 'textarea', name: 'Textarea', description: 'Multi-line text input', priority: 95, isActive: true },
  { id: 'it_number', code: 'number', name: 'Number', description: 'Numeric input', priority: 90, isActive: true },
  { id: 'it_email', code: 'email', name: 'Email', description: 'Email address input', priority: 85, isActive: true },
  { id: 'it_tel', code: 'tel', name: 'Telephone', description: 'Phone number input', priority: 80, isActive: true },
  { id: 'it_date', code: 'date', name: 'Date', description: 'Date picker', priority: 75, isActive: true },
  { id: 'it_time', code: 'time', name: 'Time', description: 'Time picker', priority: 70, isActive: true },
  { id: 'it_datetime', code: 'datetime-local', name: 'Date & Time', description: 'Date and time picker', priority: 68, isActive: true },
  { id: 'it_select', code: 'select', name: 'Dropdown', description: 'Single selection dropdown', priority: 65, isActive: true },
  { id: 'it_multiselect', code: 'multiselect', name: 'Multi-select', description: 'Multiple selection', priority: 60, isActive: true },
  { id: 'it_checkbox', code: 'checkbox', name: 'Checkbox', description: 'Yes/No checkbox', priority: 55, isActive: true },
  { id: 'it_radio', code: 'radio', name: 'Radio', description: 'Radio button group', priority: 50, isActive: true },
  { id: 'it_url', code: 'url', name: 'URL', description: 'Web address input', priority: 45, isActive: true },
  { id: 'it_file', code: 'file', name: 'File', description: 'File upload', priority: 40, isActive: true },
  { id: 'it_image', code: 'image', name: 'Image', description: 'Image upload', priority: 38, isActive: true },
  { id: 'it_signature', code: 'signature', name: 'Signature', description: 'Digital signature pad', priority: 35, isActive: true },
  { id: 'it_hidden', code: 'hidden', name: 'Hidden', description: 'Hidden field', priority: 10, isActive: true },
]
