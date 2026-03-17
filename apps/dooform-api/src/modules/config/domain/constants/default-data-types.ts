import type { DataTypeModel } from '../../infrastructure/persistence/typeorm/models/data-type.model'

type DefaultDataType = Pick<DataTypeModel, 'id' | 'code' | 'name' | 'description' | 'pattern' | 'inputType' | 'validation' | 'options' | 'priority' | 'isActive'>

export const DEFAULT_DATA_TYPES: DefaultDataType[] = [
  { id: 'dt_text', code: 'text', name: 'Text', description: 'General text input', pattern: '', inputType: 'text', priority: 0, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_name', code: 'name', name: 'Name', description: "Person's name", pattern: '(name|ชื่อ|นาม)', inputType: 'text', priority: 100, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_email', code: 'email', name: 'Email', description: 'Email address', pattern: '(email|อีเมล|mail)', inputType: 'email', priority: 90, isActive: true, validation: '{"type":"email"}', options: '[]' },
  { id: 'dt_phone', code: 'phone', name: 'Phone Number', description: 'Phone number', pattern: '(phone|โทรศัพท์|mobile|tel|เบอร์)', inputType: 'tel', priority: 85, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_address', code: 'address', name: 'Address', description: 'Physical address', pattern: '(address|ที่อยู่|addr)', inputType: 'textarea', priority: 80, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_date', code: 'date', name: 'Date', description: 'Date field', pattern: '(date|วันที่|dob|birth)', inputType: 'date', priority: 75, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_number', code: 'number', name: 'Number', description: 'Numeric value', pattern: '(number|amount|qty|quantity|จำนวน|ราคา|price)', inputType: 'number', priority: 70, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_currency', code: 'currency', name: 'Currency', description: 'Currency amount', pattern: '(currency|เงิน|บาท|baht|thb|price|ราคา)', inputType: 'number', priority: 68, isActive: true, validation: '{"min":0}', options: '[]' },
  { id: 'dt_percentage', code: 'percentage', name: 'Percentage', description: 'Percentage value', pattern: '(percent|เปอร์เซ็นต์|%)', inputType: 'number', priority: 65, isActive: true, validation: '{"min":0,"max":100}', options: '[]' },
  { id: 'dt_id_card', code: 'id_card', name: 'ID Card', description: 'Thai ID card number', pattern: '(id.?card|บัตรประชาชน|เลขบัตร|citizen)', inputType: 'text', priority: 95, isActive: true, validation: '{"pattern":"^[0-9]{13}$"}', options: '[]' },
  { id: 'dt_passport', code: 'passport', name: 'Passport', description: 'Passport number', pattern: '(passport|หนังสือเดินทาง)', inputType: 'text', priority: 88, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_company', code: 'company', name: 'Company', description: 'Company/Organization name', pattern: '(company|บริษัท|organization|org|หน่วยงาน)', inputType: 'text', priority: 82, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_tax_id', code: 'tax_id', name: 'Tax ID', description: 'Tax identification number', pattern: '(tax.?id|เลขประจำตัวผู้เสียภาษี|tin)', inputType: 'text', priority: 78, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_bank_account', code: 'bank_account', name: 'Bank Account', description: 'Bank account number', pattern: '(bank.?account|เลขบัญชี|account.?no)', inputType: 'text', priority: 72, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_gender', code: 'gender', name: 'Gender', description: 'Gender selection', pattern: '(gender|เพศ|sex)', inputType: 'select', priority: 60, isActive: true, validation: '{}', options: '[{"value":"male","label":"ชาย"},{"value":"female","label":"หญิง"},{"value":"other","label":"อื่นๆ"}]' },
  { id: 'dt_title', code: 'title', name: 'Title/Prefix', description: 'Name prefix', pattern: '(title|prefix|คำนำหน้า)', inputType: 'select', priority: 105, isActive: true, validation: '{}', options: '[{"value":"mr","label":"นาย"},{"value":"mrs","label":"นาง"},{"value":"ms","label":"นางสาว"},{"value":"dr","label":"ดร."}]' },
  { id: 'dt_nationality', code: 'nationality', name: 'Nationality', description: 'Nationality', pattern: '(nationality|สัญชาติ|nation)', inputType: 'text', priority: 55, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_occupation', code: 'occupation', name: 'Occupation', description: 'Job/Occupation', pattern: '(occupation|อาชีพ|job|profession)', inputType: 'text', priority: 50, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_url', code: 'url', name: 'URL', description: 'Web URL', pattern: '(url|website|เว็บไซต์|link)', inputType: 'url', priority: 45, isActive: true, validation: '{"type":"url"}', options: '[]' },
  { id: 'dt_time', code: 'time', name: 'Time', description: 'Time field', pattern: '(time|เวลา)', inputType: 'time', priority: 40, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_datetime', code: 'datetime', name: 'Date & Time', description: 'Date and time combined', pattern: '(datetime|วันเวลา)', inputType: 'datetime-local', priority: 38, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_checkbox', code: 'checkbox', name: 'Checkbox', description: 'Yes/No checkbox', pattern: '(agree|ยินยอม|confirm|ยืนยัน|accept)', inputType: 'checkbox', priority: 35, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_signature', code: 'signature', name: 'Signature', description: 'Digital signature', pattern: '(signature|ลายเซ็น|sign)', inputType: 'signature', priority: 30, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_file', code: 'file', name: 'File Upload', description: 'File attachment', pattern: '(file|upload|แนบไฟล์|attachment)', inputType: 'file', priority: 25, isActive: true, validation: '{}', options: '[]' },
  { id: 'dt_image', code: 'image', name: 'Image', description: 'Image upload', pattern: '(image|photo|รูปภาพ|picture)', inputType: 'image', priority: 28, isActive: true, validation: '{}', options: '[]' },
]
